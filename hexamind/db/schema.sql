-- ============================================================
-- 1. 用户资料表（关联 auth.users）
-- ============================================================
create table if not exists public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    name text,
    email text,
    avatar_url text,
    provider text, -- 'google' | 'apple'
    tier text not null default 'Free' check (tier in ('Free', 'Pro')),
    daily_query_count integer not null default 0,
    daily_query_date date, -- 记录当天的配额日期
    last_query_at timestamptz, -- 最后查询时间（用于 cooldown）
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 新用户注册时自动创建 profile
create or replace function public.handle_new_user()
   returns trigger
   language plpgsql
   security definer set search_path = ''
   as $$
   begin
       insert into public.profiles (id, name, email, avatar_url, provider)
       values (
           new.id,
           coalesce(new.raw_user_meta_data ->> 'name', new.email),
           new.email,
           new.raw_user_meta_data ->> 'avatar_url',
           new.raw_user_meta_data ->> 'provider'
       );
       return new;
   end;
   $$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
       after insert on auth.users
       for each row execute function public.handle_new_user();

-- ============================================================
-- 2. 占卜历史记录表（divinations）
-- ============================================================
create table if not exists public.divinations (
       id                uuid primary key default gen_random_uuid(),
       user_id           uuid not null references public.profiles(id) on delete cascade,

-- 用户输入
question text not null, language text not null default 'en',

-- 三才种子
temporal_seed_raw bigint not null, -- timestamp 原始值
temporal_seed_hex text, -- 十六进制
latitude double precision not null default 31.23,
longitude double precision not null default 121.47,
spatial_seed_formatted text,
kinetic_seed_raw double precision not null default 1.23,

-- 本卦 / 互卦 / 变卦
original_chart_name text not null, -- 如 "乾为天"
original_chart_english text,
original_chart_symbol text, -- 卦符号
original_chart_lines jsonb, -- [1,1,1,1,1,1]
original_upper_trigram jsonb,
original_lower_trigram jsonb,
nuclear_chart_name text,
nuclear_chart_english text,
nuclear_chart_symbol text,
nuclear_chart_lines jsonb,
nuclear_upper_trigram jsonb,
nuclear_lower_trigram jsonb,
transformed_chart_name text,
transformed_chart_english text,
transformed_chart_symbol text,
transformed_chart_lines jsonb,
transformed_upper_trigram jsonb,
transformed_lower_trigram jsonb,

-- 动爻
changing_line integer not null check (changing_line between 1 and 6),

-- 体用
ti_gua_role text not null, -- 'Upper' | 'Lower'
ti_trigram_id integer not null, -- 1-8
ti_trigram_name text, -- 冗余方便查询
ti_element text,
yong_gua_role text not null,
yong_trigram_id integer not null,
yong_trigram_name text,
yong_element text,

-- 体用生克关系
relationship_type text not null,
relationship_conclusion text not null, -- "用生体" | "体用比和" | "体生用" | "体克用" | "用克体"
relationship_auspiciousness text not null,
relationship_chinese_interpretation text,

-- 三才置信度（San-Cai Confidence）
confidence_score double precision,

-- AI 输出
ai_verdict text, -- "Critical Advantage" | "Neutral/Stagnant" | "High Risk"
ai_analysis text, -- markdown 格式分析
ai_tactical_actions jsonb, -- string[]
ai_phenomenological_echo text,
ai_catalyst_window text,

-- 元信息
created_at timestamptz not null default now() );

-- 索引
create index if not exists idx_divinations_user_id on public.divinations (user_id);

create index if not exists idx_divinations_created_at on public.divinations (created_at desc);

create index if not exists idx_divinations_user_created on public.divinations (user_id, created_at desc);

-- ============================================================
-- 3. Hexa AI 聊天记录表
-- ============================================================
create table if not exists public.chat_messages (
    id uuid primary key default gen_random_uuid (),
    divination_id uuid not null references public.divinations (id) on delete cascade,
    user_id uuid not null references public.profiles (id) on delete cascade,
    role text not null check (role in ('user', 'model')),
    content text not null,
    created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_divination on public.chat_messages (divination_id, created_at);

-- ============================================================
-- 4. 订阅记录表（为 Stripe / Apple Pay 预留）
-- ============================================================
create table if not exists public.subscriptions (
    id uuid primary key default gen_random_uuid (),
    user_id uuid not null references public.profiles (id) on delete cascade unique,
    tier text not null check (tier in ('Free', 'Pro')),
    stripe_customer_id text,
    stripe_subscription_id text,
    status text not null default 'active' check (
        status in (
            'active',
            'canceled',
            'expired',
            'trialing'
        )
    ),
    trial_ends_at timestamptz,
    current_period_start timestamptz,
    current_period_end timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- 5. 每日查询配额视图（方便统计）
-- ============================================================
create or replace view public.daily_query_stats as
select
    p.id as user_id,
    p.tier,
    p.daily_query_count,
    p.daily_query_date,
    p.last_query_at,
    case
        when p.tier = 'Pro' then 1000
        else 3
    end as daily_limit
from public.profiles p;
-- ============================================================
-- 在 prisma db push 执行之后，在 Supabase SQL Editor 执行此文件
-- ============================================================

-- 1. profiles.id → auth.users.id 外键（Prisma 无法管理跨 schema 引用）
alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

-- 2. 新用户注册时自动创建 profile
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

-- 3. 每日配额视图
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

-- 4. ⚠️ 如果之前跑过 `alter column set default auth.uid()`，需要回退
-- alter table public.divinations alter column user_id drop default;

-- ============================================================
-- RLS 策略：允许用户读写自己的数据
-- 注意：auth.uid() 返回 uuid 类型，而表字段是 text，需要 ::text 转换
-- 在 Supabase Dashboard → SQL Editor 执行
-- ============================================================

-- 1. subscriptions：用户只能查看自己的订阅记录
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- 允许 service_role 写入（已默认允许，此策略只为 anon/authenticated）

-- 2. profiles：用户只能查看和更新自己的资料
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid()::text)
  WITH CHECK (id = auth.uid()::text);

-- 3. 首次登录时允许用户插入自己的 profile（auth 回调触发）
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid()::text);

-- 4. divinations：用户只能查看自己的占卜记录
DROP POLICY IF EXISTS "Users can view own divinations" ON divinations;
CREATE POLICY "Users can view own divinations"
  ON divinations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

-- 5. chat_messages：用户只能查看自己的聊天记录
DROP POLICY IF EXISTS "Users can view own chat messages" ON chat_messages;
CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()::text);

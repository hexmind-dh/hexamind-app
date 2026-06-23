/**
 * Server-only Supabase 客户端（使用 service_role key，绕过 RLS）
 * 仅在 API routes 中使用，不能在客户端 import
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL')
}
if (!serviceRoleKey) {
  throw new Error(
    'Missing SUPABASE_SERVICE_ROLE_KEY. ' +
    '请在 .env 中添加: SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key\n' +
    '从 Supabase Dashboard → Settings → API → service_role key 获取',
  )
}

export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey)

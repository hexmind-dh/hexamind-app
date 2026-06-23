// @ts-nocheck
// Supabase Edge Function: 验证 Checkout Session 并激活 Pro 会员
//
// 调用: supabase.functions.invoke('stripe-verify-session', { body: { sessionId: 'cs_test_xxx' } })
// 部署: supabase functions deploy stripe-verify-session --no-verify-jwt
//
// 支付成功后由前端 success 页调用，立即激活会员
// 无需等待 Webhook，Webhook 作为兜底

import Stripe from 'npm:stripe@17.6.0'
import { createClient } from 'npm:@supabase/supabase-js@2.49.4'
import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  }

  try {
    // 1. 验证用户
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers, status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { headers, status: 401 })
    }

    // 2. 解析请求
    const { sessionId } = await req.json()
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'sessionId is required' }), { headers, status: 400 })
    }

    // 3. 向 Stripe 验证 Session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return new Response(JSON.stringify({
        error: 'Payment not completed',
        paymentStatus: session.payment_status,
      }), { headers, status: 400 })
    }

    // 4. 验证 session 属于当前用户
    if (session.metadata?.supabase_user_id !== user.id &&
      session.client_reference_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Session does not belong to this user' }), {
        headers,
        status: 403,
      })
    }

    // 5. 获取 subscription 信息
    let subscriptionId: string | null = null
    let periodStart: string | null = null
    let periodEnd: string | null = null
    let status: string = 'active'

    if (session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      subscriptionId = sub.id
      periodStart = new Date(sub.current_period_start * 1000).toISOString()
      periodEnd = new Date(sub.current_period_end * 1000).toISOString()
      status = sub.status === 'active' ? 'active' : 'trialing'
    }

    // 6. 写入 Supabase（用 upsert 避免唯一约束冲突）
    // 注意: id 必须显式传入，数据库列可能没有 DEFAULT 值
    const subPayload = {
      id: crypto.randomUUID(),
      user_id: user.id,
      tier: 'Pro',
      status,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: subscriptionId,
      current_period_start: periodStart,
      current_period_end: periodEnd,
    }

    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert(subPayload, { onConflict: 'user_id' })

    if (subError) {
      console.error('Failed to upsert subscription:', JSON.stringify(subError))
      return new Response(JSON.stringify({ error: 'DB write failed' }), {
        headers,
        status: 500,
      })
    }

    // 7. 升级 user profile（必须成功）
    const { error: profileError, data: updatedProfile } = await supabase
      .from('profiles')
      .update({ tier: 'Pro' })
      .eq('id', user.id)
      .select('tier')
      .single()

    if (profileError) {
      console.error('Failed to update profile:', JSON.stringify(profileError))
      return new Response(JSON.stringify({ error: 'Profile update failed' }), {
        headers,
        status: 500,
      })
    }

    console.log('Profile updated:', updatedProfile?.tier)

    return new Response(JSON.stringify({
      success: true,
      tier: updatedProfile?.tier ?? 'Pro',
      subscriptionId,
    }), { headers, status: 200 })

  } catch (err) {
    console.error('stripe-verify-session error:', err)
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : 'Internal server error',
    }), { headers, status: 500 })
  }
})

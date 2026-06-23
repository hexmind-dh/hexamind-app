// @ts-nocheck
// Supabase Edge Function: Stripe Checkout Session 创建
//
// 调用: supabase.functions.invoke('stripe-create-checkout', { body: { platform: 'app'|'web' } })
// 部署: supabase functions deploy stripe-create-checkout --no-verify-jwt
//
// 价格在函数中硬编码，不需要先在 Stripe Dashboard 创建 Product
//
// 环境变量:
//   STRIPE_SECRET_KEY   (必填) Stripe API Secret Key
//   PUBLIC_SITE_URL     (Web 必填) 公网地址，如 https://app.hexamind.com

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

/** ===== 价格配置 =====
 *  修改这里即可调整订阅价格，无需操作 Stripe Dashboard
 *  Stripe 会自动创建对应的 Product 和 Price 记录 */
const PRO_PRICE = {
  currency: 'cny',               // 货币: usd / cny / etc.
  unitAmount: 1,              // 金额（分）：9900 = ¥99.00 / 999 = $9.99
  interval: 'month' as const,    // 周期: month / year
  name: 'HexaMind Pro',
  description: '无限次占卜 + AI 深度分析',
}

serve(async (req) => {
  // CORS 预检
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

    // 2. 解析请求（只需 platform，不再需要 priceId）
    const { platform = 'app' } = await req.json()

    // 3. 检查是否已有有效订阅
    // 必须 profiles.tier = Pro AND subscriptions 有 active 记录，才算会员
    const { data: profile } = await supabase
      .from('profiles')
      .select('tier')
      .eq('id', user.id)
      .single()

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle()

    const isActiveMember =
      profile?.tier === 'Pro' &&
      (sub?.status === 'active' || sub?.status === 'trialing')

    if (isActiveMember) {
      return new Response(JSON.stringify({ error: 'Already a Pro member' }), { headers, status: 409 })
    }

    // 如果 profiles.tier = Pro 但无有效订阅 → 修复状态
    if (profile?.tier === 'Pro' && (!sub || sub.status !== 'active')) {
      console.warn('Fixing stale Pro tier for user:', user.id)
      await supabase.from('profiles').update({ tier: 'Free' }).eq('id', user.id)
    }

    // 4. 查找或创建 Stripe Customer
    const customers = await stripe.customers.list({ email: user.email!, limit: 1 })
    let customer = customers.data[0]
    if (!customer) {
      customer = await stripe.customers.create({
        email: user.email!,
        name: user.email?.split('@')[0] ?? 'User',
        metadata: { supabase_user_id: user.id },
      })
    }

    // 5. 构建回调 URL
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL')
    const successUrl = platform === 'app'
      ? 'hexamind://payment/success?session_id={CHECKOUT_SESSION_ID}'
      : `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`

    const cancelUrl = platform === 'app'
      ? 'hexamind://payment/cancel'
      : `${siteUrl}/payment/cancel`

    // 6. 创建 Checkout Session（用 price_data 内联定义价格）
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: PRO_PRICE.currency,
            product_data: {
              name: PRO_PRICE.name,
              description: PRO_PRICE.description,
            },
            unit_amount: PRO_PRICE.unitAmount,
            recurring: { interval: PRO_PRICE.interval },
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { supabase_user_id: user.id },
      client_reference_id: user.id,
    })

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), { headers, status: 200 })

  } catch (err) {
    console.error('stripe-create-checkout error:', err)
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : 'Internal server error',
    }), { headers, status: 500 })
  }
})

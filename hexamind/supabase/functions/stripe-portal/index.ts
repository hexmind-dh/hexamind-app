// @ts-nocheck
// Supabase Edge Function: Stripe Customer Portal
//
// 调用: supabase.functions.invoke('stripe-portal', { body: { platform: 'app'|'web' } })
// 部署: supabase functions deploy stripe-portal --no-verify-jwt
//
// 环境变量:
//   STRIPE_SECRET_KEY   Stripe API Secret Key
//   PUBLIC_SITE_URL     (Web 必填) 公网地址

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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { headers, status: 401 })
    }

    const token = authHeader.slice(7)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { headers, status: 401 })
    }

    const { platform = 'app' } = await req.json()

    const { data: subscription } = await supabase
      .from('subscriptions').select('stripe_customer_id')
      .eq('user_id', user.id).maybeSingle()

    if (!subscription?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No subscription found' }), { headers, status: 400 })
    }

    const returnUrl = platform === 'app'
      ? 'hexamind://payment/success?portal=true'
      : `${Deno.env.get('PUBLIC_SITE_URL')!}/payment/success?portal=true`

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl,
    })

    return new Response(JSON.stringify({ url: portalSession.url }), { headers, status: 200 })

  } catch (err) {
    console.error('stripe-portal error:', err)
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : 'Internal server error',
    }), { headers, status: 500 })
  }
})

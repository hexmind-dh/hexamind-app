// @ts-nocheck
// Supabase Edge Function: Stripe Webhook
//
// 部署: supabase functions deploy stripe-webhook --no-verify-jwt
// Stripe Dashboard → Webhooks → Add endpoint:
//   URL: https://<project>.supabase.co/functions/v1/stripe-webhook
//   事件: checkout.session.completed, customer.subscription.*, invoice.*
//
// 环境变量:
//   STRIPE_SECRET_KEY       Stripe API Secret Key
//   STRIPE_WEBHOOK_SECRET   Stripe Webhook Signing Secret

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
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'stripe-signature, content-type',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  try {
    // 1. 验证 Webhook 签名
    const sig = req.headers.get('stripe-signature')
    if (!sig) {
      return new Response(JSON.stringify({ error: 'Missing stripe-signature' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not set')
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 2. 处理事件
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.supabase_user_id
        if (!userId) { console.warn('No supabase_user_id in session:', session.id); break }

        if (session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string)
          await syncSubscription(userId, {
            tier: 'Pro',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: sub.id,
            status: sub.status === 'active' ? 'active' : 'trialing',
            currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const subId = invoice.subscription as string
        if (!subId) break

        const sub = await stripe.subscriptions.retrieve(subId)
        const userId = sub.metadata?.supabase_user_id ?? await findUserIdBySubId(subId)
        if (userId) {
          await supabase.from('subscriptions').update({
            status: 'active',
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('stripe_subscription_id', subId)
          await supabase.from('profiles').update({ tier: 'Pro' }).eq('id', userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const failedInvoice = event.data.object as Stripe.Invoice
        const failedSubId = failedInvoice.subscription as string
        if (failedSubId) {
          await supabase.from('subscriptions').update({ status: 'past_due' })
            .eq('stripe_subscription_id', failedSubId)
        }
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.supabase_user_id ?? await findUserIdBySubId(sub.id)
        if (!userId) break

        const isActive = sub.status === 'active' || sub.status === 'trialing'
        await syncSubscription(userId, {
          tier: isActive ? 'Pro' : 'Free',
          stripeSubscriptionId: sub.id,
          status: mapStatus(sub.status),
          currentPeriodStart: new Date(sub.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
        })

        if (!isActive) {
          await supabase.from('profiles').update({ tier: 'Free' }).eq('id', userId)
        }
        break
      }

      default:
        console.log(`Unhandled event: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('stripe-webhook error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

// ====== Helpers ======

async function syncSubscription(
  userId: string,
  data: {
    tier: string
    stripeCustomerId?: string
    stripeSubscriptionId: string
    status: string
    currentPeriodStart?: string
    currentPeriodEnd?: string
  },
) {
  const { data: existing } = await supabase
    .from('subscriptions').select('id').eq('user_id', userId).maybeSingle()

  if (existing) {
    await supabase.from('subscriptions').update({
      tier: data.tier,
      stripe_customer_id: data.stripeCustomerId,
      stripe_subscription_id: data.stripeSubscriptionId,
      status: data.status,
      current_period_start: data.currentPeriodStart,
      current_period_end: data.currentPeriodEnd,
      updated_at: new Date().toISOString(),
    }).eq('id', existing.id)
  } else {
    await supabase.from('subscriptions').insert({
      user_id: userId,
      tier: data.tier,
      stripe_customer_id: data.stripeCustomerId,
      stripe_subscription_id: data.stripeSubscriptionId,
      status: data.status,
      current_period_start: data.currentPeriodStart,
      current_period_end: data.currentPeriodEnd,
    })
  }

  await supabase.from('profiles').update({ tier: data.tier }).eq('id', userId)
}

async function findUserIdBySubId(subId: string): Promise<string | null> {
  const { data } = await supabase
    .from('subscriptions').select('user_id')
    .eq('stripe_subscription_id', subId).maybeSingle()
  return data?.user_id ?? null
}

function mapStatus(s: string): string {
  switch (s) {
    case 'active': return 'active'
    case 'canceled': return 'canceled'
    case 'past_due': return 'past_due'
    case 'trialing': return 'trialing'
    default: return 'expired'
  }
}

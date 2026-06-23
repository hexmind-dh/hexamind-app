import { supabase } from '../supabase'
import type { Database } from '../database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type Subscription = Database['public']['Tables']['subscriptions']['Row']
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']

type DbClient = SupabaseClient<Database>

function getClient(client?: DbClient) {
  return client ?? supabase
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T
}

export const subscriptionsRepository = {
  /**
   * 获取用户的订阅记录
   */
  async getByUser(userId: string, client?: DbClient): Promise<Subscription | null> {
    const { data, error } = await getClient(client)
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * 创建订阅记录
   */
  async create(subscription: SubscriptionInsert, client?: DbClient): Promise<Subscription> {
    const payload = removeUndefined(subscription)

    const { data, error } = await getClient(client)
      .from('subscriptions')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 更新订阅记录
   */
  async update(id: string, updates: SubscriptionUpdate, client?: DbClient): Promise<Subscription> {
    const payload = removeUndefined(updates)

    const { data, error } = await getClient(client)
      .from('subscriptions')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 升级 / 降级用户 tier（同时更新 profiles.tier 和 subscriptions.tier）
   */
  async setTier(
    userId: string,
    tier: 'Free' | 'Pro',
    stripeData?: {
      stripeCustomerId?: string
      stripeSubscriptionId?: string
    },
    client?: DbClient,
  ): Promise<Subscription> {
    const db = getClient(client)

    // 1. 更新 profiles.tier
    const { error: profileError } = await db
      .from('profiles')
      .update({ tier, updated_at: new Date().toISOString() })
      .eq('id', userId)

    if (profileError) throw profileError

    // 2. upsert subscriptions
    const existing = await subscriptionsRepository.getByUser(userId, client)

    if (existing) {
      return subscriptionsRepository.update(
        existing.id,
        {
          tier,
          stripe_customer_id: stripeData?.stripeCustomerId ?? existing.stripe_customer_id,
          stripe_subscription_id: stripeData?.stripeSubscriptionId ?? existing.stripe_subscription_id,
          status: tier === 'Pro' ? 'active' : 'canceled',
        },
        client,
      )
    }

    return subscriptionsRepository.create(
      {
        user_id: userId,
        tier,
        stripe_customer_id: stripeData?.stripeCustomerId ?? null,
        stripe_subscription_id: stripeData?.stripeSubscriptionId ?? null,
        status: tier === 'Pro' ? 'active' : 'canceled',
      },
      client,
    )
  },
}

export type { Subscription, SubscriptionInsert, SubscriptionUpdate }

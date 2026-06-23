/**
 * Stripe 客户端工具函数
 *
 * 通过 Supabase Edge Functions 处理支付
 * - stripe-create-checkout: 创建 Checkout Session
 * - stripe-portal: 跳转 Customer Portal
 *
 * App (iOS/Android): WebBrowser 打开支付页 → deep link 回调
 * Web: window.location 直接跳转
 */
import * as WebBrowser from 'expo-web-browser'
import { Alert, Platform } from 'react-native'

import { supabase } from '@/db/supabase'

type Platform = 'app' | 'web'

function getPlatform(): Platform {
  return Platform.OS === 'web' ? 'web' : 'app'
}

/**
 * 创建 Checkout Session 并跳转支付
 * 价格在 Edge Function 中硬编码，无需传入 priceId
 * @returns sessionId 支付成功时返回，取消返回 null
 */
export async function createCheckoutSession(): Promise<string | null> {
  try {
    const platform = getPlatform()

    const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
      body: { platform },
    })

    if (error) {
      console.error('createCheckoutSession error:', error)
      Alert.alert('支付错误', error.message || '无法创建支付会话')
      return null
    }

    if (data?.error) {
      if (data.error === 'Already a Pro member') {
        Alert.alert('提示', '您已经是 Pro 会员')
        return null
      }
      Alert.alert('支付错误', data.error)
      return null
    }

    if (!data?.url) {
      Alert.alert('支付错误', '未获取到支付链接')
      return null
    }

    if (platform === 'app') {
      const result = await WebBrowser.openAuthSessionAsync(data.url, 'hexamind://payment/success')
      return result.type === 'success' ? data.sessionId : null
    }

    window.location.href = data.url
    return null

  } catch (err) {
    console.error('createCheckoutSession error:', err)
    Alert.alert('支付错误', '支付过程中出现错误，请重试')
    return null
  }
}

/**
 * 打开 Customer Portal（管理/取消订阅）
 */
export async function openCustomerPortal(): Promise<boolean> {
  try {
    const platform = getPlatform()

    const { data, error } = await supabase.functions.invoke('stripe-portal', {
      body: { platform },
    })

    if (error || data?.error) {
      Alert.alert('错误', data?.error || error?.message || '无法打开管理页面')
      return false
    }

    if (!data?.url) return false

    if (platform === 'app') {
      const result = await WebBrowser.openAuthSessionAsync(data.url, 'hexamind://payment/success')
      return result.type === 'success'
    }

    window.location.href = data.url
    return true

  } catch (err) {
    console.error('openCustomerPortal error:', err)
    Alert.alert('错误', '无法打开管理页面')
    return false
  }
}

/**
 * 获取当前用户的订阅详情
 */
export async function getSubscriptionStatus() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) return null

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle()

    if (error) throw error
    return data
  } catch (err) {
    console.error('getSubscriptionStatus error:', err)
    return null
  }
}

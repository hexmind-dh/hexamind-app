import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import type { AuthChangeEvent, Session, Subscription } from '@supabase/supabase-js'

import { supabase } from './supabase'

WebBrowser.maybeCompleteAuthSession()

const authRedirectPath = 'auth/callback'
const authRedirectTo =
  Platform.OS === 'web'
    ? Linking.createURL(authRedirectPath)
    : 'hexamind://auth/callback'

type SupportedOAuthProvider = 'google' | 'apple'

type OAuthResult = {
  cancelled: boolean
  session: Session | null
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

async function completeOAuthSession(callbackUrl: string): Promise<Session | null> {
  const { queryParams } = Linking.parse(callbackUrl)

  const code = typeof queryParams?.code === 'string' ? queryParams.code : null
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw error
    return data.session
  }

  const accessToken =
    typeof queryParams?.access_token === 'string' ? queryParams.access_token : null
  const refreshToken =
    typeof queryParams?.refresh_token === 'string' ? queryParams.refresh_token : null

  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error) throw error
    return data.session
  }

  return null
}

async function signInWithOAuth(provider: SupportedOAuthProvider): Promise<OAuthResult> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: authRedirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
      queryParams:
        provider === 'google'
          ? {
              access_type: 'offline',
              prompt: 'consent',
            }
          : undefined,
    },
  })

  if (error) throw error
  if (!data?.url) {
    throw new Error(`${provider} 登录地址获取失败`)
  }

  if (Platform.OS === 'web') {
    // Web: 全页面跳转（避免浏览器弹窗拦截）
    // 用户跳转到 Google OAuth → 授权后重定向回 /auth/callback?code=xxx
    window.location.href = data.url
    return {
      cancelled: true, // 调用方无需等待，session 由 callback 页处理
      session: null,
    }
  }

  // 原生: 使用系统浏览器（SFSafariViewController / Chrome Custom Tabs）
  const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirectTo)

  if (result.type !== 'success' || !result.url) {
    return {
      cancelled: true,
      session: null,
    }
  }

  return {
    cancelled: false,
    session: await completeOAuthSession(result.url),
  }
}

export async function signInWithGoogle() {
  return signInWithOAuth('google')
}

export async function signInWithApple() {
  return signInWithOAuth('apple')
}

/** 邮箱密码登录 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

/** 邮箱注册 */
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined, // 本地开发无需邮件验证
    },
  })
  if (error) throw error
  // 注意：首次注册时，session 可能为 null（取决于是否开启邮箱验证）
  return data.session
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
): Subscription {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(callback)

  return subscription
}

export { authRedirectPath, authRedirectTo, getErrorMessage, completeOAuthSession }

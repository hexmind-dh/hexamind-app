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
      skipBrowserRedirect: true,
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

export { authRedirectPath, authRedirectTo, getErrorMessage }

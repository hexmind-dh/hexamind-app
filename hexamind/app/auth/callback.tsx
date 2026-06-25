import { ActivityIndicator, Platform, StyleSheet } from 'react-native'
import { useEffect, useRef } from 'react'
import { router } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { completeOAuthSession } from '@/db/auth';
import { useStore } from '@/store';

WebBrowser.maybeCompleteAuthSession()

export default function AuthCallbackScreen() {
  const setSession = useStore((state) => state.setSession);
  const syncProfileFromSupabase = useStore((state) => state.syncProfileFromSupabase);
  const processedRef = useRef(false);

  useEffect(() => {
    // 防止 StrictMode 重复执行
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      try {
        // 从当前 URL 中提取 OAuth 回调参数
        const currentUrl = Platform.OS === 'web'
          ? window.location.href
          : // 原生端: WebBrowser.openAuthSessionAsync 返回时，URL 已经传入
          // 这里不会执行到，因为 callback 页原生端走的是 openAuthSessionAsync 返回路径
          null;

        if (!currentUrl) {
          // 原生端: 由 WebBrowser.maybeCompleteAuthSession() 处理
          return;
        }

        // 检查 URL 是否包含 OAuth 回调参数
        const urlObj = new URL(currentUrl);
        const hasCode = urlObj.searchParams.has('code');
        const hasTokens = urlObj.searchParams.has('access_token');

        if (!hasCode && !hasTokens) {
          // 没有 OAuth 参数，用户可能是直接访问此页面
          return;
        }

        const session = await completeOAuthSession(currentUrl);

        if (session) {
          setSession(session);
          if (session.user?.id) {
            syncProfileFromSupabase(session.user.id);
          }
          // 跳转到首页
          router.replace('/');
        }
      } catch (err) {
        console.error('OAuth callback failed:', err);
        // 失败时跳回登录页
        router.replace('/login');
      } finally {
        // Web 上清除 URL 中的 OAuth 参数，防止刷新后重复处理
        if (Platform.OS === 'web') {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleCallback();
  }, [setSession, syncProfileFromSupabase]);

  return (
    <View style={styles.container}>
      <ActivityIndicator />
      <Text type="subtitle">正在完成登录...</Text>
      <Text>如果没有自动返回，请关闭当前页面后回到 App。</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
})

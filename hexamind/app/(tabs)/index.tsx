import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { getErrorMessage, getSession, onAuthStateChange, signInWithGoogle, signOut } from '@/db/auth';
import { llmProvidersRepository, type LlmProvider } from '@/db/apis';
import { useStore } from '@/store';

export default function HomeScreen() {
  const { count, inc } = useStore();
  const [providers, setProviders] = useState<LlmProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authActionLoading, setAuthActionLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const loadProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await llmProvidersRepository.list();
      setProviders(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : '加载 LLM Providers 失败';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSession = useCallback(async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      const currentSession = await getSession();
      setSession(currentSession);
    } catch (err) {
      setAuthError(getErrorMessage(err, '读取登录状态失败'));
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    try {
      setAuthActionLoading(true);
      setAuthError(null);

      const result = await signInWithGoogle();
      if (!result.cancelled) {
        setSession(result.session);
      }
    } catch (err) {
      setAuthError(getErrorMessage(err, 'Google 登录失败'));
    } finally {
      setAuthActionLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setAuthActionLoading(true);
      setAuthError(null);
      await signOut();
      setSession(null);
    } catch (err) {
      setAuthError(getErrorMessage(err, '退出登录失败'));
    } finally {
      setAuthActionLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProviders();
    loadSession();

    const subscription = onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadProviders, loadSession]);

  const userEmail = session?.user?.email || '未获取邮箱';
  const currentProvider = session?.user?.app_metadata?.provider || 'unknown';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <View className="w-full bg-red-300 p-4 rounded-xl">
        <Text className="text-4xl text-black font-bold">测试啊</Text>
      </View>

      <View style={styles.titleContainer}>
        <Text onPress={() => inc()} type="title">
          Welcome! simon {count}x休息下
        </Text>
        <HelloWave />
      </View>

      <View style={styles.authCard}>
        <Text type="subtitle">账号登录</Text>

        {authLoading ? (
          <View style={styles.centerRow}>
            <ActivityIndicator />
            <Text> 正在检查登录状态...</Text>
          </View>
        ) : session ? (
          <View style={styles.authInfoBox}>
            <Text type="defaultSemiBold">已登录</Text>
            <Text>邮箱：{userEmail}</Text>
            <Text>登录方式：{currentProvider}</Text>
            <Pressable
              disabled={authActionLoading}
              onPress={handleSignOut}
              style={[styles.primaryButton, styles.signOutButton]}>
              <Text style={styles.primaryButtonText}>
                {authActionLoading ? '处理中...' : '退出登录'}
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.authActions}>
            <Text>已接入 Google 登录，Apple 登录入口先预留。</Text>
            <Pressable
              disabled={authActionLoading}
              onPress={handleGoogleLogin}
              style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>
                {authActionLoading ? '跳转中...' : '使用 Google 登录'}
              </Text>
            </Pressable>
            <Pressable disabled style={[styles.secondaryButton, styles.disabledButton]}>
              <Text style={styles.secondaryButtonText}>Apple 登录（稍后接入）</Text>
            </Pressable>
          </View>
        )}

        {authError ? (
          <View style={styles.errorBox}>
            <Text type="defaultSemiBold">认证错误</Text>
            <Text>{authError}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.apiCard}>
        <View style={styles.apiHeader}>
          <Text type="subtitle">LLM Providers API</Text>
          <Pressable onPress={loadProviders} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>{loading ? '加载中...' : '刷新'}</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centerRow}>
            <ActivityIndicator />
            <Text> 正在加载 providers...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorBox}>
            <Text type="defaultSemiBold">请求失败</Text>
            <Text>{error}</Text>
          </View>
        ) : providers.length === 0 ? (
          <Text>暂无 provider 数据</Text>
        ) : (
          <View style={styles.providerList}>
            {providers.map((provider) => (
              <View key={provider.id} style={styles.providerItem}>
                <View style={styles.providerTitleRow}>
                  <Text type="defaultSemiBold">{provider.name}</Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      provider.is_active ? styles.statusActive : styles.statusInactive,
                    ]}>
                    {provider.is_active ? '启用中' : '已停用'}
                  </Text>
                </View>
                <Text>模型：{provider.model}</Text>
                <Text>Base URL：{provider.base_url || '默认'}</Text>
                <Text>Temperature：{provider.temperature ?? '未设置'}</Text>
                <Text>Max Tokens：{provider.max_tokens ?? '未设置'}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.stepContainer}>
        <Text type="subtitle">Step 1: Try it</Text>
        <Text>
          Edit <Text type="defaultSemiBold">app/(tabs)/index.tsx</Text> to see
          changes. Press{' '}
          <Text type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </Text>{' '}
          to open developer tools.
        </Text>
      </View>
      <View style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <Text type="subtitle">Step 2: Explore</Text>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <Text>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </Text>
      </View>
      <View style={styles.stepContainer}>
        <Text type="subtitle">Step 3: Get a fresh start</Text>
        <Text>
          {`When you're ready, run `}
          <Text type="defaultSemiBold">npm run reset-project</Text> to get a fresh{' '}
          <Text type="defaultSemiBold">app</Text> directory. This will move the current{' '}
          <Text type="defaultSemiBold">app</Text> to{' '}
          <Text type="defaultSemiBold">app-example</Text>.
        </Text>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  authCard: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  authActions: {
    gap: 12,
  },
  authInfoBox: {
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(120, 120, 128, 0.2)',
  },
  apiCard: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  apiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#111827',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(120, 120, 128, 0.35)',
  },
  secondaryButtonText: {
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.55,
  },
  refreshButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorBox: {
    gap: 4,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
  },
  providerList: {
    gap: 12,
  },
  providerItem: {
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(120, 120, 128, 0.2)',
  },
  providerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  statusBadge: {
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '600',
  },
  statusActive: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});

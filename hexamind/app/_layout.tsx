import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import '../styles/global.css'
import '@/i18n'

import { getSession, onAuthStateChange } from '@/db/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const session = useStore((state) => state.session);
  const setSession = useStore((state) => state.setSession);
  const setAuthInitialized = useStore((state) => state.setAuthInitialized);
  const initializePreferences = useStore((state) => state.initializePreferences);
  const syncProfileFromSupabase = useStore((state) => state.syncProfileFromSupabase);
  const prevSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const bootstrapAuth = async () => {
      try {
        const session = await getSession();
        if (mounted) {
          setSession(session);
        }
      } finally {
        if (mounted) {
          setAuthInitialized(true);
        }
      }
    };

    bootstrapAuth();
    initializePreferences().catch(() => {});

    const subscription = onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthInitialized(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initializePreferences, setAuthInitialized, setSession]);

  // 登录态变化时，从 Supabase 同步用户资料
  useEffect(() => {
    const userId = session?.user?.id ?? null;
    if (userId && userId !== prevSessionIdRef.current) {
      prevSessionIdRef.current = userId;
      syncProfileFromSupabase(userId);
    } else if (!userId) {
      prevSessionIdRef.current = null;
    }
  }, [session, syncProfileFromSupabase]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, title: "" }} />
        <Stack.Screen name="detail" options={{ headerShown: true }} />
        <Stack.Screen name="history" options={{ headerShown: true }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login-email" options={{ headerShown: true, title: '邮箱登录' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
      <Toast
        // @ts-ignore
        text1Style={{ fontSize: 16 }}
        text2Style={{ fontSize: 14 }}
      />
    </ThemeProvider>
  );
}

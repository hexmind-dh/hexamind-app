import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import '../styles/global.css'
import '@/i18n'

import { getSession, onAuthStateChange } from '@/db/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useStore } from '@/store';

export const unstable_settings = {
  // anchor: '(tabs)',
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const setSession = useStore((state) => state.setSession);
  const setAuthInitialized = useStore((state) => state.setAuthInitialized);
  const initializePreferences = useStore((state) => state.initializePreferences);

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
    initializePreferences().catch(() => {
    });

    const subscription = onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthInitialized(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [initializePreferences, setAuthInitialized, setSession]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false, title: "" }} />
        <Stack.Screen name="detail" options={{ headerShown: true }} />
        <Stack.Screen name="history" options={{ headerShown: true }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
      <Toast
        // @ts-ignore
        text1Style={{
          fontSize: 16,
        }}
        text2Style={{
          fontSize: 14,
        }}
      />
    </ThemeProvider>
  );
}

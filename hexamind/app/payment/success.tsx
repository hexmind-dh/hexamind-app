import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/store';
import { getSubscriptionStatus } from '@/lib/stripe-client';
import { getSession } from '@/db/auth';

export default function PaymentSuccessScreen() {
  const { session_id } = useLocalSearchParams<{ session_id?: string }>();
  const router = useRouter();

  const session = useStore((state) => state.session);
  const authInitialized = useStore((state) => state.authInitialized);
  const syncProfileFromSupabase = useStore((state) => state.syncProfileFromSupabase);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const waitForAuth = useCallback(async () => {
    if (!authInitialized) {
      await new Promise<void>((resolve) => {
        const unsubscribe = useStore.subscribe((state) => {
          if (state.authInitialized) {
            unsubscribe();
            resolve();
          }
        });
      });
    }
  }, [authInitialized]);

  const handleRefresh = useCallback(async () => {
    try {
      setStatus('loading');
      await waitForAuth();

      let userId = session?.user?.id;
      if (!userId) {
        const restoredSession = await getSession();
        userId = restoredSession?.user?.id ?? null;
      }

      if (userId) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await syncProfileFromSupabase(userId);

        const subscription = await getSubscriptionStatus();
        if (subscription?.status === 'active' || subscription?.status === 'trialing') {
          setStatus('success');
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 3000));
        await syncProfileFromSupabase(userId);
        setStatus('success');
      } else {
        setStatus('success');
      }
    } catch (err) {
      console.error('Payment success refresh error:', err);
      setErrorMsg('同步订阅信息失败，请稍后手动刷新');
      setStatus('error');
    }
  }, [session, authInitialized, syncProfileFromSupabase, waitForAuth]);

  useEffect(() => {
    handleRefresh();
  }, []);

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => router.replace('/'), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0b0c10' }}>
      {status === 'loading' ? (
        <>
          <ActivityIndicator size="large" color="#fbbf24" />
          <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>正在激活 Pro 会员...</Text>
          <Text style={{ color: '#888', marginTop: 8, fontSize: 13, textAlign: 'center' }}>请稍候，正在同步订阅信息</Text>
        </>
      ) : status === 'error' ? (
        <>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 107, 107, 0.15)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="warning" size={48} color="#ff6b6b" />
          </View>
          <Text style={{ color: '#fff', marginTop: 16, fontSize: 20, fontWeight: '700' }}>同步超时</Text>
          {errorMsg && <Text style={{ color: '#888', marginTop: 8, fontSize: 13, textAlign: 'center' }}>{errorMsg}</Text>}
          <Pressable onPress={handleRefresh} style={{ marginTop: 24, backgroundColor: '#fbbf24', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }}>
            <Text style={{ color: '#000', fontWeight: '600' }}>重新同步</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(251, 191, 36, 0.15)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={48} color="#fbbf24" />
          </View>
          <Text style={{ color: '#fff', marginTop: 16, fontSize: 20, fontWeight: '700' }}>支付成功！</Text>
          <Text style={{ color: '#fbbf24', marginTop: 8, fontSize: 16, fontWeight: '600' }}>🎉 您已升级为 Pro 会员</Text>
          <Text style={{ color: '#888', marginTop: 16, fontSize: 13, textAlign: 'center' }}>正在返回首页...</Text>
        </>
      )}
    </View>
  );
}

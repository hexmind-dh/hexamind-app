import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useStore } from '@/store';
import { verifySession, getSubscriptionStatus } from '@/lib/stripe-client';
import { getSession } from '@/db/auth';

export default function PaymentSuccessScreen() {
  const { session_id } = useLocalSearchParams<{ session_id?: string }>();
  const router = useRouter();

  const session = useStore((state) => state.session);
  const authInitialized = useStore((state) => state.authInitialized);
  const syncProfileFromSupabase = useStore((state) => state.syncProfileFromSupabase);

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在激活 Pro 会员...');

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

  const handleVerify = useCallback(async () => {
    try {
      setStatus('loading');
      setMessage('正在验证支付...');
      await waitForAuth();

      // 确保有 session
      let userId = session?.user?.id;
      if (!userId) {
        const restored = await getSession();
        userId = restored?.user?.id ?? null;
      }

      if (!userId) {
        setMessage('未检测到登录状态，请刷新页面');
        setStatus('error');
        return;
      }

      // 如果有 session_id，直接验证
      if (session_id) {
        setMessage('正在激活 Pro 会员...');
        const verified = await verifySession(session_id);

        if (verified) {
          // 验证成功，刷新 store
          await syncProfileFromSupabase(userId);
          setStatus('success');
          return;
        }

        // 验证失败，等 Webhook 兜底
        setMessage('等待支付确认...');
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // 兜底：从 DB 刷新
      await syncProfileFromSupabase(userId);
      const sub = await getSubscriptionStatus();

      if (sub?.status === 'active') {
        setStatus('success');
      } else {
        // 再等一轮
        setMessage('支付确认中，请稍候...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
        await syncProfileFromSupabase(userId);
        setStatus('success');
      }

    } catch (err) {
      console.error('Payment verify error:', err);
      setMessage('同步失败，请稍后手动刷新');
      setStatus('error');
    }
  }, [session_id, session, authInitialized, syncProfileFromSupabase, waitForAuth]);

  useEffect(() => {
    handleVerify();
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
          <Text style={{ color: '#fff', marginTop: 16, fontSize: 16 }}>{message}</Text>
          <Text style={{ color: '#888', marginTop: 8, fontSize: 13, textAlign: 'center' }}>
            请勿关闭此页面
          </Text>
        </>
      ) : status === 'error' ? (
        <>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 107, 107, 0.15)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="warning" size={48} color="#ff6b6b" />
          </View>
          <Text style={{ color: '#fff', marginTop: 16, fontSize: 20, fontWeight: '700' }}>同步超时</Text>
          <Text style={{ color: '#888', marginTop: 8, fontSize: 13, textAlign: 'center' }}>{message}</Text>
          <Pressable onPress={handleVerify} style={{ marginTop: 24, backgroundColor: '#fbbf24', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }}>
            <Text style={{ color: '#000', fontWeight: '600' }}>重新同步</Text>
          </Pressable>
          <Pressable onPress={() => router.replace('/')} style={{ marginTop: 12 }}>
            <Text style={{ color: '#888', fontSize: 13 }}>返回首页</Text>
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

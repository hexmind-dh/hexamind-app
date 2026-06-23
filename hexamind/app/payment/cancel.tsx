import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PaymentCancelScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/'), 10000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#0b0c10' }}>
      <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 107, 107, 0.15)', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="close-circle" size={48} color="#ff6b6b" />
      </View>
      <Text style={{ color: '#fff', marginTop: 16, fontSize: 20, fontWeight: '700' }}>支付已取消</Text>
      <Text style={{ color: '#888', marginTop: 12, fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
        您的支付已取消，没有产生任何扣费。{'\n'}如有需要可随时重新升级。
      </Text>
      <Pressable onPress={() => router.replace('/')} style={{ marginTop: 32, backgroundColor: '#fbbf24', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14 }}>
        <Text style={{ color: '#000', fontWeight: '600', fontSize: 16 }}>返回首页</Text>
      </Pressable>
    </View>
  );
}

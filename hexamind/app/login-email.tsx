/**
 * 邮箱密码登录/注册页
 *
 * 仅用于本地开发（localhost 无法使用 Google OAuth 时）
 * 后续可通过 Cloudflare Turnstile / reCAPTCHA 保护或直接移除
 */

import { useCallback, useState } from 'react';
import { Pressable, TextInput } from 'react-native';
import Toast from 'react-native-toast-message';
import { router, Stack } from 'expo-router';

import { GradientText } from '@/components/gradient-text';
import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import {
    getErrorMessage,
    signInWithEmail,
    signUpWithEmail,
} from '@/db/auth';
import { useStore } from '@/store';

type Mode = 'login' | 'signup';

export default function LoginEmailScreen() {
    const setSession = useStore((state) => state.setSession);
    const setUserTier = useStore((state) => state.setUserTier);
    const syncProfileFromSupabase = useStore((state) => state.syncProfileFromSupabase);

    const [mode, setMode] = useState<Mode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        if (!email.trim() || !password.trim()) {
            setError('请输入邮箱和密码');
            return;
        }
        if (password.length < 6) {
            setError('密码至少6位');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            if (mode === 'signup') {
                const session = await signUpWithEmail(email.trim(), password);
                if (!session) {
                    // 需要邮箱验证
                    setError('注册成功，请检查邮箱完成验证后登录');
                    setMode('login');
                    return;
                }
                // 注册成功，自动设为 Pro 方便测试
                await setUserTier('Pro');
                try {
                    const { profilesRepository } = await import('@/db/apis');
                    await profilesRepository.setTier(session.user.id, 'Pro');
                } catch {}
            }

            const session = mode === 'login'
                ? await signInWithEmail(email.trim(), password)
                : null; // signup 上面已处理

            if (session) {
                setSession(session);
                if (session.user?.id) {
                    syncProfileFromSupabase(session.user.id);
                }
                Toast.show({ type: 'success', text1: mode === 'login' ? '登录成功' : '注册成功', visibilityTime: 2000 });
                router.replace('/');
            }
        } catch (err: any) {
            const msg = getErrorMessage(err, '操作失败');
            setError(msg);
            Toast.show({ type: 'error', text1: '操作失败', text2: msg, visibilityTime: 3000 });
        } finally {
            setLoading(false);
        }
    }, [email, password, mode, setSession, setUserTier, syncProfileFromSupabase]);

    return (
        <View className="flex-1 bg-[#050608f2] items-center pt-[15vh] gap-6 px-6">
            <Stack.Screen options={{ headerShown: true, title: '邮箱登录' }} />

            <View className="gap-2.5 items-center">
                <View className="flex-row items-center gap-1">
                    <Text size={24} className="uppercase font-light tracking-[3px] text-white">
                        HexaMind
                    </Text>
                    <GradientText size={24} title="易道流光" />
                </View>
                <Text size={12} className="text-white/40">
                    {mode === 'login' ? '邮箱密码登录' : '邮箱注册'}
                </Text>
            </View>

            <View className="w-full gap-4 px-4">
                <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="邮箱"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="w-full rounded-xl border border-white/20 px-4 py-3 text-white"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                />
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="密码（至少6位）"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    secureTextEntry
                    className="w-full rounded-xl border border-white/20 px-4 py-3 text-white"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                />

                {error && (
                    <View className="rounded-xl bg-red-500/10 p-3">
                        <Text className="text-white/80 text-sm">{error}</Text>
                    </View>
                )}

                <Pressable
                    disabled={loading}
                    onPress={handleSubmit}
                    className="items-center rounded-xl bg-white px-3 py-3"
                >
                    <Text className="font-semibold text-black">
                        {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
                    </Text>
                </Pressable>

                <Pressable onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                    <Text className="text-center text-white/40 text-sm">
                        {mode === 'login' ? '没有账号？点击注册' : '已有账号？点击登录'}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

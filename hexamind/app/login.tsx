import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import Toast from 'react-native-toast-message';
import { Link, Redirect } from 'expo-router';

import { GradientText } from '@/components/gradient-text';
import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';

import {
    getErrorMessage,
    signInWithApple,
    signInWithGoogle,
} from '@/db/auth';
import { useStore } from '@/store';

export default function LoginScreen() {
    const session = useStore((state) => state.session);
    const authInitialized = useStore((state) => state.authInitialized);
    const setSession = useStore((state) => state.setSession);
    const syncProfileFromSupabase = useStore((state) => state.syncProfileFromSupabase);
    const [authActionLoading, setAuthActionLoading] = useState<'google' | 'apple' | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    const handleLogin = useCallback(async (provider: 'google' | 'apple') => {
        try {
            setAuthActionLoading(provider);
            setAuthError(null);

            const result = provider === 'google' ? await signInWithGoogle() : await signInWithApple();

            if (!result.cancelled) {
                setSession(result.session);
                if (result.session?.user?.id) {
                    syncProfileFromSupabase(result.session.user.id);
                }
            }
        } catch (err) {
            const msg = getErrorMessage(err, `${provider === 'google' ? 'Google' : 'Apple'} 登录失败`);
            setAuthError(msg);
            Toast.show({
                type: 'error',
                text1: '登录失败',
                text2: msg,
                visibilityTime: 3000,
            });
        } finally {
            setAuthActionLoading(null);
        }
    }, [setSession, syncProfileFromSupabase]);

    if (authInitialized && session) {
        return <Redirect href="/" />;
    }

    return (
        <View className="w-full h-screen  flex-1 items-center pt-[20vh] gap-6 px-6">
            <View className="gap-2.5">
                <View className="flex-row flex-wrap items-center gap-1">
                    <Text size={30} className="uppercase font-light tracking-[3px] text-white">
                        HexaMind
                    </Text>
                    <GradientText size={30} title="易道流光" />
                </View>
                <Text size={14} className="uppercase tracking-[1.6px] text-white/50">
                    新一代仿生量子比特智能风险量化决策系统
                </Text>
            </View>

            <View className="gap-3 w-full mt-[40vh] p-4">
                {!authInitialized ? (
                    <View className="flex-row items-center">
                        <ActivityIndicator />
                        <Text className='text-white'> 正在检查登录状态...</Text>
                    </View>
                ) : (
                    <View className="gap-3">
                        <Pressable
                            disabled={authActionLoading !== null}
                            onPress={() => handleLogin('google')}
                            className="items-center rounded-xl bg-[#ef4444] px-3 py-3">
                            <Text className="font-semibold text-white">
                                {authActionLoading === 'google' ? '跳转中...' : '使用 Google 登录'}
                            </Text>
                        </Pressable>
                        <Pressable
                            disabled={authActionLoading !== null}
                            onPress={() => handleLogin('apple')}
                            className="items-center rounded-xl border border-white/20 px-3 py-3">
                            <Text className="font-semibold text-white">
                                {authActionLoading === 'apple' ? '跳转中...' : '使用 Apple 登录'}
                            </Text>
                        </Pressable>

                        {/* 本地开发：邮箱登录入口 */}
                        <Link href="/login-email" asChild>
                            <Pressable className="items-center rounded-xl border border-white/10 px-3 py-2.5">
                                <Text className="text-white/50 text-sm">邮箱密码登录（本地开发）</Text>
                            </Pressable>
                        </Link>
                    </View>
                )}

                {authError ? (
                    <View className="gap-1 rounded-xl bg-red-500/10 p-3">
                        <Text className='text-white/80 text-sm'>{authError}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

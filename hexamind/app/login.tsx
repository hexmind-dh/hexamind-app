import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import { Redirect } from 'expo-router';

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
    const [authActionLoading, setAuthActionLoading] = useState<'google' | 'apple' | null>(null);
    const [authError, setAuthError] = useState<string | null>(null);

    const handleLogin = useCallback(async (provider: 'google' | 'apple') => {
        try {
            setAuthActionLoading(provider);
            setAuthError(null);

            const result = provider === 'google' ? await signInWithGoogle() : await signInWithApple();

            if (!result.cancelled) {
                setSession(result.session);
            }
        } catch (err) {
            setAuthError(getErrorMessage(err, `${provider === 'google' ? 'Google' : 'Apple'} 登录失败`));
        } finally {
            setAuthActionLoading(null);
        }
    }, [setSession]);

    if (authInitialized && session) {
        return <Redirect href="/" />;
    }

    return (
        <View className="w-full h-screen flex-1 items-center pt-[20vh] gap-6 px-6">
            <View className="gap-2.5">
                <View className="flex-row flex-wrap items-center gap-1">
                    <Text size={30} className="uppercase font-light tracking-[3px]">
                        HexaMind
                    </Text>
                    <GradientText size={30} title="易道流光" />
                </View>
                <Text className="text-xs uppercase tracking-[1.6px] opacity-50">
                    新一代仿生量子比特智能风险量化决策系统
                </Text>
            </View>

            <View className="gap-3 rounded-3xl w-full mt-[40vh] p-4">
                {!authInitialized ? (
                    <View className="flex-row items-center">
                        <ActivityIndicator />
                        <Text> 正在检查登录状态...</Text>
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
                            <Text className="font-semibold">
                                {authActionLoading === 'apple' ? '跳转中...' : '使用 Apple 登录'}
                            </Text>
                        </Pressable>
                    </View>
                )}

                {authError ? (
                    <View className="gap-1 rounded-xl bg-red-500/10 p-3">
                        <Text type="defaultSemiBold">认证错误</Text>
                        <Text>{authError}</Text>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

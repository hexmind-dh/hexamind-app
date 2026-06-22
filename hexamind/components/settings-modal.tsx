import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import {
  AUTO_DETECT_LABELS,
  LANGUAGES,
  type LanguagePreference,
} from '@/i18n';
import { useStore } from '@/store';
import {
  getErrorMessage,
  signInWithApple,
  signInWithGoogle,
  signOut,
} from '@/db/auth';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const session = useStore((state) => state.session);
  const setSession = useStore((state) => state.setSession);
  const language = useStore((state) => state.language);
  const languagePreference = useStore((state) => state.languagePreference);
  const setLanguagePreference = useStore((state) => state.setLanguagePreference);
  const { t } = useTranslation();
  const [authActionLoading, setAuthActionLoading] = useState<'google' | 'apple' | 'signout' | null>(null);

  const languageOptions = useMemo(
    () =>
      LANGUAGES.map((item) => ({
        ...item,
        active:
          item.code === 'zh-CN'
            ? languagePreference === 'zh-CN' || languagePreference === 'zh-TW'
            : languagePreference === item.code,
      })),
    [languagePreference]
  );

  const currentLanguageLabel = useMemo(() => {
    if (languagePreference === 'auto') {
      return AUTO_DETECT_LABELS[language];
    }

    if (language === 'zh-TW') {
      return '中文（繁體）';
    }

    if (language === 'zh-CN') {
      return '中文（简体）';
    }

    return LANGUAGES.find((item) => item.code === languagePreference)?.name ?? 'English';
  }, [language, languagePreference]);

  const handleLanguageSelect = useCallback(
    async (value: LanguagePreference) => {
      try {
        await setLanguagePreference(value);
      } catch {
        Alert.alert('HexaMind', '语言设置保存失败');
      }
    },
    [setLanguagePreference]
  );

  const handleLogin = useCallback(
    async (provider: 'google' | 'apple') => {
      try {
        setAuthActionLoading(provider);

        const result = provider === 'google' ? await signInWithGoogle() : await signInWithApple();
        if (!result.cancelled) {
          setSession(result.session);
          onClose();
        }
      } catch (err) {
        Alert.alert('HexaMind', getErrorMessage(err, provider === 'google' ? 'Google 登录失败' : 'Apple 登录失败'));
      } finally {
        setAuthActionLoading(null);
      }
    },
    [onClose, setSession]
  );

  const handleSignOut = useCallback(async () => {
    try {
      setAuthActionLoading('signout');
      await signOut();
      setSession(null);
      onClose();
    } catch (err) {
      Alert.alert('HexaMind', getErrorMessage(err, '退出登录失败'));
    } finally {
      setAuthActionLoading(null);
    }
  }, [onClose, setSession]);

  const userName =
    session?.user.user_metadata?.full_name ||
    session?.user.user_metadata?.name ||
    session?.user.email?.split('@')[0] ||
    'HexaMind User';

  const provider = session?.user.app_metadata?.provider
    ? String(session.user.app_metadata.provider).toUpperCase()
    : 'SSO';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.78)', padding: 20, justifyContent: 'center' }}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="max-h-[88vh] rounded-[28px] border border-white/10 bg-[#0b0c10] px-5 py-5">
            <View className="mb-5 flex-row items-start justify-between gap-4 bg-transparent">
              <View className="flex-1 gap-2 bg-transparent">
                <Text size={22} className="font-semibold text-white">
                  {t('settingsTitle')}
                </Text>
                <Text className="text-xs leading-5 text-white/60">
                  {t('languageDescription')}
                </Text>
              </View>

              <Pressable
                onPress={onClose}
                className="h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5"
              >
                <Ionicons name="close" size={18} color="white" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-5 bg-transparent">
                <View className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <Text className="mb-1 text-[11px] uppercase tracking-[2px] text-cyan-300">
                    {t('language')}
                  </Text>
                  <Text className="mb-3 text-sm text-white/55">
                    {t('currentLanguage')}: {currentLanguageLabel}
                  </Text>

                  <View className="gap-2 bg-transparent">
                    <Pressable
                      onPress={() => handleLanguageSelect('auto')}
                      className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
                        languagePreference === 'auto' ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <View className="flex-row items-center gap-3 bg-transparent">
                        <Text className="text-lg">🌐</Text>
                        <Text className="text-sm text-white">{AUTO_DETECT_LABELS[language]}</Text>
                      </View>
                      <Ionicons
                        name={languagePreference === 'auto' ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={languagePreference === 'auto' ? '#67e8f9' : 'rgba(255,255,255,0.35)'}
                      />
                    </Pressable>

                    {languageOptions.map((item) => (
                      <Pressable
                        key={item.code}
                        onPress={() => handleLanguageSelect(item.code as LanguagePreference)}
                        className={`flex-row items-center justify-between rounded-2xl border px-4 py-3 ${
                          item.active ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/5'
                        }`}
                      >
                        <Text className="text-sm text-white">{item.name}</Text>
                        <Ionicons
                          name={item.active ? 'checkmark-circle' : 'ellipse-outline'}
                          size={20}
                          color={item.active ? '#67e8f9' : 'rgba(255,255,255,0.35)'}
                        />
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <Text className="mb-3 text-[11px] uppercase tracking-[2px] text-amber-300">
                    {t('account')}
                  </Text>

                  {session ? (
                    <View className="gap-3 bg-transparent">
                      <View className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
                        <View className="flex-row items-center gap-3 bg-transparent">
                          <View className="h-11 w-11 items-center justify-center rounded-full bg-white/10">
                            <Text className="font-semibold text-white">{userName.slice(0, 2).toUpperCase()}</Text>
                          </View>
                          <View className="flex-1 gap-1 bg-transparent">
                            <View className="flex-row items-center gap-2 bg-transparent">
                              <Text className="font-semibold text-white">{userName}</Text>
                              <MaterialIcons name="verified-user" size={16} color="#34d399" />
                            </View>
                            <Text className="text-xs text-white/55">{session.user.email}</Text>
                            <Text className="text-[11px] uppercase tracking-[1.5px] text-emerald-300">
                              {t('loggedIn')} · {provider}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <Pressable
                        disabled={authActionLoading !== null}
                        onPress={handleSignOut}
                        className="items-center rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3"
                      >
                        <Text className="font-semibold text-rose-300">
                          {authActionLoading === 'signout' ? '...' : t('signOut')}
                        </Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View className="gap-3 bg-transparent">
                      <Text className="text-sm text-white/55">{t('notLoggedIn')}</Text>

                      <Pressable
                        disabled={authActionLoading !== null}
                        onPress={() => handleLogin('google')}
                        className="items-center rounded-2xl bg-white px-4 py-3"
                      >
                        <Text className="font-semibold text-black">
                          {authActionLoading === 'google' ? t('signingIn') : t('signInGoogle')}
                        </Text>
                      </Pressable>

                      <Pressable
                        disabled={authActionLoading !== null}
                        onPress={() => handleLogin('apple')}
                        className="items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                      >
                        <Text className="font-semibold text-white">
                          {authActionLoading === 'apple' ? t('signingIn') : t('signInApple')}
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>

                <Pressable onPress={onClose} className="items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <Text className="font-medium text-white/80">{t('close')}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

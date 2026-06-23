import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { useStore } from '@/store';
import { createCheckoutSession, openCustomerPortal } from '@/lib/stripe-client';
import { profilesRepository } from '@/db/apis';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ visible, onClose }: SubscriptionModalProps) {
  const userTier = useStore((state) => state.userTier);
  const setUserTier = useStore((state) => state.setUserTier);
  const syncProfileFromSupabase = useStore((state) => state.syncProfileFromSupabase);
  const session = useStore((state) => state.session);

  const [paying, setPaying] = useState(false);
  const [managing, setManaging] = useState(false);
  const { t } = useTranslation();

  // ===== Stripe 支付升级 =====
  const handleUpgradeToPro = useCallback(async () => {
    setPaying(true);
    try {
      const sessionId = await createCheckoutSession();
      if (sessionId && session?.user?.id) {
        // 支付成功，等 Webhook 同步数据后刷新 tier
        await new Promise((resolve) => setTimeout(resolve, 3000));
        await syncProfileFromSupabase(session.user.id);
      }
    } finally {
      setPaying(false);
    }
  }, [session, syncProfileFromSupabase]);

  // ===== Stripe Customer Portal（管理/取消订阅） =====
  const handleManageSubscription = useCallback(async () => {
    setManaging(true);
    try {
      const success = await openCustomerPortal();
      if (success && session?.user?.id) {
        // 从 Portal 返回后刷新 tier（可能已取消/降级）
        await syncProfileFromSupabase(session.user.id);
      }
    } finally {
      setManaging(false);
    }
  }, [session, syncProfileFromSupabase]);

  // ===== 降级到 Free（仅本地降级，需在 Stripe 取消订阅） =====
  const handleDowngradeToFree = useCallback(async () => {
    Alert.alert(
      t('confirmDowngradeTitle') || '确认降级',
      t('confirmDowngradeMessage') || '请先通过「管理订阅」在 Stripe 中取消订阅，否则降级后仍会继续扣费。确定要继续吗？',
      [
        { text: t('cancel') || '取消', style: 'cancel' },
        {
          text: t('confirm') || '确认降级',
          style: 'destructive',
          onPress: async () => {
            try {
              await setUserTier('Free');
              if (session?.user?.id) {
                await profilesRepository.setTier(session.user.id, 'Free');
              }
            } catch {
              Alert.alert('HexaMind', '降级失败');
            }
          },
        },
      ]
    );
  }, [setUserTier, session, t]);

  const freeFeatures = [
    t('freeFeature1'),
    t('freeFeature2'),
    t('freeFeature3'),
  ];

  const proFeatures = [
    t('proFeature1'),
    t('proFeature2'),
    t('proFeature3'),
    t('proFeature4'),
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', padding: 20, justifyContent: 'center' }}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="max-h-[88vh] rounded-[28px] border border-white/10 bg-[#0b0c10] px-5 py-5">
            {/* Header */}
            <View className="mb-4 flex-row items-start justify-between gap-4 bg-transparent">
              <View className="flex-1 gap-2 bg-transparent">
                <View className="self-start rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1">
                  <Text className="text-[10px] uppercase tracking-[2px] text-amber-300">VIP</Text>
                </View>
                <Text size={22} className="font-semibold text-white">
                  {t('subscriptionTitle')}
                </Text>
                <Text className="text-xs leading-5 text-white/60">
                  {t('subscriptionSubtitle')}
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
              <View className="gap-4 bg-transparent">
                {/* ===== Free Plan Card ===== */}
                <View
                  className={`rounded-3xl border p-4 ${
                    userTier === 'Free' ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <View className="mb-3 flex-row items-start justify-between bg-transparent">
                    <View className="gap-1 bg-transparent">
                      <Text className="text-lg font-semibold text-white">{t('freePlan')}</Text>
                      <Text className="text-xs text-white/55">{t('permanentFree')}</Text>
                    </View>
                    {userTier === 'Free' && (
                      <View className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1">
                        <Text className="text-[10px] uppercase tracking-[2px] text-cyan-300">
                          {t('currentPlan')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="mb-4 gap-2 bg-transparent">
                    {freeFeatures.map((feature) => (
                      <View key={feature} className="flex-row items-start gap-2 bg-transparent">
                        <Ionicons name="checkmark-circle-outline" size={16} color="#67e8f9" style={{ marginTop: 1 }} />
                        <Text className="flex-1 text-sm leading-5 text-white/75">{feature}</Text>
                      </View>
                    ))}
                  </View>
                  <Pressable
                    disabled={userTier === 'Free'}
                    onPress={handleDowngradeToFree}
                    className={`items-center rounded-2xl px-4 py-3 ${
                      userTier === 'Free' ? 'bg-white/10' : 'bg-white'
                    }`}
                  >
                    <Text className={`font-semibold ${userTier === 'Free' ? 'text-white/45' : 'text-black'}`}>
                      {userTier === 'Free' ? t('currentPlan') : t('switchToFree')}
                    </Text>
                  </Pressable>
                </View>

                {/* ===== Pro Plan Card ===== */}
                <View
                  className={`rounded-3xl border p-4 ${
                    userTier === 'Pro' ? 'border-amber-400/40 bg-amber-400/10' : 'border-white/10 bg-white/5'
                  }`}
                >
                  <View className="mb-3 flex-row items-start justify-between bg-transparent">
                    <View className="gap-1 bg-transparent">
                      <View className="flex-row items-center gap-2 bg-transparent">
                        <MaterialIcons name="workspace-premium" size={18} color="#fbbf24" />
                        <Text className="text-lg font-semibold text-white">{t('proPlan')}</Text>
                      </View>
                      <Text className="text-xs text-white/55">{t('unlimited')}</Text>
                    </View>
                    {userTier === 'Pro' && (
                      <View className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1">
                        <Text className="text-[10px] uppercase tracking-[2px] text-amber-300">
                          {t('currentPlan')}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View className="mb-4 gap-2 bg-transparent">
                    {proFeatures.map((feature) => (
                      <View key={feature} className="flex-row items-start gap-2 bg-transparent">
                        <Ionicons name="checkmark-circle-outline" size={16} color="#fbbf24" style={{ marginTop: 1 }} />
                        <Text className="flex-1 text-sm leading-5 text-white/75">{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Pro 用户: 管理订阅 → Stripe Customer Portal */}
                  {userTier === 'Pro' ? (
                    <Pressable
                      disabled={managing}
                      onPress={handleManageSubscription}
                      className="items-center rounded-2xl px-4 py-3 bg-white/10"
                    >
                      {managing ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="font-semibold text-white/80">
                          管理订阅
                        </Text>
                      )}
                    </Pressable>
                  ) : (
                    /* Free 用户: 升级 Pro → Stripe Checkout */
                    <Pressable
                      disabled={paying}
                      onPress={handleUpgradeToPro}
                      className="items-center rounded-2xl px-4 py-3 bg-amber-400"
                    >
                      {paying ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <Text className="font-semibold text-black">
                          {t('upgradeToPro') || '升级到 Pro'}
                        </Text>
                      )}
                    </Pressable>
                  )}
                </View>

                {/* Close Button */}
                <Pressable onPress={onClose} className="mt-1 items-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
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

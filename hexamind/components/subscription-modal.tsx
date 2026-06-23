import React, { useCallback } from 'react';
import { Alert, Modal, Pressable, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { useStore } from '@/store';
import { profilesRepository } from '@/db/apis';

interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SubscriptionModal({ visible, onClose }: SubscriptionModalProps) {
  const userTier = useStore((state) => state.userTier);
  const setUserTier = useStore((state) => state.setUserTier);
  const { t } = useTranslation();

  const session = useStore((state) => state.session);

  const handleUserTierChange = useCallback(
    async (tier: 'Free' | 'Pro') => {
      try {
        // 写入本地
        await setUserTier(tier);
        // 同步到 Supabase（profiles.tier）
        if (session?.user?.id) {
          await profilesRepository.setTier(session.user.id, tier);
        }
      } catch {
        Alert.alert('HexaMind', '订阅状态保存失败');
      }
    },
    [setUserTier, session]
  );

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
                    {userTier === 'Free' ? (
                      <View className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1">
                        <Text className="text-[10px] uppercase tracking-[2px] text-cyan-300">
                          {t('currentPlan')}
                        </Text>
                      </View>
                    ) : null}
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
                    onPress={() => handleUserTierChange('Free')}
                    className={`items-center rounded-2xl px-4 py-3 ${
                      userTier === 'Free' ? 'bg-white/10' : 'bg-white'
                    }`}
                  >
                    <Text className={`font-semibold ${userTier === 'Free' ? 'text-white/45' : 'text-black'}`}>
                      {userTier === 'Free' ? t('currentPlan') : t('switchToFree')}
                    </Text>
                  </Pressable>
                </View>

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
                    {userTier === 'Pro' ? (
                      <View className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1">
                        <Text className="text-[10px] uppercase tracking-[2px] text-amber-300">
                          {t('currentPlan')}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View className="mb-4 gap-2 bg-transparent">
                    {proFeatures.map((feature) => (
                      <View key={feature} className="flex-row items-start gap-2 bg-transparent">
                        <Ionicons name="checkmark-circle-outline" size={16} color="#fbbf24" style={{ marginTop: 1 }} />
                        <Text className="flex-1 text-sm leading-5 text-white/75">{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <Pressable
                    disabled={userTier === 'Pro'}
                    onPress={() => handleUserTierChange('Pro')}
                    className={`items-center rounded-2xl px-4 py-3 ${
                      userTier === 'Pro' ? 'bg-white/10' : 'bg-amber-400'
                    }`}
                  >
                    <Text className={`font-semibold ${userTier === 'Pro' ? 'text-white/45' : 'text-black'}`}>
                      {userTier === 'Pro' ? t('currentPlan') : t('upgradeToPro')}
                    </Text>
                  </Pressable>
                </View>

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

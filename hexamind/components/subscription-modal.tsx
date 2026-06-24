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
        // 支付 + 验证成功，刷新 store
        await syncProfileFromSupabase(session.user.id);
      }
    } finally {
      setPaying(false);
    }
  }, [session, syncProfileFromSupabase]);

  // ===== Stripe Customer Portal（管理/取消订阅） =====
  const handleManageSubscription = useCallback(async () => {
    if (userTier === 'Pro') return
    setManaging(true);
    try {
      const success = await openCustomerPortal();
      if (success && session?.user?.id) {
        await syncProfileFromSupabase(session.user.id);
      }
    } finally {
      setManaging(false);
    }
  }, [userTier, session, syncProfileFromSupabase]);

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
    '每天获取最多 3 次决策推演配额',
    '固定的服务器时间和固定地理位置 (限制自定义 LBS)',
    '锁定微波动能 (Kinetic Pad) 以防止混噪编译',
    '会话记录仅在内存中保留 (无持久化数据库)',
    '限制 Hexa AI Counsel 智能决策参谋阁聊天',
  ];

  const proFeatures = [
    '解锁全功能 San-Cai 三才定位起步种子',
    '支持自定义高精 LBS 地理与实时微波矢量',
    '解锁 Hexa AI Chat Counsel Stateful 决策参谋阁',
    '每月1日后台进行企业资产星曜矩阵算力编译',
    '历史记录永久云持久化与 MAX_ADV 特种商业分类',
    '附带7天免费体验期 (需要预绑定 Stripe 或 订阅支付)',
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', padding: 20, justifyContent: 'center' }}>
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="max-h-[90vh] rounded-lg border border-neutral-800 bg-[#0b0c0d] px-5 py-5 shadow-[0_0_80px_rgba(0,0,0,0.95)]" style={{ borderColor: 'rgba(38,38,38,1)' }}>
            {/* Top accent bar */}
            <View className="absolute top-0 left-0 w-full h-[4px] bg-neutral-700" />

            {/* Close button */}
            <Pressable
              onPress={onClose}
              className="absolute top-5 right-5 h-9 w-9 items-center justify-center rounded-full border border-neutral-800"
            >
              <Ionicons name="close" size={20} color="#a3a3a3" />
            </Pressable>

            {/* Header */}
            <View className="mt-8 mb-6 items-center bg-transparent">
              <View className="mb-3 inline-flex flex-row items-center gap-1.5 self-center rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1">
                <Ionicons name="sparkles" size={14} color="#a3a3a3" />
                <Text size={12} className="font-mono font-semibold uppercase tracking-[0.2em] text-neutral-300">VIP CLOUD MATRIX LICENSE</Text>
              </View>
              <Text className="text-center text-xl font-light uppercase tracking-[0.15em] text-white">
                Hexamind <Text className="font-semibold text-neutral-400">专属特权顾问</Text>
              </Text>
              <Text className="mx-auto mt-2 max-w-lg text-center text-xs leading-relaxed text-neutral-500">
                注入专属时空信号轨算力，解锁无限次预测、更高保真数字梅花算法，以及跨时间跨维度的智能决策建议卷轴。
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="gap-6 bg-transparent">
                {/* ===== Free Plan Card ===== */}
                <View
                  className={`rounded-md border p-5 ${userTier === 'Free' ? 'border-neutral-500 bg-neutral-900/40' : 'border-neutral-900 bg-black/30'
                    }`}
                >
                  {userTier === 'Free' && (
                    <View className="mb-3 self-end rounded-full border border-neutral-500/30 bg-neutral-500/10 px-2 py-0.5">
                      <Text className="text-[8px] font-mono font-bold uppercase tracking-widest text-neutral-400">CURRENT</Text>
                    </View>
                  )}
                  <View className="gap-1 bg-transparent">
                    <Text className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-400">入门体验版</Text>
                    <Text className="text-[10px] text-neutral-500">核心功能初探体验</Text>
                  </View>

                  <View className="mb-5 mt-3 flex-row items-baseline gap-1">
                    <Text className="font-mono text-2xl font-light tracking-tight text-neutral-400">$0.00</Text>
                    <Text className="font-mono text-[10px] text-neutral-500">/ 永久免费</Text>
                  </View>

                  <View className="mb-5 border-t border-neutral-800 pt-4">
                    {freeFeatures.map((feature) => (
                      <View key={feature} className="mb-2.5 flex-row items-start gap-2">
                        <Ionicons name="checkmark" size={14} color="#a3a3a3" style={{ marginTop: 2 }} />
                        <Text className="flex-1 text-xs leading-snug text-neutral-400">{feature}</Text>
                      </View>
                    ))}
                  </View>

                  <Pressable
                    disabled={userTier === 'Free'}
                    onPress={handleDowngradeToFree}
                    className={`w-full items-center rounded-sm py-2.5 ${userTier === 'Free' ? 'border border-neutral-500/20 bg-neutral-500/10' : 'border border-neutral-700 bg-neutral-800'
                      }`}
                  >
                    <Text className={`font-mono text-[10px] font-bold uppercase tracking-widest ${userTier === 'Free' ? 'text-neutral-500/70' : 'text-neutral-100'
                      }`}>
                      {userTier === 'Free' ? '当前活跃套餐' : '重置为体验版'}
                    </Text>
                  </Pressable>
                </View>

                {/* ===== Pro Plan Card ===== */}
                <View
                  className={`rounded-md border mt-4 p-5 ${userTier === 'Pro' ? 'border-neutral-400 bg-neutral-900/60' : 'border-neutral-900 bg-black/30'
                    }`}
                >
                  {/* Executive Choice badge */}
                  <View
                    className="absolute right-5 z-10 -translate-y-1/2 rounded-full border border-neutral-700 bg-neutral-800 px-2.5 py-0.5"
                    style={{ top: 0 }}
                  >
                    <Text className="font-mono text-[8px] font-bold uppercase tracking-widest text-neutral-200">EXECUTIVE CHOICE</Text>
                  </View>

                  {userTier === 'Pro' && (
                    <View className="mb-3 self-end animate-pulse rounded-full border border-neutral-400/20 bg-neutral-400/10 px-2 py-0.5">
                      <Text className="font-mono text-[8px] font-bold uppercase tracking-widest text-neutral-300">PRO PRESTIGE</Text>
                    </View>
                  )}
                  <View className="gap-1 bg-transparent">
                    <View className="flex-row items-center gap-1">
                      <MaterialIcons name="workspace-premium" size={14} color="#a3a3a3" />
                      <Text className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-300">高级顾问企业版</Text>
                    </View>
                    <Text className="text-[10px] text-neutral-500">商业战略预测及决策顾问级别</Text>
                  </View>

                  <View className="mb-5 mt-3 flex-row items-baseline gap-1">
                    <Text className="font-mono text-2xl font-light tracking-tight text-neutral-300">$49.99</Text>
                    <Text className="font-mono text-[10px] text-neutral-500">/ 卓越无限</Text>
                  </View>

                  <View className="mb-5 border-t border-neutral-800 pt-4">
                    {proFeatures.map((feature) => (
                      <View key={feature} className="mb-2.5 flex-row items-start gap-2">
                        <Ionicons name="checkmark" size={14} color="#a3a3a3" style={{ marginTop: 2 }} />
                        <Text className="flex-1 text-xs leading-snug text-neutral-400">{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Pro 用户: 管理订阅 → Stripe Customer Portal */}
                  {userTier === 'Pro' ? (
                    <Pressable
                      disabled={managing}
                      onPress={handleManageSubscription}
                      className="w-full items-center rounded-sm border border-neutral-700 bg-neutral-800 py-2.5"
                    >
                      {managing ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                          当前活跃套餐
                        </Text>
                      )}
                    </Pressable>
                  ) : (
                    /* Free 用户: 升级 Pro → Stripe Checkout */
                    <Pressable
                      disabled={paying}
                      onPress={handleUpgradeToPro}
                      className="w-full items-center rounded-sm border border-neutral-800 bg-neutral-900 py-2.5"
                    >
                      {paying ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text className="font-mono text-[10px] font-bold uppercase tracking-widest text-white">
                          升级专业顾问版
                        </Text>
                      )}
                    </Pressable>
                  )}
                </View>

                {/* Security / Assurance bar */}
                <View className="mt-2 flex-col items-center gap-3.5 rounded-sm border border-neutral-900 bg-white/[0.01] p-3.5 md:flex-row md:justify-between">
                  <View className="flex-row items-center gap-2.5">
                    <Ionicons name="shield-checkmark-outline" size={20} color="#a3a3a3" />
                    <View>
                      <Text className="font-sans text-[11px] font-bold text-white">100% 安全交易保障</Text>
                      <Text className="font-mono text-[9px] text-neutral-500">全流程采用端到端量子非对称强加密进行授权，绝不泄露个人提问。</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="font-mono text-[10px] text-neutral-500">支付支持:</Text>
                    <Text className="rounded-sm bg-neutral-400/10 px-1.5 py-0.5 font-mono text-xs font-bold tracking-widest text-neutral-400">Stripe</Text>
                    <Text className="rounded-sm bg-neutral-400/10 px-1.5 py-0.5 font-mono text-xs font-bold tracking-widest text-neutral-400">ApplePay</Text>
                  </View>
                </View>

                {/* Close Button */}
                {/* <Pressable onPress={onClose} className="mt-6 items-center rounded-sm border border-neutral-800 px-5 py-2">
                  <Text className="font-mono text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                    {t('close') || '关闭控制台'}
                  </Text>
                </Pressable> */}
              </View>
            </ScrollView>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

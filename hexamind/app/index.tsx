import { useState } from 'react';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/themed-text';
import { View } from '@/components/themed-view';
import { useStore } from '@/store';
import { MainLayout } from '@/components/main-layout';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { GradientText } from '@/components/gradient-text';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SubscriptionModal } from '@/components/subscription-modal';
import { SettingsModal } from '@/components/settings-modal';

export default function IndexScreen() {
  const userTier = useStore((state) => state.userTier);
  const { t } = useTranslation();
  const [subscriptionVisible, setSubscriptionVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <MainLayout>
      <>
        <ParallaxScrollView>
          <View className="pt-[60] px-[28]">
            <View className="gap-2.5">
              <View className="flex-row flex-wrap items-center gap-1">
                <Text size={30} className="uppercase font-light tracking-[3px]">
                  HexaMind
                </Text>
                <GradientText size={30} title="易道流光" />
              </View>
              <Text className="text-xs uppercase tracking-[1.6px] opacity-50">
                {t('appSubtitle')}
              </Text>
            </View>

            <View className="mt-2 ml-auto flex w-full flex-row items-center justify-end gap-2">
              <Pressable
                onPress={() => setSubscriptionVisible(true)}
                className="rounded-sm border border-slate-500/30 bg-slate-500/10 px-2.5 py-1.5 opacity-80"
              >
                <Text size={12}>{userTier === 'Pro' ? t('proEdition') : t('starterEdition')}</Text>
              </Pressable>

              <Pressable
                onPress={() => setSettingsVisible(true)}
                className="relative items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 opacity-80"
              >
                <Ionicons name="settings" color="white" size={14} />
                <View
                  className="absolute right-0 top-0 h-2 w-2 rounded-full"
                  style={{ backgroundColor: '#f59e0b' }}
                />
              </Pressable>

              <View className="items-center justify-center rounded-sm border border-white/10 bg-white/5 p-2 opacity-80">
                <MaterialIcons name="history" size={14} color="white" />
              </View>
            </View>
          </View>
        </ParallaxScrollView>

        <SubscriptionModal visible={subscriptionVisible} onClose={() => setSubscriptionVisible(false)} />

        <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
      </>
    </MainLayout>
  );
}

import { useEffect, useState } from 'react';
import { Pressable, TextInput, } from 'react-native';
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
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons'
import DateTimePicker from "@react-native-community/datetimepicker";
import EvilIcons from '@expo/vector-icons/EvilIcons'
import AntDesign from '@expo/vector-icons/AntDesign'
import Feather from '@expo/vector-icons/Feather'
import { Redirect, useRouter } from 'expo-router';


export default function IndexScreen() {
  const userTier = useStore((state) => state.userTier);
  const { t } = useTranslation();
  const [subscriptionVisible, setSubscriptionVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {

  }, [])


  return (
    <MainLayout>
      <>
        <ParallaxScrollView>
          <View className="pt-[60] px-[28]">
            <View className="gap-2.5">
              <View className="flex-row flex-wrap items-center gap-1">
                <Text size={30} className="text-white uppercase font-light tracking-[3px]">
                  HexaMind
                </Text>
                <GradientText size={30} title="易道流光" />
              </View>
              <Text size={12} className="text-white uppercase tracking-[1.6px] opacity-50">
                {t('appSubtitle')}
              </Text>
            </View>

            <View className="mt-2 ml-auto flex w-full flex-row items-center justify-end gap-2">
              <Pressable
                onPress={() => setSubscriptionVisible(true)}
                className="rounded-sm border border-slate-500/30 bg-slate-500/10 px-2.5 py-1.5 opacity-80"
              >
                <Text size={12} className="text-white">{userTier === 'Pro' ? t('proEdition') : t('starterEdition')}</Text>
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
                <MaterialIcons name="history" size={16} color="white" />
              </View>
            </View>

            <View className="flex flex-row items-center gap-2 mt-2 mb-5">
              <Ionicons name="sparkles-sharp" size={12} color="#f59e0b" />
              <Text className="text-white font-bold uppercase tracking-wider">
                时空决策模型推演台
              </Text>
            </View>

            <View className="p-3.5 rounded-sm border border-red-500/30" style={{ backgroundColor: 'rgba(251, 44, 54,0.02)' }}>
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-2 font-mono font-bold uppercase tracking-wider"  >
                  <SimpleLineIcons name="question" size={16} color="rgba(251,44,54,1)" />
                  <Text style={{ color: "#fb2c36" }}>当前决策</Text>
                </View>
                <MaterialCommunityIcons name="star-four-points" size={12} color="#90a1b9" />
              </View>
              <View>
                <TextInput
                  className="p-2 rounded-sm mt-3.5 min-h-[60] max-h-[120] placeholder:text-white"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                  }}
                  multiline={true}
                  placeholder='例如：该核心供应链采购合同在当前汇率条款下，本周五能否在低风险水平下闭环落地？'
                />
              </View>
            </View>

            <View className="mt-3.5 p-3.5 rounded-sm border border-[#ff6900]/30" style={{ backgroundColor: 'rgba(251, 44, 54,0.02)' }}>
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-2 font-mono font-bold uppercase tracking-wider"  >
                  <MaterialIcons name="access-time" size={16} color="#ff6900" />
                  <Text style={{ color: "#ff6900" }}>时间时序</Text>
                </View>
                <View className="font-mono font-normal  border border-orange-500/30  px-1.5 py-0.5 rounded-sm transition-all  select-none" style={{ backgroundColor: "rgba(255, 105, 0,0.05)" }} >
                  <Text style={{ color: "#ff6900" }}>注入时间轨迹</Text>
                </View>
              </View>
              <View className="p-2 rounded-sm mt-3.5 flex flex-row items-center justify-between border border-white/10" style={{
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}>
                <DateTimePicker
                  className="w-full bg-transparent"
                  value={new Date()}
                  mode="date"
                  display="default"
                  onChange={() => { }}
                />
                <AntDesign name="calendar" size={16} color="rgba(255,255,255,0.2)" />
              </View>
            </View>

            <View className="mt-3.5 relative rounded-sm border border-[#2b7fff]/30" style={{ backgroundColor: 'rgba(251, 44, 54,0.02)' }}>
              <View className="p-3.5  "  >
                <View className="flex flex-row items-center justify-between">
                  <View className="flex flex-row items-center gap-2 font-mono font-bold uppercase tracking-wider"  >
                    <EvilIcons name="location" size={16} color="#2b7fff" />
                    <Text style={{ color: "#2b7fff" }}>空间定位</Text>
                  </View>
                  <View className="font-mono font-normal  border border-[#2b7fff]/30  px-1.5 py-0.5 rounded-sm transition-all  select-none" style={{ backgroundColor: "rgba(255, 105, 0,0.05)" }} >
                    <Text style={{ color: "#2b7fff" }}>获取空间定位</Text>
                  </View>
                </View>
                <View className="flex flex-row gap-4 w-full pt-4"  >
                  <View className='flex-1'>
                    <Text size={14} className="pb-2 text-white/50">
                      纬度
                    </Text>
                    <View className='rounded-sm   border border-white/10 h-[40] flex flex-row items-center px-2' style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                    }}>
                      <Text className='text-white/80'>- -</Text>
                    </View>
                  </View>
                  <View className='flex-1'>
                    <Text size={14} className="pb-2 text-white/50">
                      经度
                    </Text>
                    <View className='rounded-sm  border border-white/10 h-[40] flex flex-row items-center px-2' style={{
                      backgroundColor: 'rgba(0,0,0,0.5)',
                    }}>
                      <Text className='text-white/80'>- -</Text>
                    </View>
                  </View>
                </View>
              </View>
              {/* 未解锁 */}
              <View className="opacity-100 absolute inset-0 backdrop-blur-lg z-25   rounded-sm border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all bg-black/90 border-neutral-700/80 text-neutral-400  ">
                <View className="uppercase font-bold tracking-wider">
                  <Text className='opacity-50 text-white'>空间定位已锁定</Text>
                </View>
                <View className="mt-1.5 leading-relaxed text-neutral-500 max-w-[260]">
                  <Text size={14} className='opacity-50 text-center text-white'>
                    入门版强制使用系统默认服务器坐标 (31.23, 121.47)。
                  </Text>
                </View>
              </View>
            </View>

            {/* 意念动能版 */}

            <View className="mt-3.5 relative rounded-sm border border-[#ad46ff]/30" style={{ backgroundColor: 'rgba(251, 44, 54,0.02)' }}>
              <View className="p-3.5  "  >
                <View className="flex flex-row items-center justify-between">
                  <View className="flex flex-row items-center gap-2 font-mono font-bold uppercase tracking-wider"  >
                    <Feather name="activity" size={16} color="#ad46ff" />
                    <Text className="text-[#ad46ff]">意念动能</Text>
                  </View>
                </View>
                <View className="flex flex-row items-center justify-center h-[60] rounded-s-md mt-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)', }} >
                  <Text size={12} className='opacity-30 text-white'>聚精会神，在此划动涂抹后松开</Text>
                </View>
              </View>
              {/* 未解锁 */}
              <View className="opacity-100 absolute inset-0 backdrop-blur z-25   rounded-sm border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all bg-black/90 border-[#ad46ff]/40   ">
                <View className="uppercase font-bold tracking-wider">
                  <Text className='opacity-50 text-white'>意念动能板已锁定</Text>
                </View>
                <View className="mt-1.5 leading-relaxed text-neutral-500 max-w-[260]">
                  <Text size={14} className='text-center text-white/50'>
                    升级至专业顾问版以校准自定义触控动能编译面板。
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              onPress={() => {
                router.push('/detail')
              }}
              className="mt-3.5 relative flex flex-row items-center justify-center gap-1 rounded-md border border-white/10 bg-white h-[46] opacity-80"
            >
              <SimpleLineIcons name="compass" size={16} color="#000000" />
              <Text size={18} className='text-center font-bold' style={{ color: "#000" }}>
                执行系统决策矩阵推演
              </Text>
            </Pressable>

          </View>
        </ParallaxScrollView>

        <SubscriptionModal visible={subscriptionVisible} onClose={() => setSubscriptionVisible(false)} />

        <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
      </>
    </MainLayout>
  );
}

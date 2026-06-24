import { useCallback, useEffect, useState } from 'react'
import { Platform, Pressable, TextInput } from 'react-native'
import { useTranslation } from 'react-i18next'
import DateTimePicker from '@/components/form/date-time-picker'
import Toast from 'react-native-toast-message'
import { router } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import Feather from '@expo/vector-icons/Feather'

import { Text } from '@/components/themed-text'
import { View } from '@/components/themed-view'
import { MainLayout } from '@/components/main-layout'
import ParallaxScrollView from '@/components/parallax-scroll-view'
import { GradientText } from '@/components/gradient-text'
import { SubscriptionModal } from '@/components/subscription-modal'
import { SettingsModal } from '@/components/settings-modal'
import * as Location from 'expo-location'
import { supabase } from '@/db/supabase'
import { useStore } from '@/store'
import { divinate } from '@/lib/divination'
import type { DivinationResult, DivinationHistoryItem } from '@/types'

const DEFAULT_LAT = 31.23
const DEFAULT_LNG = 121.47

export default function IndexScreen() {
  const { t } = useTranslation()
  const userTier = useStore((state) => state.userTier)
  const userTierLoading = useStore((state) => state.userTierLoading)
  const session = useStore((state) => state.session)

  // == 模态框 ==
  const [subscriptionVisible, setSubscriptionVisible] = useState(false)
  const [settingsVisible, setSettingsVisible] = useState(false)

  // == 输入状态 ==
  const [question, setQuestion] = useState('')
  const [timestamp, setTimestamp] = useState<number>(Date.now())
  const isWeb = Platform.OS === 'web'

  // == 空间定位 ==
  const [latitude, setLatitude] = useState<number>(DEFAULT_LAT)
  const [longitude, setLongitude] = useState<number>(DEFAULT_LNG)
  const [gpsLoading, setGpsLoading] = useState(false)

  // == 意念动能 ==
  const [kineticSpeed, setKineticSpeed] = useState(1.23)
  const [hasScratched, setHasScratched] = useState(false)

  // == 执行状态 ==
  const [isLoading, setIsLoading] = useState(false)

  // ============================================
  // 1. 自动获取 GPS
  // ============================================
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') return

      setGpsLoading(true)
      try {
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 8000,
        })
        setLatitude(Number(pos.coords.latitude.toFixed(4)))
        setLongitude(Number(pos.coords.longitude.toFixed(4)))
      } catch {
        // 获取失败则保持默认 (31.23, 121.47)
      } finally {
        setGpsLoading(false)
      }
    })()
  }, [])

  // ============================================
  // 2. 时间选择（已封装到 DateTimePicker 组件）
  // ============================================

  // ============================================
  // 3. 手写动能板（简化：点击模拟划动）
  // ============================================
  const handleKineticTap = useCallback(() => {
    if (userTier !== 'Pro') {
      setSubscriptionVisible(true)
      return
    }
    setHasScratched(true)
    // 模拟一个随机动能值
    setKineticSpeed(Number((0.5 + Math.random() * 4.5).toFixed(3)))
  }, [userTier])

  // ============================================
  // 4. 执行推演
  // ============================================
  const handleExecute = useCallback(async () => {
    // 4a. 验证问题
    if (!question.trim()) {
      Toast.show({
        type: 'error',
        text1: t('pleaseStateQuestion'),
        visibilityTime: 2000,
      })
      return
    }

    setIsLoading(true)

    try {
      const resolvedLat = userTier === 'Free' ? DEFAULT_LAT : latitude
      const resolvedLng = userTier === 'Free' ? DEFAULT_LNG : longitude
      const resolvedTs = timestamp || Date.now()

      // 4b. 调用 divinate Edge Function
      const apiData = await divinate({
        question: question.trim(),
        latitude: resolvedLat,
        longitude: resolvedLng,
        kineticValue: kineticSpeed,
        timestamp: resolvedTs,
        language: 'zh-CN',
      })

      if (!apiData.success) {
        throw new Error(apiData.error || '推演失败')
      }

      // 4c. 存入 store 用于详情页渲染
      const resultId = apiData.recordId ?? `cast-${Date.now()}`
      const result: DivinationResult = {
        success: true,
        confidenceScore: apiData.confidenceScore,
        input: apiData.input!,
        payload: apiData.payload!,
        aiOutput: apiData.aiOutput,
      }

      const payload = apiData.payload!
      const historyItem: DivinationHistoryItem = {
        id: resultId,
        date: new Date(resolvedTs).toISOString(),
        question: question.trim(),
        originalGua: payload.charts.original.name,
        conclusion: payload.relationship.conclusion,
        auspiciousness: payload.relationship.auspiciousness,
        confidenceScore: apiData.confidenceScore,
        latitude: resolvedLat,
        longitude: resolvedLng,
        kineticValue: kineticSpeed,
        timestamp: resolvedTs,
      }

      useStore.getState().setCurrentResult(resultId, result)
      useStore.getState().addHistoryItem(historyItem)

      // 4d. 跳转详情页
      Toast.show({
        type: 'success',
        text1: '推演成功',
        text2: '已保存到云端',
        visibilityTime: 2000,
      })
      router.push(`/detail?id=${resultId}`)
    } catch (err: any) {
      console.error('Divination execution failed:', err)
      Toast.show({
        type: 'error',
        text1: '推演失败',
        text2: err?.message || t('errorGeneric'),
        visibilityTime: 3000,
      })
    } finally {
      setIsLoading(false)
    }
  }, [question, timestamp, latitude, longitude, kineticSpeed, userTier, session, t])

  // ============================================
  // Render
  // ============================================
  // userTierLoading 期间不展示锁定态，等服务端同步完成后确定实际 tier
  const isFree = !userTierLoading && userTier === 'Free'
  const displayDate = new Date(timestamp)

  return (
    <MainLayout>
      <>
        <ParallaxScrollView>
          <View className="pt-[60] px-[28]">
            {/* ===== 标题 ===== */}
            <View className="gap-2.5">
              <View className="flex-row flex-wrap items-center gap-1">
                <Text
                  size={30}
                  className="text-white uppercase font-light tracking-[3px]"
                >
                  HexaMind
                </Text>
                <GradientText size={30} title="易道流光" />
              </View>
              <Text
                size={12}
                className="text-white uppercase tracking-[1.6px] opacity-50"
              >
                {t('appSubtitle')}
              </Text>
            </View>

            {/* ===== 操作栏 ===== */}
            <View className="mt-2 ml-auto flex w-full flex-row items-center justify-end gap-2">
              <Pressable
                onPress={() => setSubscriptionVisible(true)}
                className="rounded-sm border border-slate-500/30 bg-slate-500/10 px-2.5 py-1.5 opacity-80"
              >
                <Text size={12} className="text-white">
                  {isFree ? t('starterEdition') : t('proEdition')}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setSettingsVisible(true)}
                className="relative items-center justify-center rounded-full border border-white/10 bg-white/5 p-2 opacity-80"
              >
                <Ionicons name="settings" color="white" size={14} />
                <View className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#f59e0b]" />
              </Pressable>

              <Pressable
                onPress={() => router.push('/history')}
                className="items-center justify-center rounded-sm border border-white/10 bg-white/5 p-2 opacity-80"
              >
                <MaterialIcons name="history" size={16} color="white" />
              </Pressable>
            </View>

            {/* ===== 副标题 ===== */}
            <View className="mt-2 mb-5 flex flex-row items-center gap-2">
              <Ionicons name="sparkles-sharp" size={12} color="#f59e0b" />
              <Text className="font-bold uppercase tracking-wider text-white">
                {t('decisionTitle') || '时空决策模型推演台'}
              </Text>
            </View>

            {/* ===== 1. 当前决策 ===== */}
            <View
              className="rounded-sm border border-red-500/30 p-3.5"
              style={{ backgroundColor: 'rgba(251,44,54,0.02)' }}
            >
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-2">
                  <SimpleLineIcons name="question" size={14} color="#fb2c36" />
                  <Text size={14} style={{ color: '#fb2c36' }} className="font-bold uppercase tracking-wider">
                    {t('currentDecision')}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="star-four-points"
                  size={12}
                  color="#90a1b9"
                />
              </View>

              <View className="mt-3.5">
                <TextInput
                  className="min-h-[60] max-h-[120] rounded-sm p-2 text-white placeholder:text-white/30 placeholder:text-sm"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  }}
                  multiline
                  value={question}
                  onChangeText={setQuestion}
                  placeholder={t('questionPlaceholder')}
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>
            </View>

            {/* ===== 2. 时间时序 ===== */}
            <View
              className="mt-3.5 rounded-sm border border-[#ff6900]/30 p-3.5"
              style={{ backgroundColor: 'rgba(251,44,54,0.02)' }}
            >
              <View className="flex flex-row items-center justify-between">
                <View className="flex flex-row items-center gap-2">
                  <MaterialIcons name="access-time" size={14} color="#ff6900" />
                  <Text size={14} style={{ color: '#ff6900' }} className="font-bold uppercase tracking-wider">
                    {t('timeSequence')}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setTimestamp(Date.now())}
                  className="rounded-sm border border-orange-500/30 px-1.5 py-0.5"
                  style={{ backgroundColor: 'rgba(255,105,0,0.05)' }}
                >
                  <Text style={{ color: '#ff6900' }} size={14}>
                    {t('resetTime')}
                  </Text>
                </Pressable>
              </View>
              {/* 跨平台日期时间选择器 */}
              <DateTimePicker
                value={timestamp}
                onChange={setTimestamp}
                className="mt-3.5"
              />
            </View>

            {/* ===== 3. 空间定位 ===== */}
            <View
              className="relative mt-3.5 rounded-sm border border-[#2b7fff]/30"
              style={{ backgroundColor: 'rgba(251,44,54,0.02)' }}
            >
              <View className="p-3.5">
                <View className="flex flex-row items-center justify-between">
                  <View className="flex flex-row items-center gap-1">
                    <EvilIcons name="location" size={18} color="#2b7fff" />
                    <Text size={14} style={{ color: '#2b7fff' }} className="font-bold uppercase tracking-wider">
                      {t('spatialPositioning')}
                    </Text>
                  </View>
                  <Pressable
                    onPress={async () => {
                      if (isFree) {
                        setSubscriptionVisible(true)
                        return
                      }
                      const { status } = await Location.requestForegroundPermissionsAsync()
                      if (status !== 'granted') return
                      try {
                        const pos = await Location.getCurrentPositionAsync({
                          accuracy: Location.Accuracy.High,
                        })
                        setLatitude(Number(pos.coords.latitude.toFixed(4)))
                        setLongitude(Number(pos.coords.longitude.toFixed(4)))
                      } catch {
                        // 静默处理
                      }
                    }}
                    className="rounded-sm border border-[#2b7fff]/30 px-1.5 py-0.5"
                    style={{ backgroundColor: 'rgba(255,105,0,0.05)' }}
                  >
                    <Text style={{ color: '#2b7fff' }} size={14}>
                      {gpsLoading ? t('locating') : t('getLocation')}
                    </Text>
                  </Pressable>
                </View>

                <View className="flex w-full flex-row gap-4 pt-4">
                  <View className="flex-1">
                    <Text size={14} className="pb-2 text-white/50">
                      {t('latitude')}
                    </Text>
                    <View
                      className="flex h-[40] flex-row items-center rounded-sm border border-white/10 px-2"
                      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >
                      <Text className="text-white/80">{latitude.toFixed(4)}</Text>
                    </View>
                  </View>
                  <View className="flex-1">
                    <Text size={14} className="pb-2 text-white/50">
                      {t('longitude')}
                    </Text>
                    <View
                      className="flex h-[40] flex-row items-center rounded-sm border border-white/10 px-2"
                      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    >
                      <Text className="text-white/80">{longitude.toFixed(4)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Free 锁定遮罩 */}
              {isFree && (
                <View className="absolute inset-0 z-25 flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-neutral-700/80 bg-black/90 p-4">
                  <Text className="text-white/50 uppercase tracking-wider font-bold">
                    {t('locationLocked')}
                  </Text>
                  <Text
                    size={14}
                    className="mt-1.5 max-w-[260px] text-center leading-relaxed text-white/50"
                  >
                    {t('locationLockedDesc')}
                  </Text>
                </View>
              )}
            </View>

            {/* ===== 4. 意念动能板 ===== */}
            <View
              className="relative mt-3.5 rounded-sm border border-[#ad46ff]/30"
              style={{ backgroundColor: 'rgba(251,44,54,0.02)' }}
            >
              <View className="p-3.5">
                <View className="flex flex-row items-center justify-between">
                  <View className="flex flex-row items-center gap-2">
                    <Feather name="activity" size={14} color="#ad46ff" />
                    <Text size={14} style={{ color: '#ad46ff' }} className="font-bold uppercase tracking-wider">
                      {t('kineticPad')}
                    </Text>
                  </View>
                  {hasScratched && (
                    <Pressable
                      onPress={() => {
                        setHasScratched(false)
                        setKineticSpeed(1.23)
                      }}
                      className="rounded-sm border border-purple-500/30 px-1.5 py-0.5"
                    >
                      <Text style={{ color: '#ad46ff' }} size={10}>
                        {t('reset')}
                      </Text>
                    </Pressable>
                  )}
                </View>

                <Pressable
                  onPress={handleKineticTap}
                  className="mt-4 flex h-[60] flex-row items-center justify-center rounded-sm"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                >
                  {hasScratched ? (
                    <Text size={13} className="text-purple-400">
                      {t('kineticValue')}：{kineticSpeed.toFixed(3)} m/s²
                    </Text>
                  ) : (
                    <Text size={12} className="text-white/30">
                      {t('kineticHint')}
                    </Text>
                  )}
                </Pressable>
              </View>

              {/* Free 锁定遮罩 */}
              {isFree && (
                <View className="absolute inset-0 z-25 flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-[#ad46ff]/40 bg-black/90 p-4">
                  <Text className="font-bold uppercase tracking-wider text-white/50">
                    {t('kineticLocked')}
                  </Text>
                  <Text
                    size={14}
                    className="mt-1.5 max-w-[260px] text-center text-white/50 leading-relaxed"
                  >
                    {t('kineticLockedDesc')}
                  </Text>
                </View>
              )}
            </View>

            {/* ===== 5. 执行按钮 ===== */}
            <Pressable
              disabled={isLoading}
              onPress={handleExecute}
              className="mt-3.5 mb-8 flex h-[46] flex-row items-center justify-center gap-1 rounded-md border border-white/10 bg-white opacity-80"
            >
              <SimpleLineIcons name="compass" size={16} color="#000000" />
              <Text
                size={18}
                className="text-center font-bold"
                style={{ color: '#000' }}
              >
                {isLoading ? t('calculating') : t('executeDivination')}
              </Text>
            </Pressable>
          </View>
        </ParallaxScrollView>

        <SubscriptionModal
          visible={subscriptionVisible}
          onClose={() => setSubscriptionVisible(false)}
        />
        <SettingsModal
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
        />
      </>
    </MainLayout>
  )
}

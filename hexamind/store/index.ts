import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'

import { safeStorage } from '@/utils/safe-storage'
import {
  detectPreferredLanguage,
  Language,
  LanguagePreference,
  normalizeLanguageTag,
  resolveChinesePreference,
  syncI18nLanguage,
} from '@/i18n'
import type { DivinationResult, DivinationHistoryItem } from '@/types'
import { supabase } from '@/db/supabase'
import { profilesRepository } from '@/db/apis'

const LANGUAGE_STORAGE_KEY = 'hexamind_lang'
const USER_TIER_STORAGE_KEY = 'hexamind_user_tier'
const HISTORY_STORAGE_KEY = 'hexamind_history'

type UserTier = 'Free' | 'Pro'

type Store = {
  count: number
  session: Session | null
  authInitialized: boolean
  language: Language
  languagePreference: LanguagePreference
  userTier: UserTier
  /** userTier 是否已从服务端同步完成（防止缓存清后闪变 Free） */
  userTierLoading: boolean
  preferencesInitialized: boolean

  // 导航时传递当前的占卜结果
  currentResult: DivinationResult | null
  currentResultId: string | null

  // 本地历史记录（作为 Supabase 读取的补充/降级）
  historyItems: DivinationHistoryItem[]

  inc: () => void
  setSession: (session: Session | null) => void
  setAuthInitialized: (initialized: boolean) => void
  initializePreferences: () => Promise<void>
  setLanguagePreference: (preference: LanguagePreference) => Promise<void>
  setUserTier: (tier: UserTier) => Promise<void>

  setCurrentResult: (id: string, result: DivinationResult) => void
  clearCurrentResult: () => void
  addHistoryItem: (item: DivinationHistoryItem) => void
  loadHistoryFromStorage: () => Promise<void>

  /** 从 Supabase 拉取用户资料并同步到 store */
  syncProfileFromSupabase: (userId: string) => Promise<void>
}

export const useStore = create<Store>()((set, get) => ({
  count: 1,
  session: null,
  authInitialized: false,
  language: detectPreferredLanguage(),
  languagePreference: 'auto',
  userTier: 'Free',
  userTierLoading: true,
  preferencesInitialized: false,

  currentResult: null,
  currentResultId: null,
  historyItems: [],

  inc: () => set((state) => ({ count: state.count + 1 })),
  setSession: (session) => set({ session }),
  setAuthInitialized: (authInitialized) => set({ authInitialized }),
  initializePreferences: async () => {
    try {
      const [savedLanguage] = await Promise.all([
        safeStorage.getItem(LANGUAGE_STORAGE_KEY),
      ])

      if (!savedLanguage || savedLanguage === 'auto') {
        const language = detectPreferredLanguage()
        set({ languagePreference: 'auto', language })
        syncI18nLanguage(language)
      } else {
        const normalized = normalizeLanguageTag(savedLanguage)
        set({ languagePreference: normalized, language: normalized })
        syncI18nLanguage(normalized)
      }

      // userTier: 不依赖缓存，让 syncProfileFromSupabase 从 DB 拉取权威数据
      // 同步期间 userTierLoading=true，UI 勿展示锁定态
      const session = get().session
      if (session?.user?.id) {
        get().syncProfileFromSupabase(session.user.id)
      } else {
        set({ userTier: 'Free', userTierLoading: false })
      }
    } finally {
      set({ preferencesInitialized: true })
    }
  },
  setLanguagePreference: async (languagePreference) => {
    const detectedLanguage = detectPreferredLanguage()
    const language =
      languagePreference === 'auto'
        ? detectedLanguage
        : languagePreference === 'zh-CN'
          ? resolveChinesePreference(languagePreference, detectedLanguage)
          : languagePreference

    set({ languagePreference, language })
    syncI18nLanguage(language)
    await safeStorage.setItem(LANGUAGE_STORAGE_KEY, languagePreference)
  },
  setUserTier: async (userTier) => {
    set({ userTier })
    await safeStorage.setItem(USER_TIER_STORAGE_KEY, userTier)
  },

  setCurrentResult: (id, result) => {
    set({ currentResultId: id, currentResult: result })
  },
  clearCurrentResult: () => {
    set({ currentResultId: null, currentResult: null })
  },
  addHistoryItem: (item) => {
    const state = get()
    const updated = [item, ...state.historyItems]
    set({ historyItems: updated })
    safeStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated)).catch(() => {})
  },
  loadHistoryFromStorage: async () => {
    try {
      const raw = await safeStorage.getItem(HISTORY_STORAGE_KEY)
      if (raw) set({ historyItems: JSON.parse(raw) })
    } catch {
      // ignore
    }
  },

  syncProfileFromSupabase: async (userId: string) => {
    try {
      const userMeta = get().session?.user?.user_metadata ?? {}
      const userEmail = get().session?.user?.email ?? null
      const latestName = userMeta.full_name ?? userMeta.name ?? null
      const latestAvatar = userMeta.avatar_url ?? userMeta.picture ?? null
      const latestProvider =
        userMeta.provider ?? get().session?.user?.app_metadata?.provider ?? null

      // 1. 查 profiles，不存在则创建；存在则同步最新的 OAuth 元数据
      let profile = await profilesRepository.getById(userId)

      if (!profile) {
        try {
          profile = await profilesRepository.create({
            id: userId,
            name: latestName,
            email: userEmail,
            avatar_url: latestAvatar,
            provider: latestProvider,
            tier: 'Free',
          })
        } catch (createErr: any) {
          // 并发场景：另一个并发调用已创建了此 profile，重新读取
          if (createErr?.code === '23505') {
            const existing = await profilesRepository.getById(userId)
            if (existing) {
              profile = existing
            } else {
              throw createErr
            }
          } else {
            throw createErr
          }
        }
      }

      // 2. profile 已存在（trigger 自动创建或之前登录），同步最新 OAuth 元数据
      if (
        profile.name !== latestName ||
        profile.email !== userEmail ||
        profile.avatar_url !== latestAvatar ||
        profile.provider !== latestProvider
      ) {
        await profilesRepository.update(userId, {
          name: latestName,
          email: userEmail,
          avatar_url: latestAvatar,
          provider: latestProvider,
        })
      }

      // 3. profiles 是 Pro → 直接返回
      if (profile.tier === 'Pro') {
        set({ userTier: 'Pro', userTierLoading: false })
        await safeStorage.setItem(USER_TIER_STORAGE_KEY, 'Pro')
        return
      }

      // 4. profiles 是 Free，再查 subscriptions 兜底（支付后 webhook 可能只更新了 subscriptions 但 profiles.tier 未同步）
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', userId)
        .maybeSingle()

      if (sub?.tier === 'Pro' || sub?.status === 'active' || sub?.status === 'trialing') {
        set({ userTier: 'Pro', userTierLoading: false })
        await profilesRepository.setTier(userId, 'Pro')
        await safeStorage.setItem(USER_TIER_STORAGE_KEY, 'Pro')
        return
      }

      // 5. 确定是 Free
      set({ userTier: 'Free', userTierLoading: false })
      await safeStorage.setItem(USER_TIER_STORAGE_KEY, 'Free')
    } catch (err) {
      console.error('syncProfileFromSupabase failed:', err)
      set({ userTierLoading: false })
    }
  },
}))

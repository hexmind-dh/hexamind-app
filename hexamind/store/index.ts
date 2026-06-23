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
  preferencesInitialized: boolean

  // 导航时传递当前的占卜结果（不经过路由 params）
  currentResult: DivinationResult | null
  currentResultId: string | null

  // 本地历史记录（后续会被云函数替换）
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
}

export const useStore = create<Store>()((set, get) => ({
  count: 1,
  session: null,
  authInitialized: false,
  language: detectPreferredLanguage(),
  languagePreference: 'auto',
  userTier: 'Free',
  preferencesInitialized: false,

  currentResult: null,
  currentResultId: null,
  historyItems: [],

  inc: () => set((state) => ({ count: state.count + 1 })),
  setSession: (session) => set({ session }),
  setAuthInitialized: (authInitialized) => set({ authInitialized }),
  initializePreferences: async () => {
    try {
      const [savedLanguage, savedTier] = await Promise.all([
        safeStorage.getItem(LANGUAGE_STORAGE_KEY),
        safeStorage.getItem(USER_TIER_STORAGE_KEY),
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

      set({ userTier: savedTier === 'Pro' ? 'Pro' : 'Free' })
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
    // 持久化到本地存储
    safeStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated)).catch(() => {})
  },
  loadHistoryFromStorage: async () => {
    try {
      const raw = await safeStorage.getItem(HISTORY_STORAGE_KEY)
      if (raw) {
        set({ historyItems: JSON.parse(raw) })
      }
    } catch {
      // ignore
    }
  },
}))

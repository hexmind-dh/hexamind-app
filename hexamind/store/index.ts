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

const LANGUAGE_STORAGE_KEY = 'hexamind_lang'
const USER_TIER_STORAGE_KEY = 'hexamind_user_tier'

type UserTier = 'Free' | 'Pro'

type Store = {
  count: number
  session: Session | null
  authInitialized: boolean
  language: Language
  languagePreference: LanguagePreference
  userTier: UserTier
  preferencesInitialized: boolean
  inc: () => void
  setSession: (session: Session | null) => void
  setAuthInitialized: (initialized: boolean) => void
  initializePreferences: () => Promise<void>
  setLanguagePreference: (preference: LanguagePreference) => Promise<void>
  setUserTier: (tier: UserTier) => Promise<void>
}

export const useStore = create<Store>()((set) => ({
  count: 1,
  session: null,
  authInitialized: false,
  language: detectPreferredLanguage(),
  languagePreference: 'auto',
  userTier: 'Free',
  preferencesInitialized: false,
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

        set({
          languagePreference: 'auto',
          language,
        })
        syncI18nLanguage(language)
      } else {
        const normalized = normalizeLanguageTag(savedLanguage)
        set({
          languagePreference: normalized,
          language: normalized,
        })
        syncI18nLanguage(normalized)
      }

      set({
        userTier: savedTier === 'Pro' ? 'Pro' : 'Free',
      })
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
}))


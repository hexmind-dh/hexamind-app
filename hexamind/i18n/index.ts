import { createInstance } from 'i18next'
import { initReactI18next } from 'react-i18next'

import {
  AUTO_DETECT_LABELS,
  DEFAULT_LANGUAGE,
  detectPreferredLanguage,
  FALLBACK_LANGUAGE,
  LANGUAGES,
  normalizeLanguageTag,
  resolveChinesePreference,
} from './config'
import { messages } from './messages'
import type { Language, LanguagePreference, MessageValues } from './types'

const resources = Object.fromEntries(
  Object.entries(messages).map(([language, translation]) => [language, { translation }])
) as Record<Language, { translation: typeof messages.en }>

const i18n = createInstance()

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    compatibilityJSON: 'v4',
    resources,
    lng: detectPreferredLanguage(),
    fallbackLng: FALLBACK_LANGUAGE,
    defaultNS: 'translation',
    ns: ['translation'],
    interpolation: {
      escapeValue: false,
    },
    returnNull: false,
  })
}

export function syncI18nLanguage(language: Language) {
  const nextLanguage = normalizeLanguageTag(language || DEFAULT_LANGUAGE)

  if (
    i18n.resolvedLanguage !== nextLanguage &&
    i18n.language !== nextLanguage
  ) {
    void i18n.changeLanguage(nextLanguage)
  }
}

export {
  AUTO_DETECT_LABELS,
  DEFAULT_LANGUAGE,
  detectPreferredLanguage,
  FALLBACK_LANGUAGE,
  i18n,
  LANGUAGES,
  messages,
  normalizeLanguageTag,
  resolveChinesePreference,
}

export type {
  Language,
  LanguagePreference,
  MessageValues,
}

export default i18n

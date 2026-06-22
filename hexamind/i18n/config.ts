import type { Language } from './types'

export const DEFAULT_LANGUAGE: Language = 'en'
export const FALLBACK_LANGUAGE: Language = 'en'

export const LANGUAGES: { code: Exclude<Language, 'zh-TW'>; name: string }[] = [
  { code: 'en', name: 'English' },
  { code: 'zh-CN', name: '中文（简体 / 繁體）' },
  { code: 'id', name: 'Bahasa Indonesia' },
]

export const AUTO_DETECT_LABELS: Record<Language, string> = {
  en: 'Auto Detect',
  'zh-CN': '自动检测',
  'zh-TW': '自動檢測',
  id: 'Deteksi otomatis',
}

export function normalizeLanguageTag(input?: string | null): Language {
  const tag = (input || '').trim()
  const lowered = tag.toLowerCase()

  if (!tag) return DEFAULT_LANGUAGE
  if (lowered.includes('zh-tw') || lowered.includes('zh-hk') || lowered.startsWith('zh-hant')) return 'zh-TW'
  if (lowered.includes('zh-cn') || lowered.startsWith('zh-hans') || lowered.startsWith('zh')) return 'zh-CN'
  if (lowered.startsWith('id') || lowered.startsWith('in')) return 'id'
  return DEFAULT_LANGUAGE
}

export function detectPreferredLanguage(): Language {
  const locale =
    (typeof navigator !== 'undefined' && navigator.language) ||
    (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().locale : DEFAULT_LANGUAGE)

  return normalizeLanguageTag(locale)
}

export function resolveChinesePreference(preference: 'zh-CN', currentLanguage?: Language): Language {
  return currentLanguage === 'zh-TW' ? 'zh-TW' : 'zh-CN'
}

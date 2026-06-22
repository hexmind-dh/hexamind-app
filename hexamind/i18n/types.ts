export type Language = 'en' | 'zh-CN' | 'zh-TW' | 'id'

export type LanguagePreference = Language | 'auto'

export type MessagePrimitive = string | number | boolean | null | undefined
export type MessageValues = Record<string, MessagePrimitive>

/**
 * 推演 & 聊天 API 客户端
 *
 * 统一通过 Supabase Edge Functions 调用：
 * - divinate: 梅花易数推演 + AI 分析
 * - chat: Hexa AI Counsel 深度对话
 */
import { supabase } from '@/db/supabase'
import type { DivinationResult } from '@/types'

export interface DivinateInput {
  question: string
  latitude?: number
  longitude?: number
  kineticValue?: number
  timestamp?: number
  language?: string
}

export interface DivinateResponse {
  success: boolean
  recordId?: string | null
  input?: DivinationResult['input']
  payload?: DivinationResult['payload']
  confidenceScore?: number
  aiOutput?: DivinationResult['aiOutput']
  error?: string
}

export interface ChatInput {
  divinationId: string
  message: string
  chatHistory?: Array<{ role: 'user' | 'model'; content: string }>
}

export interface ChatResponse {
  success: boolean
  reply?: string
  error?: string
}

/**
 * 梅花易数推演
 * 接收决策问题 → 返回完整结果（含 AI 分析）
 */
export async function divinate(input: DivinateInput): Promise<DivinateResponse> {
  const { data, error } = await supabase.functions.invoke('divinate', {
    body: {
      question: input.question,
      latitude: input.latitude,
      longitude: input.longitude,
      kineticValue: input.kineticValue,
      timestamp: input.timestamp,
      language: input.language || 'zh-CN',
    },
  })

  if (error) {
    console.error('divinate invoke error:', error)
    return { success: false, error: error.message || '推演服务调用失败' }
  }

  return data as DivinateResponse
}

/**
 * Hexa AI Counsel 对话
 * 仅 Pro 会员可用，自动保存聊天记录到 Supabase
 */
export async function chat(input: ChatInput): Promise<ChatResponse> {
  const { data, error } = await supabase.functions.invoke('chat', {
    body: {
      divinationId: input.divinationId,
      message: input.message,
      chatHistory: input.chatHistory ?? [],
    },
  })

  if (error) {
    console.error('chat invoke error:', error)
    return { success: false, error: error.message || '聊天服务调用失败' }
  }

  return data as ChatResponse
}

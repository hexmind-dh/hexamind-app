import { supabase } from '../supabase'
import type { Database } from '../database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert']

type DbClient = SupabaseClient<Database>

function getClient(client?: DbClient) {
  return client ?? supabase
}

export const chatMessagesRepository = {
  /**
   * 获取某条占卜记录的所有聊天消息，按时间正序
   */
  async listByDivination(divinationId: string, client?: DbClient): Promise<ChatMessage[]> {
    const { data, error } = await getClient(client)
      .from('chat_messages')
      .select('*')
      .eq('divination_id', divinationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  /**
   * 添加一条聊天消息
   */
  async create(message: ChatMessageInsert, client?: DbClient): Promise<ChatMessage> {
    const { data, error } = await getClient(client)
      .from('chat_messages')
      .insert(message)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 批量添加聊天消息（用于同步离线对话/恢复 session）
   */
  async createBatch(messages: ChatMessageInsert[], client?: DbClient): Promise<ChatMessage[]> {
    const { data, error } = await getClient(client)
      .from('chat_messages')
      .insert(messages)
      .select()

    if (error) throw error
    return data
  },

  /**
   * 删除某条占卜的所有聊天记录
   */
  async clearByDivination(divinationId: string, client?: DbClient): Promise<void> {
    const { error } = await getClient(client)
      .from('chat_messages')
      .delete()
      .eq('divination_id', divinationId)

    if (error) throw error
  },

  /**
   * 获取某条占卜的聊天数量
   */
  async countByDivination(divinationId: string, client?: DbClient): Promise<number> {
    const { count, error } = await getClient(client)
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('divination_id', divinationId)

    if (error) throw error
    return count ?? 0
  },
}

export type { ChatMessage, ChatMessageInsert }

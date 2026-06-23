import { supabase } from '../supabase'
import type { Database } from '../database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type Divination = Database['public']['Tables']['divinations']['Row']
type DivinationInsert = Database['public']['Tables']['divinations']['Insert']
type DivinationUpdate = Database['public']['Tables']['divinations']['Update']

type DbClient = SupabaseClient<Database>

function getClient(client?: DbClient) {
  return client ?? supabase
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T
}

type DivinationListOptions = {
  limit?: number
  offset?: number
  fromDate?: string
  toDate?: string
}

export const divinationsRepository = {
  /**
   * 获取用户的所有占卜记录，按时间倒序
   */
  async listByUser(
    userId: string,
    options: DivinationListOptions = {},
    client?: DbClient,
  ): Promise<Divination[]> {
    let query = getClient(client)
      .from('divinations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (options.fromDate) {
      query = query.gte('created_at', options.fromDate)
    }
    if (options.toDate) {
      query = query.lte('created_at', options.toDate)
    }
    if (options.limit) {
      query = query.limit(options.limit)
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  /**
   * 获取单条占卜记录
   */
  async getById(id: string, client?: DbClient): Promise<Divination | null> {
    const { data, error } = await getClient(client)
      .from('divinations')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * 创建占卜记录
   */
  async create(divination: DivinationInsert, client?: DbClient): Promise<Divination> {
    const payload = removeUndefined(divination)

    const { data, error } = await getClient(client)
      .from('divinations')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 更新占卜记录（例如补充 AI 分析结果）
   */
  async update(id: string, updates: DivinationUpdate, client?: DbClient): Promise<Divination> {
    const payload = removeUndefined(updates)

    const { data, error } = await getClient(client)
      .from('divinations')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 删除单条占卜记录
   */
  async remove(id: string, client?: DbClient): Promise<void> {
    const { error } = await getClient(client)
      .from('divinations')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * 清空用户所有占卜记录
   */
  async clearAllByUser(userId: string, client?: DbClient): Promise<void> {
    const { error } = await getClient(client)
      .from('divinations')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  },

  /**
   * 统计用户占卜总数
   */
  async countByUser(userId: string, client?: DbClient): Promise<number> {
    const { count, error } = await getClient(client)
      .from('divinations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error
    return count ?? 0
  },
}

export type { Divination, DivinationInsert, DivinationUpdate }

import { supabase } from '../supabase'
import type { Database } from '../database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

type DbClient = SupabaseClient<Database>

function getClient(client?: DbClient) {
  return client ?? supabase
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T
}

export const profilesRepository = {
  /**
   * 创建用户资料
   */
  async create(profile: ProfileInsert, client?: DbClient): Promise<Profile> {
    const payload = removeUndefined({
      ...profile,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    const { data, error } = await getClient(client)
      .from('profiles')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 获取单个用户资料
   */
  async getById(id: string, client?: DbClient): Promise<Profile | null> {
    const { data, error } = await getClient(client)
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * 更新用户资料
   */
  async update(id: string, updates: ProfileUpdate, client?: DbClient): Promise<Profile> {
    const payload = removeUndefined(updates)

    const { data, error } = await getClient(client)
      .from('profiles')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * 更新用户 tier（Free / Pro）
   */
  async setTier(id: string, tier: 'Free' | 'Pro', client?: DbClient): Promise<Profile> {
    return profilesRepository.update(id, { tier }, client)
  },

  /**
   * 增加每日查询计数
   */
  async incrementDailyQueryCount(id: string, client?: DbClient): Promise<Profile> {
    const today = new Date().toISOString().slice(0, 10)

    // 先读取当前记录，判断是否需要重置计数
    const profile = await profilesRepository.getById(id, client)
    if (!profile) throw new Error('Profile not found')

    const isSameDay = profile.daily_query_date === today
    const newCount = isSameDay ? profile.daily_query_count + 1 : 1

    return profilesRepository.update(
      id,
      {
        daily_query_count: newCount,
        daily_query_date: today,
        last_query_at: new Date().toISOString(),
      },
      client,
    )
  },

  /**
   * 获取用户每日配额剩余
   */
  async getRemainingQuota(id: string, client?: DbClient): Promise<{
    used: number
    limit: number
    remaining: number
  }> {
    const profile = await profilesRepository.getById(id, client)
    if (!profile) throw new Error('Profile not found')

    const today = new Date().toISOString().slice(0, 10)
    const isSameDay = profile.daily_query_date === today
    const used = isSameDay ? profile.daily_query_count : 0
    const limit = profile.tier === 'Pro' ? 1000 : 3

    return { used, limit, remaining: limit - used }
  },

  /**
   * 删除用户资料（级联删除关联数据）
   */
  async remove(id: string, client?: DbClient): Promise<void> {
    const { error } = await getClient(client)
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

export type { Profile, ProfileInsert, ProfileUpdate }

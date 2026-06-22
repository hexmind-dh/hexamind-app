import { supabase } from '../supabase'
import type { Database } from '../database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type LlmProvider = Database['public']['Tables']['llm_providers']['Row']
type LlmProviderInsert = Database['public']['Tables']['llm_providers']['Insert']
type LlmProviderUpdate = Database['public']['Tables']['llm_providers']['Update']

type DbClient = SupabaseClient<Database>

type ListOptions = {
  activeOnly?: boolean
}

function getClient(client?: DbClient) {
  return client ?? supabase
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined)
  ) as T
}

export const llmProvidersRepository = {
  async list(options: ListOptions = {}, client?: DbClient): Promise<LlmProvider[]> {
    let query = getClient(client)
      .from('llm_providers')
      .select('*')
      .order('created_at', { ascending: false })

    if (options.activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getById(id: string, client?: DbClient): Promise<LlmProvider | null> {
    const { data, error } = await getClient(client)
      .from('llm_providers')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getActive(client?: DbClient): Promise<LlmProvider | null> {
    const { data, error } = await getClient(client)
      .from('llm_providers')
      .select('*')
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async create(provider: LlmProviderInsert, client?: DbClient): Promise<LlmProvider> {
    const payload = removeUndefined(provider)

    const { data, error } = await getClient(client)
      .from('llm_providers')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id: string, updates: LlmProviderUpdate, client?: DbClient): Promise<LlmProvider> {
    const payload = removeUndefined(updates)

    const { data, error } = await getClient(client)
      .from('llm_providers')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async setActive(id: string, isActive: boolean, client?: DbClient): Promise<LlmProvider> {
    const { data, error } = await getClient(client)
      .from('llm_providers')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async remove(id: string, client?: DbClient): Promise<void> {
    const { error } = await getClient(client)
      .from('llm_providers')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// backward compatibility for any accidental old imports
export const postsRepository = llmProvidersRepository

export type {
  LlmProvider,
  LlmProviderInsert,
  LlmProviderUpdate,
  ListOptions,
}

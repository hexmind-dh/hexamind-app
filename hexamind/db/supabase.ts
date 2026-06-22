import { safeStorage } from '@/utils/safe-storage'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export type { Database }

export type Tables<
    T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Row']

export type Inserts<
    T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Insert']

export type Updates<
    T extends keyof Database['public']['Tables']
> = Database['public']['Tables'][T]['Update']

const safeAuthStorage = {
    async getItem(key: string) {
        return safeStorage.getItem(key)
    },
    async setItem(key: string, value: string) {
        await safeStorage.setItem(key, value)
    },
    async removeItem(key: string) {
        await safeStorage.removeItem(key)
    },
}

export const supabase = createClient<Database>(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_KEY!,
    {
        auth: {
            storage: safeAuthStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,// RN 不需要
            flowType: 'pkce',
        },
    })

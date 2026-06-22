import AsyncStorage from '@react-native-async-storage/async-storage'
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

const memoryStorage = new Map<string, string>()
let nativeStorageAvailable = true

const safeAuthStorage = {
    async getItem(key: string) {
        if (!nativeStorageAvailable) {
            return memoryStorage.get(key) ?? null
        }

        try {
            return await AsyncStorage.getItem(key)
        } catch {
            nativeStorageAvailable = false
            return memoryStorage.get(key) ?? null
        }
    },
    async setItem(key: string, value: string) {
        memoryStorage.set(key, value)

        if (!nativeStorageAvailable) {
            return
        }

        try {
            await AsyncStorage.setItem(key, value)
        } catch {
            nativeStorageAvailable = false
        }
    },
    async removeItem(key: string) {
        memoryStorage.delete(key)

        if (!nativeStorageAvailable) {
            return
        }

        try {
            await AsyncStorage.removeItem(key)
        } catch {
            nativeStorageAvailable = false
        }
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

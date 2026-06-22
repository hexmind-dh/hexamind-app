import type { Session } from '@supabase/supabase-js'
import { create } from 'zustand'

type Store = {
  count: number
  session: Session | null
  authInitialized: boolean
  inc: () => void
  setSession: (session: Session | null) => void
  setAuthInitialized: (initialized: boolean) => void
}

export const useStore = create<Store>()((set) => ({
  count: 1,
  session: null,
  authInitialized: false,
  inc: () => set((state) => ({ count: state.count + 1 })),
  setSession: (session) => set({ session }),
  setAuthInitialized: (authInitialized) => set({ authInitialized }),
}))




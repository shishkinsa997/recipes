import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../services/supabase'
import type { Profile } from '../types'

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
}


export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    set({ user: data.user, isLoading: false })

    // Загружаем профиль
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      set({ profile })
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })

    if (error) throw error

    set({ user: data.user, isLoading: false })
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, profile: null, isLoading: false })
  },

  checkAuth: async () => {
    try {
      console.log('Checking auth...')
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Session error:', error)
        set({ user: null, profile: null, isLoading: false })
        return
      }

      console.log('Session:', session)

      if (session?.user) {
        set({ user: session.user, isLoading: false })

        // Загружаем профиль
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          console.error('Profile error:', profileError)
        } else {
          set({ profile })
        }
      } else {
        set({ user: null, profile: null, isLoading: false })
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      set({ user: null, profile: null, isLoading: false })
    }
  },
}))
import { create } from 'zustand'
import { supabase } from '../lib/supabase'

// Cache profile in memory — avoid re-fetching on every auth state event
let profileCache = null

const fetchProfile = async (userId, email) => {
  if (profileCache?.id === userId) return profileCache

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (data) {
    profileCache = data
    return data
  }

  // Only upsert if truly missing
  const name =
    email?.split('@')[0] || 'Traveler'

  const { data: created } = await supabase
    .from('profiles')
    .upsert({ id: userId, email, name })
    .select('*')
    .single()

  profileCache = created || { id: userId, email, name }
  return profileCache
}

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,

  initializeAuth: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        // Fetch profile in parallel — don't block auth
        const profilePromise = fetchProfile(session.user.id, session.user.email)
        set({ user: session.user, isLoading: false })
        const profile = await profilePromise
        set({ profile })
      } else {
        set({ user: null, profile: null, isLoading: false })
      }

      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          profileCache = null
          set({ user: null, profile: null, isLoading: false })
          return
        }
        if (session?.user) {
          // Only refetch profile on actual sign-in, not on every TOKEN_REFRESH
          if (event === 'SIGNED_IN' || !get().profile) {
            const profile = await fetchProfile(session.user.id, session.user.email)
            set({ user: session.user, profile, isLoading: false })
          } else {
            set({ user: session.user, isLoading: false })
          }
        }
      })
    } catch (err) {
      console.error('Auth init error:', err)
      set({ isLoading: false })
    }
  },

  signOut: async () => {
    profileCache = null
    await supabase.auth.signOut()
    set({ user: null, profile: null })
  },
}))

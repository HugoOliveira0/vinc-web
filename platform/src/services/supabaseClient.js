import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

let supabaseClient = null

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabasePublishableKey)
}

export const getSupabaseClient = () => {
  if (!isSupabaseConfigured()) {
    throw new Error('A conta ainda não foi configurada nesta versão.')
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'vinc-web-platform-auth'
      }
    })
  }

  return supabaseClient
}

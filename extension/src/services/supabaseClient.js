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
    throw new Error('A sincronização ainda não foi configurada.')
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        storageKey: 'vinc-web-auth'
      }
    })
  }

  return supabaseClient
}

import { getSupabaseClient } from './supabaseClient'

export const defaultAccountPreferences = {
  theme: 'system',
  textScale: 'normal',
  reduceMotion: false
}

export const toRemotePreferences = (userId, preferences) => ({
  user_id: userId,
  theme: preferences.theme,
  text_scale: preferences.textScale,
  reduce_motion: preferences.reduceMotion,
  updated_at: new Date().toISOString()
})

export const fromRemotePreferences = (preferences) => ({
  theme: preferences.theme,
  textScale: preferences.text_scale,
  reduceMotion: preferences.reduce_motion
})

export const getAccountSession = async () => {
  const { data, error } = await getSupabaseClient().auth.getSession()

  if (error) {
    throw error
  }

  return data.session
}

export const subscribeToAccount = (onSessionChange) => {
  const { data } = getSupabaseClient().auth.onAuthStateChange(
    (_event, session) => onSessionChange(session)
  )

  return () => data.subscription.unsubscribe()
}

export const signInAccount = async ({ email, password }) => {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data.session
}

export const signUpAccount = async ({ email, password }) => {
  const { data, error } = await getSupabaseClient().auth.signUp({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data
}

export const signOutAccount = async () => {
  const { error } = await getSupabaseClient().auth.signOut()

  if (error) {
    throw error
  }
}

export const loadAccountPreferences = async (userId) => {
  const { data, error } = await getSupabaseClient()
    .from('user_preferences')
    .select('theme, text_scale, reduce_motion')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    return null
  }

  return fromRemotePreferences(data)
}

export const saveAccountPreferences = async (userId, preferences) => {
  const { error } = await getSupabaseClient()
    .from('user_preferences')
    .upsert(toRemotePreferences(userId, preferences), {
      onConflict: 'user_id'
    })

  if (error) {
    throw error
  }
}

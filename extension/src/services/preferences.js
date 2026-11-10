const storageKey = 'accessibilityPreferences'

export const defaultPreferences = {
  theme: 'system',
  textScale: 'normal',
  reduceMotion: false
}

export const loadPreferences = async () => {
  const storedValues = await chrome.storage.sync.get(storageKey)
  const storedPreferences = storedValues[storageKey] || {}

  const allowedThemes = ['system', 'light', 'dark', 'contrast']
  const allowedTextScales = ['normal', 'large', 'extra-large']

  return {
    theme: allowedThemes.includes(storedPreferences.theme)
      ? storedPreferences.theme
      : defaultPreferences.theme,

    textScale: allowedTextScales.includes(storedPreferences.textScale)
      ? storedPreferences.textScale
      : defaultPreferences.textScale,

    reduceMotion: storedPreferences.reduceMotion === true
  }
}

export const savePreferences = async (preferences) => {
  await chrome.storage.sync.set({
    [storageKey]: preferences
  })
}

export const applyPreferences = (preferences) => {
  const root = document.documentElement

  root.dataset.vincTheme = preferences.theme
  root.dataset.vincTextScale = preferences.textScale
  root.dataset.vincReduceMotion = String(preferences.reduceMotion)
}

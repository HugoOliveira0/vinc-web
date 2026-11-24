// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  applyPreferences,
  defaultPreferences,
  loadPreferences,
  savePreferences
} from './preferences'

describe('preferências de acessibilidade', () => {
  beforeEach(() => {
    globalThis.chrome = {
      storage: {
        sync: {
          get: vi.fn(),
          set: vi.fn().mockResolvedValue(undefined)
        }
      }
    }
  })

  it('carrega somente valores reconhecidos', async () => {
    chrome.storage.sync.get.mockResolvedValue({
      accessibilityPreferences: {
        theme: 'contrast',
        textScale: 'extra-large',
        reduceMotion: true
      }
    })

    await expect(loadPreferences()).resolves.toEqual({
      theme: 'contrast',
      textScale: 'extra-large',
      reduceMotion: true
    })
  })

  it('substitui valores inválidos pelos padrões seguros', async () => {
    chrome.storage.sync.get.mockResolvedValue({
      accessibilityPreferences: {
        theme: 'inexistente',
        textScale: 'gigante',
        reduceMotion: 'sim'
      }
    })

    await expect(loadPreferences()).resolves.toEqual(defaultPreferences)
  })

  it('salva e aplica as preferências na raiz do documento', async () => {
    const preferences = {
      theme: 'dark',
      textScale: 'large',
      reduceMotion: true
    }

    await savePreferences(preferences)
    applyPreferences(preferences)

    expect(chrome.storage.sync.set).toHaveBeenCalledWith({
      accessibilityPreferences: preferences
    })
    expect(document.documentElement.dataset).toEqual(expect.objectContaining({
      vincTheme: 'dark',
      vincTextScale: 'large',
      vincReduceMotion: 'true'
    }))
  })
})

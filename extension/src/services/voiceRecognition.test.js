// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getRecognitionErrorMessage,
  requestMicrophonePermission
} from './voiceRecognition'

describe('requestMicrophonePermission', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: { getUserMedia: vi.fn() }
    })

    globalThis.chrome = {
      runtime: {
        getURL: vi.fn(() => 'chrome-extension://vinc/microphone-permission.html')
      },
      tabs: {
        create: vi.fn().mockResolvedValue({})
      }
    }
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('continua sem abrir outra aba quando a permissão já foi concedida', async () => {
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: {
        query: vi.fn().mockResolvedValue({ state: 'granted' })
      }
    })

    await expect(requestMicrophonePermission()).resolves.toBe(true)
    expect(chrome.tabs.create).not.toHaveBeenCalled()
  })

  it('abre a página de permissão quando o navegador ainda precisa perguntar', async () => {
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: {
        query: vi.fn().mockResolvedValue({ state: 'prompt' })
      }
    })

    await expect(requestMicrophonePermission()).resolves.toBe(false)
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'chrome-extension://vinc/microphone-permission.html'
    })
  })

  it('abre a página de permissão mesmo se a consulta não for suportada', async () => {
    Object.defineProperty(navigator, 'permissions', {
      configurable: true,
      value: {
        query: vi.fn().mockRejectedValue(new TypeError('unsupported'))
      }
    })

    await expect(requestMicrophonePermission()).resolves.toBe(false)
    expect(chrome.tabs.create).toHaveBeenCalledOnce()
  })

  it('informa quando o acesso ao microfone não existe', async () => {
    Object.defineProperty(navigator, 'mediaDevices', {
      configurable: true,
      value: undefined
    })

    await expect(requestMicrophonePermission()).rejects.toThrow(
      'O acesso ao microfone não está disponível neste navegador.'
    )
  })
})

describe('getRecognitionErrorMessage', () => {
  it('traduz erros conhecidos e fornece uma mensagem genérica', () => {
    expect(getRecognitionErrorMessage('not-allowed')).toContain('negada')
    expect(getRecognitionErrorMessage('erro-desconhecido')).toBe(
      'Não foi possível reconhecer o comando de voz.'
    )
  })
})

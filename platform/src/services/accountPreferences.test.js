import { describe, expect, it, vi } from 'vitest'
import {
  fromRemotePreferences,
  toRemotePreferences
} from './accountPreferences'

vi.mock('./supabaseClient', () => ({
  getSupabaseClient: vi.fn()
}))

describe('preferências da conta na plataforma', () => {
  it('converte as preferências para o formato compartilhado com a extensão', () => {
    const result = toRemotePreferences('usuario-1', {
      theme: 'contrast',
      textScale: 'extra-large',
      reduceMotion: true
    })

    expect(result).toMatchObject({
      user_id: 'usuario-1',
      theme: 'contrast',
      text_scale: 'extra-large',
      reduce_motion: true
    })
    expect(Number.isNaN(Date.parse(result.updated_at))).toBe(false)
  })

  it('converte o registro remoto para o estado da plataforma', () => {
    expect(fromRemotePreferences({
      theme: 'dark',
      text_scale: 'large',
      reduce_motion: false
    })).toEqual({
      theme: 'dark',
      textScale: 'large',
      reduceMotion: false
    })
  })
})

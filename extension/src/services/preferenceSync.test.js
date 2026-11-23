import { describe, expect, it, vi } from 'vitest'
import {
  fromRemotePreferences,
  toRemotePreferences
} from './preferenceSync'

vi.mock('./supabaseClient', () => ({
  getSupabaseClient: vi.fn()
}))

describe('sincronização de preferências', () => {
  it('converte as preferências locais para o formato do banco', () => {
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

  it('converte o registro remoto para o formato da extensão', () => {
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

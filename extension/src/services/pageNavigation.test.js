// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  activateButton,
  clearField,
  fillField,
  locateHeading,
  scrollPage
} from './pageNavigation'

describe('navegação e ações na página', () => {
  beforeEach(() => {
    document.body.innerHTML = ''

    Element.prototype.scrollIntoView = vi.fn()
    window.scrollBy = vi.fn()

    globalThis.chrome = {
      scripting: {
        executeScript: vi.fn(async ({ func, args = [] }) => {
          return [{ result: func(...args) }]
        })
      }
    }
  })

  it('preenche campos de texto e dispara eventos compatíveis com React', async () => {
    document.body.innerHTML = `
      <input data-vinc-field-id="field-1" type="text" value="">
    `
    const field = document.querySelector('input')
    const inputListener = vi.fn()
    const changeListener = vi.fn()
    field.addEventListener('input', inputListener)
    field.addEventListener('change', changeListener)

    await expect(fillField(4, 'field-1', 'Hugo')).resolves.toEqual({
      updated: true
    })
    expect(field.value).toBe('Hugo')
    expect(inputListener).toHaveBeenCalledOnce()
    expect(changeListener).toHaveBeenCalledOnce()
  })

  it('limpa um campo de texto pelo mesmo fluxo seguro', async () => {
    document.body.innerHTML = `
      <textarea data-vinc-field-id="field-2">Conteúdo</textarea>
    `

    await expect(clearField(4, 'field-2')).resolves.toEqual({
      updated: true
    })
    expect(document.querySelector('textarea').value).toBe('')
  })

  it('recusa campos sensíveis, somente leitura e desabilitados', async () => {
    document.body.innerHTML = `
      <input data-vinc-field-id="password" type="password">
      <input data-vinc-field-id="readonly" type="text" readonly>
      <input data-vinc-field-id="disabled" type="text" disabled>
    `

    await expect(fillField(4, 'password', 'segredo')).resolves.toEqual({
      updated: false,
      reason: 'sensitive'
    })
    await expect(fillField(4, 'readonly', 'texto')).resolves.toEqual({
      updated: false,
      reason: 'readonly'
    })
    await expect(fillField(4, 'disabled', 'texto')).resolves.toEqual({
      updated: false,
      reason: 'disabled'
    })
  })

  it('não ativa controles desabilitados', async () => {
    document.body.innerHTML = `
      <button data-vinc-button-id="button-1" disabled>Enviar</button>
    `

    await expect(activateButton(4, 'button-1')).resolves.toEqual({
      activated: false,
      reason: 'disabled'
    })
  })

  it('informa quando o elemento solicitado não existe mais', async () => {
    await expect(locateHeading(4, 'heading-404')).resolves.toBe(false)
  })

  it('rola uma distância perceptível nas duas direções', async () => {
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000
    })

    await expect(scrollPage(4, 'down')).resolves.toBe(true)
    expect(window.scrollBy).toHaveBeenLastCalledWith({
      top: 800,
      behavior: 'smooth'
    })

    await expect(scrollPage(4, 'up')).resolves.toBe(true)
    expect(window.scrollBy).toHaveBeenLastCalledWith({
      top: -800,
      behavior: 'smooth'
    })
  })
})

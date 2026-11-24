/** @vitest-environment jsdom */

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('interface pública da plataforma', () => {
  let container
  let root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)

    act(() => {
      root.render(<App />)
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })

    document.body.innerHTML = ''
  })

  it('oferece atalho, marcos e títulos para navegação assistiva', () => {
    const skipLink = container.querySelector('.skip-link')
    const main = container.querySelector('main')
    const navigation = container.querySelector('nav[aria-label="Navegação principal"]')

    expect(skipLink?.getAttribute('href')).toBe('#conteudo')
    expect(main?.id).toBe('conteudo')
    expect(main?.getAttribute('tabindex')).toBe('-1')
    expect(navigation).not.toBeNull()
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(container.querySelectorAll('[id]').length).toBe(
      new Set([...container.querySelectorAll('[id]')].map((element) => element.id)).size
    )
  })

  it('fecha o menu com Escape e devolve o foco ao botão', () => {
    const menuButton = container.querySelector('.nav-toggle')

    act(() => {
      menuButton.click()
    })

    expect(menuButton.getAttribute('aria-expanded')).toBe('true')

    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    })

    expect(menuButton.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(menuButton)
  })

  it('avisa leitores de tela quando um link abre outra aba', () => {
    const externalLink = [...container.querySelectorAll('a')].find(
      (link) => link.textContent.includes('Ver código no GitHub')
    )

    expect(externalLink?.target).toBe('_blank')
    expect(externalLink?.rel).toContain('noreferrer')
    expect(externalLink?.querySelector('.visually-hidden')?.textContent).toContain(
      'abre em uma nova aba'
    )
  })
})

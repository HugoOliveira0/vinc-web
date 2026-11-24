// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { collectPageData } from './pageAnalysis'

const visibleRect = {
  width: 120,
  height: 40,
  top: 0,
  right: 120,
  bottom: 40,
  left: 0,
  x: 0,
  y: 0,
  toJSON: () => ({})
}

describe('collectPageData', () => {
  beforeEach(() => {
    vi.spyOn(Element.prototype, 'getBoundingClientRect')
      .mockReturnValue(visibleRect)

    document.documentElement.lang = 'pt-BR'
    document.title = 'Página de teste'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('ignora títulos ocultos e mantém somente conteúdo visível', () => {
    document.body.innerHTML = `
      <h1>Título principal</h1>
      <h2 hidden>Título oculto</h2>
      <div aria-hidden="true"><h2>Também oculto</h2></div>
    `

    const result = collectPageData()

    expect(result.headings).toBe(1)
    expect(result.headingItems).toEqual([
      expect.objectContaining({ level: 'h1', text: 'Título principal' })
    ])
  })

  it('resolve nomes de links por aria-labelledby e imagem interna', () => {
    document.body.innerHTML = `
      <span id="destination-name">Abrir configurações</span>
      <a href="/config" aria-labelledby="destination-name"></a>
      <a href="/perfil"><img src="avatar.png" alt="Perfil de Ana"></a>
    `

    const result = collectPageData()

    expect(result.linkItems).toEqual([
      expect.objectContaining({
        text: 'Abrir configurações',
        hasAccessibleName: true
      }),
      expect.objectContaining({
        text: 'Perfil de Ana',
        hasAccessibleName: true
      })
    ])
  })

  it('coleta destino e contexto para explicar links pouco descritivos', () => {
    document.body.innerHTML = `
      <h2>Escala geológica</h2>
      <p>Períodos: <a href="/wiki/Siluriano" title="Siluriano">S</a></p>
    `

    const result = collectPageData()

    expect(result.linkItems[0]).toEqual(expect.objectContaining({
      text: 'S',
      destinationLabel: 'Siluriano',
      domain: 'localhost',
      section: 'Escala geológica'
    }))
  })

  it('resolve nomes de botões por SVG e preserva botões sem nome', () => {
    document.body.innerHTML = `
      <button><svg><title>Abrir menu</title></svg></button>
      <button></button>
    `

    const result = collectPageData()

    expect(result.buttonItems[0]).toEqual(expect.objectContaining({
      text: 'Abrir menu',
      hasAccessibleName: true
    }))
    expect(result.buttonItems[1]).toEqual(expect.objectContaining({
      text: 'Botão sem descrição',
      hasAccessibleName: false
    }))
  })

  it('respeita a prioridade do nome acessível de campos', () => {
    document.body.innerHTML = `
      <span id="search-label">Pesquisar no catálogo</span>
      <label for="search">Busca antiga</label>
      <input
        id="search"
        aria-labelledby="search-label"
        aria-label="Busca"
        placeholder="Digite aqui"
      >
    `

    const result = collectPageData()

    expect(result.fieldItems[0]).toEqual(expect.objectContaining({
      label: 'Pesquisar no catálogo',
      hasAccessibleLabel: true
    }))
  })

  it('usa as dimensões renderizadas quando a imagem ainda não carregou', () => {
    document.body.innerHTML = '<img src="lazy.png" alt="Imagem sob demanda">'

    const result = collectPageData()

    expect(result.imageItems[0]).toEqual(expect.objectContaining({
      width: 120,
      height: 40
    }))
  })
})

import { describe, expect, it } from 'vitest'
import { createElementCatalog } from './aiSummary'

const createAnalysis = () => ({
  headingItems: [{ level: 'h1', text: 'Título principal' }],
  linkItems: [{ text: 'Documentação' }],
  buttonItems: [{ text: 'Continuar' }],
  fieldItems: [{ label: 'E-mail', type: 'email' }],
  imageItems: [{ description: 'Logotipo do projeto' }]
})

describe('createElementCatalog', () => {
  it('cria índices legíveis para todas as categorias', () => {
    const catalog = createElementCatalog(createAnalysis())

    expect(catalog).toEqual({
      heading: [{ index: 1, label: 'H1: Título principal' }],
      link: [{ index: 1, label: 'Documentação' }],
      button: [{ index: 1, label: 'Continuar' }],
      field: [{ index: 1, label: 'E-mail (email)' }],
      image: [{ index: 1, label: 'Logotipo do projeto' }]
    })
  })

  it('limita o catálogo enviado à IA a trinta itens por categoria', () => {
    const analysis = createAnalysis()
    analysis.linkItems = Array.from({ length: 35 }, (_, index) => ({
      text: `Link ${index + 1}`
    }))

    const catalog = createElementCatalog(analysis)

    expect(catalog.link).toHaveLength(30)
    expect(catalog.link.at(-1)).toEqual({
      index: 30,
      label: 'Link 30'
    })
  })

  it('limita rótulos muito extensos antes do envio', () => {
    const analysis = createAnalysis()
    analysis.buttonItems = [{ text: 'A'.repeat(250) }]

    const catalog = createElementCatalog(analysis)

    expect(catalog.button[0].label).toHaveLength(180)
  })
})

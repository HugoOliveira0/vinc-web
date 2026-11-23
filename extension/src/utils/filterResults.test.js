import { describe, expect, it } from 'vitest'
import { filterAnalysisResults } from './filterResults'

const analysis = {
  headingItems: [
    { id: 'h-1', level: 'h1', text: 'Introdução à acessibilidade' },
    { id: 'h-2', level: 'h2', text: 'Conclusão' }
  ],
  linkItems: [
    { id: 'l-1', text: 'Documentação', url: 'https://exemplo.dev/docs' }
  ],
  buttonItems: [
    { id: 'b-1', text: 'Enviar formulário' }
  ],
  fieldItems: [
    {
      id: 'f-1',
      label: 'Endereço de e-mail',
      type: 'email',
      required: true,
      disabled: false
    }
  ],
  imageItems: [
    {
      id: 'i-1',
      description: 'Imagem decorativa',
      hasAlt: true,
      decorative: true
    }
  ]
}

describe('filterAnalysisResults', () => {
  it('retorna todos os itens quando a pesquisa está vazia', () => {
    const result = filterAnalysisResults(analysis, '')

    expect(result.heading).toHaveLength(2)
    expect(result.link).toHaveLength(1)
    expect(result.button).toHaveLength(1)
    expect(result.field).toHaveLength(1)
    expect(result.image).toHaveLength(1)
  })

  it('ignora diferenças de maiúsculas e acentuação', () => {
    const result = filterAnalysisResults(analysis, 'ACESSIBILIDADE')

    expect(result.heading.map((item) => item.id)).toEqual(['h-1'])
  })

  it('pesquisa metadados específicos de cada categoria', () => {
    expect(
      filterAnalysisResults(analysis, 'obrigatório').field
    ).toHaveLength(1)
    expect(
      filterAnalysisResults(analysis, 'decorativa').image
    ).toHaveLength(1)
    expect(
      filterAnalysisResults(analysis, 'exemplo.dev').link
    ).toHaveLength(1)
  })

  it('retorna a estrutura vazia quando ainda não há análise', () => {
    expect(filterAnalysisResults(null, 'teste')).toEqual({
      heading: [],
      link: [],
      button: [],
      field: [],
      image: []
    })
  })
})

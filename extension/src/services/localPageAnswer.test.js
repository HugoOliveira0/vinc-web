import { describe, expect, it } from 'vitest'
import { answerPageQuestionLocally } from './localPageAnswer'

const analysis = {
  linkItems: [{
    text: 'S',
    url: 'https://pt.wikipedia.org/wiki/Siluriano',
    domain: 'pt.wikipedia.org',
    destinationLabel: 'Siluriano',
    context: 'Escala de tempo geológico: S D C P T',
    section: 'Taxonomia',
    hasAccessibleName: true
  }]
}

describe('respostas locais sobre links', () => {
  it('responde perguntas objetivas sem depender da IA', () => {
    const result = answerPageQuestionLocally(analysis, 'O que é o link 1?')

    expect(result.answer).toContain('rótulo “S”')
    expect(result.answer).toContain('“Siluriano”')
    expect(result.answer).toContain('pt.wikipedia.org/wiki/Siluriano')
    expect(result.answer).toContain('seção “Taxonomia”')
    expect(result.referencedElements[0]).toEqual(expect.objectContaining({
      type: 'link',
      index: 1,
      label: 'S'
    }))
  })

  it('aceita contrações e perguntas sobre o destino', () => {
    const result = answerPageQuestionLocally(
      analysis,
      'Pra onde leva o link número 1?'
    )

    expect(result.answer).toContain('Siluriano')
  })

  it('não intercepta perguntas interpretativas destinadas à IA', () => {
    expect(
      answerPageQuestionLocally(analysis, 'Por que o link 1 é importante?')
    ).toBeNull()
  })

  it('informa quando o índice não está disponível', () => {
    const result = answerPageQuestionLocally(analysis, 'O que é o link 10?')

    expect(result.answer).toContain('não está disponível')
    expect(result.referencedElements).toEqual([])
  })
})

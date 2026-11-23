import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  cacheAIAnswer,
  cacheAISummary,
  getCachedAIAnswer,
  getCachedAISummary
} from './aiSummaryCache'

const page = {
  url: 'https://exemplo.dev/artigo',
  title: 'Artigo de exemplo',
  description: 'Descrição da página',
  text: 'Conteúdo visível da página'
}

const elements = {
  heading: [{ index: 1, label: 'H1: Artigo de exemplo' }],
  link: [],
  button: [],
  field: [],
  image: []
}

describe('cache temporário da IA', () => {
  let storage

  beforeEach(() => {
    storage = {}

    globalThis.chrome = {
      storage: {
        session: {
          get: vi.fn(async (key) => ({ [key]: storage[key] })),
          set: vi.fn(async (values) => {
            Object.assign(storage, values)
          })
        }
      }
    }
  })

  it('retorna vazio antes de armazenar e recupera o mesmo resumo', async () => {
    const firstLookup = await getCachedAISummary(page, elements)

    expect(firstLookup.result).toBeNull()

    const result = {
      summary: 'Resumo da página',
      keyElements: []
    }

    await cacheAISummary(firstLookup.fingerprint, result)

    const secondLookup = await getCachedAISummary(page, elements)
    expect(secondLookup.result).toEqual(result)
  })

  it('normaliza espaços e maiúsculas no cache de perguntas', async () => {
    const firstLookup = await getCachedAIAnswer(
      page,
      elements,
      '  Qual é o assunto?  '
    )

    const result = {
      answer: 'O assunto é acessibilidade.',
      referencedElements: []
    }

    await cacheAIAnswer(firstLookup.fingerprint, result)

    const secondLookup = await getCachedAIAnswer(
      page,
      elements,
      'qual   é o assunto?'
    )

    expect(secondLookup.result).toEqual(result)
  })

  it('não reutiliza uma resposta quando o conteúdo muda', async () => {
    const firstLookup = await getCachedAISummary(page, elements)
    await cacheAISummary(firstLookup.fingerprint, {
      summary: 'Resumo antigo',
      keyElements: []
    })

    const changedPage = {
      ...page,
      text: 'Um conteúdo diferente foi carregado.'
    }

    const changedLookup = await getCachedAISummary(changedPage, elements)

    expect(changedLookup.fingerprint).not.toBe(firstLookup.fingerprint)
    expect(changedLookup.result).toBeNull()
  })
})

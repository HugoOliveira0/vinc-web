import { describe, expect, it } from 'vitest'
import { createAccessibilityAudit } from './accessibilityAudit'

const createValidAnalysis = () => ({
  title: 'Página de exemplo',
  language: 'pt-BR',
  headingItems: [
    { id: 'h-1', level: 'h1', text: 'Página de exemplo' },
    { id: 'h-2', level: 'h2', text: 'Conteúdo' }
  ],
  linkItems: [
    { id: 'l-1', text: 'Saiba mais', hasAccessibleName: true }
  ],
  buttonItems: [
    { id: 'b-1', text: 'Continuar', hasAccessibleName: true }
  ],
  fieldItems: [
    { id: 'f-1', label: 'Nome', hasAccessibleLabel: true }
  ],
  imageItems: [
    { id: 'i-1', description: 'Logotipo', hasAlt: true }
  ]
})

describe('createAccessibilityAudit', () => {
  it('aprova todas as verificações de uma estrutura válida', () => {
    const audit = createAccessibilityAudit(createValidAnalysis())

    expect(audit).toMatchObject({
      errorCount: 0,
      warningCount: 0,
      passedChecks: 8,
      totalChecks: 8
    })
    expect(audit.issues).toEqual([])
  })

  it('identifica metadados e nomes acessíveis ausentes', () => {
    const analysis = createValidAnalysis()
    analysis.title = ''
    analysis.language = ''
    analysis.linkItems[0].hasAccessibleName = false
    analysis.buttonItems[0].hasAccessibleName = false
    analysis.fieldItems[0].hasAccessibleLabel = false
    analysis.imageItems[0].hasAlt = false

    const audit = createAccessibilityAudit(analysis)

    expect(audit.errorCount).toBe(6)
    expect(audit.issues.map((issue) => issue.id)).toEqual(
      expect.arrayContaining([
        'document-title',
        'document-language',
        'link-1',
        'button-1',
        'field-1',
        'image-1'
      ])
    )
  })

  it('avisa sobre H1 ausente e salto na hierarquia', () => {
    const analysis = createValidAnalysis()
    analysis.headingItems = [
      { id: 'h-1', level: 'h2', text: 'Seção' },
      { id: 'h-2', level: 'h4', text: 'Detalhe' }
    ]

    const audit = createAccessibilityAudit(analysis)

    expect(audit.warningCount).toBe(2)
    expect(audit.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'heading-h1-count' }),
        expect.objectContaining({ id: 'heading-jump-2' })
      ])
    )
  })

  it('resume listas extensas sem alterar a contagem total', () => {
    const analysis = createValidAnalysis()
    analysis.linkItems = Array.from({ length: 10 }, (_, index) => ({
      id: `l-${index + 1}`,
      text: 'Link sem descrição',
      hasAccessibleName: false
    }))

    const audit = createAccessibilityAudit(analysis)
    const linkIssues = audit.issues.filter((issue) => {
      return issue.id.startsWith('link-')
    })

    expect(audit.errorCount).toBe(10)
    expect(linkIssues).toHaveLength(9)
    expect(linkIssues.at(-1)).toMatchObject({
      id: 'link-remaining',
      title: 'Mais 2 ocorrências'
    })
  })

  it('não cria auditoria antes de existir uma análise', () => {
    expect(createAccessibilityAudit(null)).toBeNull()
  })
})

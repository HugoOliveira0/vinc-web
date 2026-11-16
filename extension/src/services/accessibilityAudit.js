const maxDetailedIssuesPerCheck = 8

const createElementIssue = ({
  id,
  severity,
  title,
  description,
  type,
  index
}) => ({
  id,
  severity,
  title,
  description,
  element: type && index ? { type, index } : null
})

const addLimitedElementIssues = ({
  issues,
  items,
  predicate,
  severity,
  type,
  title,
  description
}) => {
  const invalidItems = items
    .map((item, index) => ({ item, index: index + 1 }))
    .filter(({ item }) => predicate(item))

  invalidItems
    .slice(0, maxDetailedIssuesPerCheck)
    .forEach(({ item, index }) => {
      issues.push(createElementIssue({
        id: `${type}-${index}`,
        severity,
        title: title(index, item),
        description: description(index, item),
        type,
        index
      }))
    })

  if (invalidItems.length > maxDetailedIssuesPerCheck) {
    issues.push(createElementIssue({
      id: `${type}-remaining`,
      severity,
      title: `Mais ${invalidItems.length - maxDetailedIssuesPerCheck} ocorrências`,
      description:
        'A lista foi resumida para manter o painel fácil de navegar.'
    }))
  }

  return invalidItems.length
}

export const createAccessibilityAudit = (analysis) => {
  if (!analysis) {
    return null
  }

  const issues = []
  let passedChecks = 0
  const totalChecks = 8

  if (analysis.title?.trim()) {
    passedChecks += 1
  } else {
    issues.push(createElementIssue({
      id: 'document-title',
      severity: 'error',
      title: 'Página sem título',
      description:
        'O documento deve possuir um título que identifique seu conteúdo.'
    }))
  }

  if (analysis.language?.trim()) {
    passedChecks += 1
  } else {
    issues.push(createElementIssue({
      id: 'document-language',
      severity: 'error',
      title: 'Idioma da página não definido',
      description:
        'Defina o atributo lang no elemento HTML para auxiliar leitores de tela.'
    }))
  }

  const h1Items = analysis.headingItems.filter((item) => item.level === 'h1')

  if (h1Items.length === 1) {
    passedChecks += 1
  } else {
    issues.push(createElementIssue({
      id: 'heading-h1-count',
      severity: 'warning',
      title: h1Items.length === 0
        ? 'Nenhum título H1 visível'
        : `${h1Items.length} títulos H1 visíveis`,
      description: h1Items.length === 0
        ? 'Um H1 principal facilita a identificação do assunto da página.'
        : 'Revise se existe um único título principal claramente identificado.'
    }))
  }

  let headingJumpCount = 0

  for (let index = 1; index < analysis.headingItems.length; index += 1) {
    const previousLevel = Number(analysis.headingItems[index - 1].level.slice(1))
    const currentHeading = analysis.headingItems[index]
    const currentLevel = Number(currentHeading.level.slice(1))

    if (currentLevel > previousLevel + 1) {
      headingJumpCount += 1

      if (headingJumpCount <= maxDetailedIssuesPerCheck) {
        issues.push(createElementIssue({
          id: `heading-jump-${index + 1}`,
          severity: 'warning',
          title: `Título ${index + 1} pula de H${previousLevel} para H${currentLevel}`,
          description:
            'A hierarquia de títulos deve representar a estrutura do conteúdo.',
          type: 'heading',
          index: index + 1
        }))
      }
    }
  }

  if (headingJumpCount === 0) {
    passedChecks += 1
  } else if (headingJumpCount > maxDetailedIssuesPerCheck) {
    issues.push(createElementIssue({
      id: 'heading-jump-remaining',
      severity: 'warning',
      title:
        `Mais ${headingJumpCount - maxDetailedIssuesPerCheck} saltos de nível`,
      description:
        'A lista foi resumida para manter o painel fácil de navegar.'
    }))
  }

  const missingLinkNames = addLimitedElementIssues({
    issues,
    items: analysis.linkItems,
    predicate: (item) => !item.hasAccessibleName,
    severity: 'error',
    type: 'link',
    title: (index) => `Link ${index} sem nome acessível`,
    description: () =>
      'O link precisa de texto ou rótulo que informe seu destino ou finalidade.'
  })

  if (missingLinkNames === 0) {
    passedChecks += 1
  }

  const missingButtonNames = addLimitedElementIssues({
    issues,
    items: analysis.buttonItems,
    predicate: (item) => !item.hasAccessibleName,
    severity: 'error',
    type: 'button',
    title: (index) => `Botão ${index} sem nome acessível`,
    description: () =>
      'O botão precisa de texto, aria-label ou outro nome acessível.'
  })

  if (missingButtonNames === 0) {
    passedChecks += 1
  }

  const missingFieldLabels = addLimitedElementIssues({
    issues,
    items: analysis.fieldItems,
    predicate: (item) => !item.hasAccessibleLabel,
    severity: 'error',
    type: 'field',
    title: (index) => `Campo ${index} sem rótulo acessível`,
    description: () =>
      'Placeholder e atributo name não substituem um label associado ao campo.'
  })

  if (missingFieldLabels === 0) {
    passedChecks += 1
  }

  const missingImageAlternatives = addLimitedElementIssues({
    issues,
    items: analysis.imageItems,
    predicate: (item) => !item.hasAlt,
    severity: 'error',
    type: 'image',
    title: (index) => `Imagem ${index} sem atributo alt`,
    description: () =>
      'Imagens informativas precisam de descrição; decorativas devem usar alt vazio.'
  })

  if (missingImageAlternatives === 0) {
    passedChecks += 1
  }

  const errorCount =
    (analysis.title?.trim() ? 0 : 1) +
    (analysis.language?.trim() ? 0 : 1) +
    missingLinkNames +
    missingButtonNames +
    missingFieldLabels +
    missingImageAlternatives

  const warningCount =
    (h1Items.length === 1 ? 0 : 1) + headingJumpCount

  return {
    issues,
    errorCount,
    warningCount,
    passedChecks,
    totalChecks
  }
}

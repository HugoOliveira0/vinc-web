const normalizeText = (text) => {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')
    .trim()
}

const getRequestedLinkIndex = (question) => {
  const normalizedQuestion = normalizeText(question)
  const match = normalizedQuestion.match(
    /\blink\s*(?:numero\s*)?(\d+)\b/
  )

  return match ? Number(match[1]) : null
}

const isObjectiveLinkQuestion = (question) => {
  const normalizedQuestion = normalizeText(question)

  return [
    /\bo que (?:e|eh) (?:o )?link\b/,
    /\bqual (?:e|eh) (?:o )?link\b/,
    /\bqual (?:e|eh) (?:o )?rotulo\b/,
    /\b(?:para|pra) onde (?:vai|leva)\b/,
    /\bonde (?:vai|leva)\b/,
    /\bqual (?:e|eh) (?:o )?destino\b/,
    /\bqual (?:e|eh) (?:a )?url\b/,
    /^link\s*(?:numero\s*)?\d+\??$/
  ].some((pattern) => pattern.test(normalizedQuestion))
}

const formatDestination = (link) => {
  if (!link.url) {
    return ''
  }

  try {
    const url = new URL(link.url)
    const path = decodeURIComponent(url.pathname)
    const destination = `${url.hostname}${path}${url.hash}`

    return destination.length > 180
      ? `${destination.slice(0, 177)}...`
      : destination
  } catch {
    return link.url.slice(0, 180)
  }
}

export const answerPageQuestionLocally = (analysis, question) => {
  const linkIndex = getRequestedLinkIndex(question)

  if (!linkIndex || !isObjectiveLinkQuestion(question)) {
    return null
  }

  const link = analysis?.linkItems?.[linkIndex - 1]

  if (!link) {
    return {
      answer: `O link ${linkIndex} não está disponível na análise atual.`,
      referencedElements: []
    }
  }

  const label = link.text || 'Link sem descrição'
  const details = [`O link ${linkIndex} possui o rótulo “${label}”.`]

  if (label.length <= 2 || !link.hasAccessibleName) {
    details.push('Esse rótulo é curto e pouco descritivo.')
  }

  if (link.destinationLabel && link.destinationLabel !== label) {
    details.push(`O destino é identificado como “${link.destinationLabel}”.`)
  }

  const destination = formatDestination(link)

  if (destination) {
    details.push(`Ele leva para ${destination}.`)
  }

  if (link.section) {
    details.push(`O link aparece na seção “${link.section}”.`)
  } else if (link.context) {
    details.push(`Contexto próximo: ${link.context}.`)
  }

  return {
    answer: details.join(' '),
    referencedElements: [{
      type: 'link',
      index: linkIndex,
      label,
      reason: 'Link consultado diretamente no catálogo da página.'
    }]
  }
}

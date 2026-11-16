const getConfiguration = () => ({
  endpoint: import.meta.env.VITE_AI_API_URL?.trim(),
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()
})

const maxItemsPerCategory = 30
const maxLabelLength = 180

const normalizeCatalogItems = (items, getLabel) => {
  return items
    .slice(0, maxItemsPerCategory)
    .map((item, itemIndex) => ({
      index: itemIndex + 1,
      label: getLabel(item).slice(0, maxLabelLength)
    }))
}

export const createElementCatalog = (analysis) => ({
  heading: normalizeCatalogItems(
    analysis.headingItems,
    (item) => `${item.level.toUpperCase()}: ${item.text}`
  ),
  link: normalizeCatalogItems(
    analysis.linkItems,
    (item) => item.text
  ),
  button: normalizeCatalogItems(
    analysis.buttonItems,
    (item) => item.text
  ),
  field: normalizeCatalogItems(
    analysis.fieldItems,
    (item) => `${item.label} (${item.type})`
  ),
  image: normalizeCatalogItems(
    analysis.imageItems,
    (item) => item.description
  )
})

export const isAISummaryConfigured = () => {
  const { endpoint, publishableKey } = getConfiguration()
  return Boolean(endpoint && publishableKey)
}

const createAIRequestError = (response, responseData, fallbackMessage) => {
  const error = new Error(responseData?.error || fallbackMessage)
  error.status = response.status
  error.retryAfter = Number(
    responseData?.retryAfter || response.headers.get('retry-after') || 0
  )
  return error
}

export const generateAISummary = async ({
  page,
  elements,
  signal
}) => {
  const { endpoint, publishableKey } = getConfiguration()

  if (!endpoint || !publishableKey) {
    throw new Error(
      'O serviço de IA ainda não foi configurado nesta versão da extensão.'
    )
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`
    },
    body: JSON.stringify({ page, elements }),
    signal
  })

  const responseData = await response.json().catch(() => null)

  if (!response.ok) {
    throw createAIRequestError(
      response,
      responseData,
      'O serviço de IA não conseguiu gerar o resumo.'
    )
  }

  if (!responseData?.summary) {
    throw new Error('O serviço de IA retornou uma resposta inválida.')
  }

  return {
    summary: responseData.summary,
    keyElements: Array.isArray(responseData.keyElements)
      ? responseData.keyElements
      : []
  }
}

const maxQuestionTextLength = 8000
const initialQuestionContextLength = 3500
const ignoredQuestionWords = new Set([
  'a', 'as', 'o', 'os', 'de', 'da', 'das', 'do', 'dos', 'e', 'em',
  'um', 'uma', 'para', 'por', 'que', 'qual', 'quais', 'como', 'sobre',
  'esta', 'este', 'essa', 'esse', 'pagina', 'página'
])

const normalizeSearchText = (text) => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
}

const createQuestionContext = (text, question) => {
  if (text.length <= maxQuestionTextLength) {
    return text
  }

  const questionTokens = normalizeSearchText(question)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !ignoredQuestionWords.has(token))

  const initialContext = text.slice(0, initialQuestionContextLength)
  const chunks = text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)

  const relevantChunks = chunks
    .map((chunk, index) => {
      const normalizedChunk = normalizeSearchText(chunk)
      const score = questionTokens.reduce((total, token) => {
        return total + (normalizedChunk.includes(token) ? 1 : 0)
      }, 0)

      return { chunk, index, score }
    })
    .filter(({ score }) => score > 0)
    .sort((first, second) => {
      return second.score - first.score || first.index - second.index
    })

  const selectedChunks = []
  const selectedText = new Set()
  let currentLength = initialContext.length

  for (const { chunk } of relevantChunks) {
    if (
      selectedText.has(chunk) ||
      currentLength + chunk.length > maxQuestionTextLength
    ) {
      continue
    }

    selectedChunks.push(chunk)
    selectedText.add(chunk)
    currentLength += chunk.length + 1
  }

  return [initialContext, ...selectedChunks]
    .join('\n')
    .slice(0, maxQuestionTextLength)
}

export const askPageQuestion = async ({
  page,
  elements,
  question,
  signal
}) => {
  const { endpoint, publishableKey } = getConfiguration()

  if (!endpoint || !publishableKey) {
    throw new Error(
      'O serviço de IA ainda não foi configurado nesta versão da extensão.'
    )
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`
    },
    body: JSON.stringify({
      mode: 'question',
      page: {
        ...page,
        text: createQuestionContext(page.text, question)
      },
      elements,
      question
    }),
    signal
  })

  const responseData = await response.json().catch(() => null)

  if (!response.ok) {
    throw createAIRequestError(
      response,
      responseData,
      'O serviço de IA não conseguiu responder à pergunta.'
    )
  }

  if (!responseData?.answer) {
    throw new Error('O serviço de IA retornou uma resposta inválida.')
  }

  return {
    answer: responseData.answer,
    referencedElements: Array.isArray(responseData.referencedElements)
      ? responseData.referencedElements
      : []
  }
}


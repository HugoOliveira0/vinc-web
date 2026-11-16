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
    throw new Error(
      responseData?.error ||
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

export const askPageQuestion = async ({
  page,
  elements,
  question,
  summary,
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
      page,
      elements,
      question,
      summary: summary || ''
    }),
    signal
  })

  const responseData = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      responseData?.error ||
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


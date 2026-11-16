const storageKey = 'aiSummaryCache'
const questionStorageKey = 'aiQuestionCache'
const cacheDuration = 30 * 60 * 1000
const maxCacheEntries = 20
const maxQuestionCacheEntries = 40

const createContentFingerprint = async (page, elements) => {
  const catalogText = Object.entries(elements)
    .flatMap(([type, items]) => {
      return items.map((item) => `${type}:${item.index}:${item.label}`)
    })
    .join('\n')

  const content = [
    page.url,
    page.title,
    page.description,
    page.text,
    catalogText
  ].join('\n')

  const data = new TextEncoder().encode(content)
  const digest = await crypto.subtle.digest('SHA-256', data)

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const createQuestionFingerprint = async (page, elements, question) => {
  const pageFingerprint = await createContentFingerprint(page, elements)
  const normalizedQuestion = question
    .trim()
    .toLocaleLowerCase('pt-BR')
    .replace(/\s+/g, ' ')

  const data = new TextEncoder().encode(
    `${pageFingerprint}\n${normalizedQuestion}`
  )
  const digest = await crypto.subtle.digest('SHA-256', data)

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

const loadCache = async () => {
  const stored = await chrome.storage.session.get(storageKey)
  return stored[storageKey] || {}
}

const saveCache = async (cache) => {
  await chrome.storage.session.set({ [storageKey]: cache })
}

const loadQuestionCache = async () => {
  const stored = await chrome.storage.session.get(questionStorageKey)
  return stored[questionStorageKey] || {}
}

const saveQuestionCache = async (cache) => {
  await chrome.storage.session.set({ [questionStorageKey]: cache })
}

const removeExpiredEntries = (cache) => {
  const minimumCreatedAt = Date.now() - cacheDuration

  return Object.fromEntries(
    Object.entries(cache).filter(([, entry]) => {
      return entry.createdAt >= minimumCreatedAt
    })
  )
}

export const getCachedAISummary = async (page, elements) => {
  const fingerprint = await createContentFingerprint(page, elements)
  const cache = removeExpiredEntries(await loadCache())
  const entry = cache[fingerprint]

  if (!entry) {
    await saveCache(cache)
    return { fingerprint, result: null }
  }

  return {
    fingerprint,
    result: entry.result
  }
}

export const cacheAISummary = async (fingerprint, result) => {
  const currentCache = removeExpiredEntries(await loadCache())

  const cacheEntries = Object.entries({
    ...currentCache,
    [fingerprint]: {
      createdAt: Date.now(),
      result
    }
  })
    .sort(([, first], [, second]) => {
      return second.createdAt - first.createdAt
    })
    .slice(0, maxCacheEntries)

  await saveCache(Object.fromEntries(cacheEntries))
}

export const getCachedAIAnswer = async (page, elements, question) => {
  const fingerprint = await createQuestionFingerprint(
    page,
    elements,
    question
  )
  const cache = removeExpiredEntries(await loadQuestionCache())
  const entry = cache[fingerprint]

  if (!entry) {
    await saveQuestionCache(cache)
    return { fingerprint, result: null }
  }

  return {
    fingerprint,
    result: entry.result
  }
}

export const cacheAIAnswer = async (fingerprint, result) => {
  const currentCache = removeExpiredEntries(await loadQuestionCache())

  const cacheEntries = Object.entries({
    ...currentCache,
    [fingerprint]: {
      createdAt: Date.now(),
      result
    }
  })
    .sort(([, first], [, second]) => {
      return second.createdAt - first.createdAt
    })
    .slice(0, maxQuestionCacheEntries)

  await saveQuestionCache(Object.fromEntries(cacheEntries))
}


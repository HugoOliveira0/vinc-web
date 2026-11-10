const normalizeText = (value) => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

const matchesQuery = (query, ...values) => {
  if (!query) {
    return true
  }

  return normalizeText(values.filter(Boolean).join(' ')).includes(query)
}

export const filterAnalysisResults = (analysis, searchText) => {
  const query = normalizeText(searchText.trim())

  if (!analysis) {
    return {
      heading: [],
      link: [],
      button: [],
      field: [],
      image: []
    }
  }

  return {
    heading: analysis.headingItems.filter((item) => {
      return matchesQuery(query, item.level, item.text)
    }),

    link: analysis.linkItems.filter((item) => {
      return matchesQuery(query, item.text, item.url)
    }),

    button: analysis.buttonItems.filter((item) => {
      return matchesQuery(query, item.text)
    }),

    field: analysis.fieldItems.filter((item) => {
      return matchesQuery(
        query,
        item.label,
        item.type,
        item.required && 'obrigatório',
        item.disabled && 'desabilitado'
      )
    }),

    image: analysis.imageItems.filter((item) => {
      return matchesQuery(
        query,
        item.description,
        item.decorative && 'decorativa',
        item.hasAlt ? 'com descrição' : 'sem descrição'
      )
    })
  }
}

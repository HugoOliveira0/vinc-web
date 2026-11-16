const collectPageContentInPage = () => {
  const maxTextLength = 14000
  const contentRoot =
    document.querySelector('main, article, [role="main"]') ||
    document.body

  const excludedSelector = [
    'script',
    'style',
    'noscript',
    'template',
    'nav',
    'header',
    'footer',
    'form',
    'button',
    'input',
    'textarea',
    'select',
    '[hidden]',
    '[aria-hidden="true"]'
  ].join(', ')

  const contentSelector = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'p',
    'li',
    'blockquote',
    'figcaption',
    'th',
    'td'
  ].join(', ')

  const isVisible = (element) => {
    const style = window.getComputedStyle(element)
    const rect = element.getBoundingClientRect()

    return (
      !element.hidden &&
      !element.closest('[hidden], [aria-hidden="true"]') &&
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      Number(style.opacity) !== 0 &&
      rect.width > 0 &&
      rect.height > 0
    )
  }

  const normalizeText = (text) => {
    return text.replace(/\s+/g, ' ').trim()
  }

  const textBlocks = [...contentRoot.querySelectorAll(contentSelector)]
    .filter((element) => {
      return !element.closest(excludedSelector) && isVisible(element)
    })
    .map((element) => normalizeText(element.innerText || ''))
    .filter((text, index, items) => {
      return text.length >= 2 && text !== items[index - 1]
    })

  const completeText = textBlocks.join('\n')
  const description = document
    .querySelector('meta[name="description"]')
    ?.getAttribute('content')
    ?.trim() || ''

  const pageUrl = `${window.location.origin}${window.location.pathname}`

  return {
    title: document.title.trim(),
    url: pageUrl,
    language: document.documentElement.lang || 'pt-BR',
    description: description.slice(0, 500),
    text: completeText.slice(0, maxTextLength),
    truncated: completeText.length > maxTextLength
  }
}

export const collectPageContent = async (tabId) => {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: collectPageContentInPage
  })

  return result
}


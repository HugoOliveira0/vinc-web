import { useState } from 'react'

function App() {
  const [status, setStatus] = useState('Aguardando análise...')
  const [analysis, setAnalysis] = useState(null)

  const handleAnalyze = async () => {
    // Limpando resultado anterior
    setAnalysis(null)

    setStatus('Analisando página...')

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      const [{ result: pageData }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const allHeadings = [
            ...document.querySelectorAll('h1, h2, h3, h4, h5, h6')
          ]

          const isVisible = (element) => {
            const style = window.getComputedStyle(element)
            const rect = element.getBoundingClientRect()

            const isVisuallyClipped =
              (
                style.clip !== 'auto' ||
                style.clipPath !== 'none'
              ) &&
              rect.width <= 1 &&
              rect.height <= 1

            return (
              !element.hidden &&
              !element.closest('[hidden], [aria-hidden="true"]') &&
              style.display !== 'none' &&
              style.visibility !== 'hidden' &&
              Number(style.opacity) !== 0 &&
              rect.width > 0 &&
              rect.height > 0 &&
              !isVisuallyClipped
            )
          }

          allHeadings.forEach((heading) => {
            heading.removeAttribute('data-vinc-heading-id')
          })

          const headingElements = allHeadings.filter((heading) => {
            return isVisible(heading) && heading.innerText.trim()
          })

          headingElements.forEach((heading, index) => {
            heading.dataset.vincHeadingId = `vinc-heading-${index}`
          })

          return {
            title: document.title,

            headings: headingElements.length,

            headingItems: headingElements
              .slice(0, 20)
              .map((heading) => ({
                id: heading.dataset.vincHeadingId,
                level: heading.tagName.toLowerCase(),
                text: heading.innerText.trim()
              })),

            links: document.querySelectorAll('a').length,

            buttons: document.querySelectorAll(
              'button, [role="button"]'
            ).length,

            fields: document.querySelectorAll(
              'input, textarea, select'
            ).length,

            images: document.querySelectorAll('img').length
          }
        }
      })

      console.log('Análise da página:', pageData)
      setAnalysis(pageData)
      setStatus('Análise concluída.')

    } catch (error) {
      setAnalysis(null)
      console.error('Erro ao analisar a página:', error)
      setStatus('Não foi possível analisar a página.')
    }
  }

  const handleHeadingClick = async (headingId) => {
    setStatus('Localizando título...')

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      const [{ result: found }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        args: [headingId],

        func: (id) => {
          const selectedHeading = document.querySelector(
            `[data-vinc-heading-id="${id}"]`
          )

          if (!selectedHeading) {
            return false
          }

          selectedHeading.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })

          return true
        }
      })

      if (found) {
        setStatus('Título localizado na página.')
      } else {
        setStatus('O título não existe mais na página.')
      }
    } catch (error) {
      console.error('Erro ao localizar título:', error)
      setStatus('Não foi possível localizar o título.')
    }
  }

  return(
    <main>
      <h1>V.Inc Web</h1>

      <p>Extensão de acessibilidade para análise e navegação em páginas web.</p>

      <button type="button" onClick={handleAnalyze}>Analisar página</button>

      <p role="status">{status}</p>

      {analysis && (
        <section aria-labelledby="analysis-title">
          <h2 id="analysis-title">Resumo da página</h2>

          <p>
            <strong>Página:</strong> {analysis.title || 'Sem título'}
          </p>

          <ul>
            <li>Títulos: {analysis.headings}</li>
            <li>Links: {analysis.links}</li>
            <li>Botões: {analysis.buttons}</li>
            <li>Campos: {analysis.fields}</li>
            <li>Imagens: {analysis.images}</li>
          </ul>

          <h3>Títulos encontrados</h3>

          {analysis.headingItems.length > 0 ? (
            <ol>
              {analysis.headingItems.map((heading) => (
                <li key={heading.id}>
                  <button
                    type="button"
                    onClick={() => handleHeadingClick(heading.id)}
                  >
                    <strong>{heading.level.toUpperCase()}:</strong>{' '}
                    {heading.text}
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p>Nenhum título com texto foi encontrado.</p>
          )}
        </section>
      )}
    </main>
  )
}

export default App

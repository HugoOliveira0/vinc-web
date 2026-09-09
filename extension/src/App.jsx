import { useState } from 'react'

function App() {
  const [status, setStatus] = useState('Aguardando análise...')

  const handleAnalyze = async () => {
    setStatus('Analisando página...')

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      const [{ result: pageTitle }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.title
      })

      console.log('Título obtido da página:', pageTitle)
      setStatus(`Página atual: ${pageTitle}`)

    } catch (error) {
      console.error('Erro ao analisar a página:', error)
      setStatus('Não foi possível analisar a página.')
    }
  }

  return(
    <main>
      <h1>V.Inc Web</h1>

      <p>Extensão de acessibilidade para análise e navegação em páginas web.</p>

      <button type="button" onClick={handleAnalyze}>Analisar página</button>

      <p role="status">{status}</p>
    </main>
  )
}

export default App

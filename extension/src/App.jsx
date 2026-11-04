import { useEffect, useState } from 'react'
import vincLogo from './assets/vinc_logo.svg'
import { truncateText } from './utils/text'
import { analyzePage } from './services/pageAnalysis'
import {
  locateHeading,
  locateLink,
  locateButton,
  locateField,
  locateImage
} from './services/pageNavigation'
import { speakText, stopSpeech } from './services/speech'


const formatCount = (count, singular, plural) => {
  return `${count} ${count === 1 ? singular : plural}`
}


function App() {
  const [status, setStatus] = useState('Aguardando análise...')
  const [analysis, setAnalysis] = useState(null)

  const [isSpeaking, setIsSpeaking] = useState(false)

  useEffect(() => {
    return () => {
      stopSpeech()
    }
  }, [])

  const handleAnalyze = async () => {
    stopSpeech()
    setIsSpeaking(false)

    // Limpando resultado anterior
    setAnalysis(null)

    setStatus('Analisando página...')

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      const pageData = await analyzePage(tab.id)

      console.log('Análise da página:', pageData)
      setAnalysis({
        ...pageData,
        tabId: tab.id
      })
      setStatus('Análise concluída.')

    } catch (error) {
      setAnalysis(null)
      console.error('Erro ao analisar a página:', error)
      setStatus('Não foi possível analisar a página.')
    }
  }

  const handleReadSummary = () => {
    if (!analysis) {
      setStatus('Analise uma página antes de iniciar a leitura.')
      return
    }

    const pageTitle = analysis.title || 'sem título'

    const summaryText = [
      `Resumo da página ${pageTitle}.`,
      `Foram encontrados`,
      `${formatCount(analysis.headings, 'título', 'títulos')},`,
      `${formatCount(analysis.links, 'link', 'links')},`,
      `${formatCount(analysis.buttons, 'botão', 'botões')},`,
      `${formatCount(analysis.fields, 'campo', 'campos')} e`,
      `${formatCount(analysis.images, 'imagem', 'imagens')}.`
    ].join(' ')

    try {
      setIsSpeaking(true)
      setStatus('Preparando leitura...')

      speakText(summaryText, {
        onStart: () => {
          setStatus('Lendo o resumo da página...')
        },

        onEnd: () => {
          setIsSpeaking(false)
          setStatus('Leitura concluída.')
        },

        onError: (event) => {
          console.error('Erro durante a leitura:', event.error)
          setIsSpeaking(false)
          setStatus('Não foi possível realizar a leitura.')
        }
      })
    } catch (error) {
      console.error('Erro ao iniciar leitura:', error)
      setIsSpeaking(false)
      setStatus(error.message)
    }
  }

  const handleStopReading = () => {
    stopSpeech()
    setIsSpeaking(false)
    setStatus('Leitura interrompida.')
  }

  const handleHeadingClick = async (headingId) => {
    setStatus('Localizando título...')

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (tab.id !== analysis.tabId) {
        setStatus('A página analisada não é mais a aba ativa. Analise novamente.')
        return
      }

      const found = await locateHeading(tab.id, headingId)

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

  const handleLinkClick = async (linkId) => {
    setStatus('Localizando link...')

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (tab.id !== analysis.tabId) {
        setStatus('A página analisada não é mais a aba ativa. Analise novamente.')
        return
      }

      const found = await locateLink(tab.id, linkId)

      if (found) {
        setStatus('Link localizado na página.')
      } else {
        setStatus('O link não existe mais na página.')
      }
    } catch (error) {
      console.error('Erro ao localizar link:', error)
      setStatus('Não foi possível localizar o link.')
    }
  }


  const handleButtonClick = async (buttonId) => {
    setStatus('Localizando botão...')

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (tab.id !== analysis.tabId) {
        setStatus(
          'A página analisada não é mais a aba ativa. Analise novamente.'
        )
        return
      }

      const found = await locateButton(tab.id, buttonId)

      if (found) {
        setStatus('Botão localizado na página.')
      } else {
        setStatus('O botão não existe mais na página.')
      }
    } catch (error) {
      console.error('Erro ao localizar botão:', error)
      setStatus('Não foi possível localizar o botão.')
    }
  }

  const handleFieldClick = async (fieldId) => {
    setStatus('Localizando campo...')

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (tab.id !== analysis.tabId) {
        setStatus(
          'A página analisada não é mais a aba ativa. Analise novamente.'
        )
        return
      }

      const found = await locateField(tab.id, fieldId)

      if (found) {
        setStatus('Campo localizado na página.')
      } else {
        setStatus('O campo não existe mais na página.')
      }
    } catch (error) {
      console.error('Erro ao localizar campo:', error)
      setStatus('Não foi possível localizar o campo.')
    }
  }


  const handleImageClick = async (imageId) => {
    setStatus('Localizando imagem...')

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      if (tab.id !== analysis.tabId) {
        setStatus(
          'A página analisada não é mais a aba ativa. Analise novamente.'
        )
        return
      }

      const found = await locateImage(tab.id, imageId)

      if (found) {
        setStatus('Imagem localizada na página.')
      } else {
        setStatus('A imagem não existe mais na página.')
      }
    } catch (error) {
      console.error('Erro ao localizar imagem:', error)
      setStatus('Não foi possível localizar a imagem.')
    }
  }


  return (
    <main className="app">
      <header className="brand-header">
        <img
          className="brand-logo"
          src={vincLogo}
          alt=""
          aria-hidden="true"
        />

        <div>
          <h1>V.Inc Web</h1>
          <p className="brand-subtitle">VOZ INCLUSIVA</p>
        </div>
      </header>

      <p className="app-description">
        Extensão de acessibilidade para análise e navegação em páginas web.
      </p>

      <button
        className="analyze-button"
        type="button"
        onClick={handleAnalyze}
      >
        Analisar página
      </button>

      <p className="status-message" role="status">{status}</p>

      {analysis && (
        <div
          className="speech-controls"
          aria-label="Controles de leitura"
        >
          <button
            className="speech-button speech-button-primary"
            type="button"
            onClick={handleReadSummary}
            disabled={isSpeaking}
          >
            Ouvir resumo
          </button>

          <button
            className="speech-button speech-button-stop"
            type="button"
            onClick={handleStopReading}
            disabled={!isSpeaking}
          >
            Parar leitura
          </button>
        </div>
      )}

      {analysis && (
        <section className="analysis" aria-labelledby="analysis-title">
          <h2 id="analysis-title">Resumo da página</h2>

          <p className="page-title">
            <strong>Página:</strong> {analysis.title || 'Sem título'}
          </p>

          <ul className="summary-list">
            <li>Títulos: {analysis.headings}</li>
            <li>Links: {analysis.links}</li>
            <li>Botões: {analysis.buttons}</li>
            <li>Campos: {analysis.fields}</li>
            <li>Imagens: {analysis.images}</li>
          </ul>


          <h3>Títulos encontrados</h3>

          {analysis.headingItems.length > 0 ? (
            <ol className="result-list">
              {analysis.headingItems.map((heading) => (
                <li key={heading.id}>
                  <button
                    className="result-button"
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


          <h3>Links encontrados</h3>

          {analysis.linkItems.length > 0 ? (
            <ol className="result-list">
              {analysis.linkItems.map((link) => (
                <li key={link.id}>
                  <button
                    className="result-button"
                    type="button"
                    title={link.text}
                    aria-label={`Localizar link: ${link.text}`}
                    onClick={() => handleLinkClick(link.id)}
                  >
                    {truncateText(link.text)}
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p>Nenhum link visível foi encontrado.</p>
          )}


          <h3>Botões encontrados</h3>

          {analysis.buttonItems.length > 0 ? (
            <ol className="result-list">
              {analysis.buttonItems.map((button) => (
                <li key={button.id}>
                  <button
                    className="result-button"
                    type="button"
                    title={button.text}
                    aria-label={`Localizar botão: ${button.text}`}
                    onClick={() => handleButtonClick(button.id)}
                  >
                    {truncateText(button.text)}
                  </button>
                </li>
              ))}
            </ol>
          ) : (
            <p>Nenhum botão visível foi encontrado.</p>
          )}

          <h3>Campos encontrados</h3>

          {analysis.fieldItems.length > 0 ? (
            <ol className="result-list">
              {analysis.fieldItems.map((field) => {
                const fieldDetails = [
                  field.type,
                  field.required && 'obrigatório',
                  field.disabled && 'desabilitado'
                ].filter(Boolean).join(' · ')

                return (
                  <li key={field.id}>
                    <button
                      className="result-button"
                      type="button"
                      title={field.label}
                      aria-label={`Localizar campo: ${field.label}. ${fieldDetails}`}
                      onClick={() => handleFieldClick(field.id)}
                    >
                      <strong>{truncateText(field.label)}</strong>
                      <span className="result-meta">{fieldDetails}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p>Nenhum campo visível foi encontrado.</p>
          )}


          <h3>Imagens encontradas</h3>

          {analysis.imageItems.length > 0 ? (
            <ol className="result-list">
              {analysis.imageItems.map((image) => {
                const imageDetails = [
                  image.decorative
                    ? 'decorativa'
                    : image.hasAlt
                      ? 'com descrição'
                      : 'sem descrição',

                  image.width > 0 &&
                  image.height > 0 &&
                  `${image.width} × ${image.height}px`
                ].filter(Boolean).join(' · ')

                return (
                  <li key={image.id}>
                    <button
                      className="result-button"
                      type="button"
                      title={image.description}
                      aria-label={`Localizar imagem: ${image.description}. ${imageDetails}`}
                      onClick={() => handleImageClick(image.id)}
                    >
                      <strong>{truncateText(image.description)}</strong>
                      <span className="result-meta">{imageDetails}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          ) : (
            <p>Nenhuma imagem visível foi encontrada.</p>
          )}

        </section>
      )}
    </main>
  )
}

export default App

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import vincLogo from './assets/vinc_logo.svg'
import AccessibilitySettings from './components/AccessibilitySettings'
import ResultSection from './components/ResultSection'
import { truncateText } from './utils/text'
import { filterAnalysisResults } from './utils/filterResults'
import { analyzePage } from './services/pageAnalysis'
import {
  locateHeading,
  locateLink,
  locateButton,
  locateField,
  locateImage,
  activateLink,
  activateButton,
  scrollPage
} from './services/pageNavigation'
import { speakText, stopSpeech } from './services/speech'
import { parseCommand } from './services/commands'
import {
  applyPreferences,
  defaultPreferences,
  loadPreferences,
  savePreferences
} from './services/preferences'
import {
  createSpeechRecognition,
  getRecognitionErrorMessage,
  isSpeechRecognitionSupported,
  requestMicrophonePermission
} from './services/voiceRecognition'


const formatCount = (count, singular, plural) => {
  return `${count} ${count === 1 ? singular : plural}`
}

const createNavigationIndexes = () => ({
  heading: -1,
  link: -1,
  button: -1,
  field: -1,
  image: -1
})

const resultPageSize = 5

const createVisibleResultCounts = () => ({
  heading: resultPageSize,
  link: resultPageSize,
  button: resultPageSize,
  field: resultPageSize,
  image: resultPageSize
})


function App() {
  const [status, setStatus] = useState('Aguardando análise...')
  const [analysis, setAnalysis] = useState(null)
  const [preferences, setPreferences] = useState(defaultPreferences)

  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [commandText, setCommandText] = useState('')
  const [resultSearch, setResultSearch] = useState('')
  const [visibleResultCounts, setVisibleResultCounts] = useState(
    createVisibleResultCounts
  )
  const [navigationIndexes, setNavigationIndexes] = useState(
    createNavigationIndexes
  )
  const recognitionRef = useRef(null)
  const autoAnalyzeTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      stopSpeech()
      recognitionRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    loadPreferences()
      .then((storedPreferences) => {
        if (isMounted) {
          setPreferences(storedPreferences)
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar preferências:', error)

        if (isMounted) {
          setStatus('Não foi possível carregar as preferências salvas.')
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    applyPreferences(preferences)
  }, [preferences])

  const handlePreferenceChange = async (name, value) => {
    const updatedPreferences = {
      ...preferences,
      [name]: value
    }

    setPreferences(updatedPreferences)

    try {
      await savePreferences(updatedPreferences)
      setStatus('Preferências salvas.')
    } catch (error) {
      console.error('Erro ao salvar preferências:', error)
      setStatus('Não foi possível salvar as preferências.')
    }
  }

  const handleResetPreferences = async () => {
    setPreferences(defaultPreferences)

    try {
      await savePreferences(defaultPreferences)
      setStatus('Preferências restauradas.')
    } catch (error) {
      console.error('Erro ao restaurar preferências:', error)
      setStatus('Não foi possível restaurar as preferências.')
    }
  }

  const handleAnalyze = useCallback(async () => {
    stopSpeech()
    setIsSpeaking(false)
    recognitionRef.current?.abort()
    recognitionRef.current = null
    setIsListening(false)
    setNavigationIndexes(createNavigationIndexes())
    setResultSearch('')
    setVisibleResultCounts(createVisibleResultCounts())

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
  }, [])

  const filteredResults = useMemo(() => {
    return filterAnalysisResults(analysis, resultSearch)
  }, [analysis, resultSearch])

  const filteredResultCount = Object.values(filteredResults)
    .reduce((total, items) => total + items.length, 0)

  useEffect(() => {
    const canAnalyzeTab = (tab) => {
      if (!tab?.id || !tab.active || !tab.url) {
        return false
      }

      try {
        const protocol = new URL(tab.url).protocol
        return protocol === 'http:' || protocol === 'https:'
      } catch {
        return false
      }
    }

    const scheduleAnalysis = (tab) => {
      window.clearTimeout(autoAnalyzeTimerRef.current)

      if (!canAnalyzeTab(tab)) {
        if (tab?.active) {
          setAnalysis(null)
          setStatus('Esta página não permite análise pela extensão.')
        }

        return
      }

      autoAnalyzeTimerRef.current = window.setTimeout(() => {
        void handleAnalyze()
      }, 350)
    }

    const analyzeInitialTab = async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      scheduleAnalysis(tab)
    }

    const handleTabActivated = async ({ tabId }) => {
      try {
        const tab = await chrome.tabs.get(tabId)
        scheduleAnalysis(tab)
      } catch (error) {
        console.error('Erro ao acompanhar a aba ativa:', error)
      }
    }

    const handleTabUpdated = (tabId, changeInfo, tab) => {
      if (
        tab.active &&
        (changeInfo.status === 'complete' || changeInfo.url)
      ) {
        scheduleAnalysis({ ...tab, id: tabId })
      }
    }

    void analyzeInitialTab()

    chrome.tabs.onActivated.addListener(handleTabActivated)
    chrome.tabs.onUpdated.addListener(handleTabUpdated)

    return () => {
      window.clearTimeout(autoAnalyzeTimerRef.current)
      chrome.tabs.onActivated.removeListener(handleTabActivated)
      chrome.tabs.onUpdated.removeListener(handleTabUpdated)
    }
  }, [handleAnalyze])

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

  const getActiveAnalyzedTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })

    if (tab.id !== analysis?.tabId) {
      setStatus(
        'A página analisada não é mais a aba ativa. Analise novamente.'
      )
      return null
    }

    return tab
  }

  const getElementConfig = () => {
    return {
      heading: {
        items: analysis.headingItems,
        name: 'título',
        handler: handleHeadingClick
      },
      link: {
        items: analysis.linkItems,
        name: 'link',
        handler: handleLinkClick,
        activator: activateLink
      },
      button: {
        items: analysis.buttonItems,
        name: 'botão',
        handler: handleButtonClick,
        activator: activateButton
      },
      field: {
        items: analysis.fieldItems,
        name: 'campo',
        handler: handleFieldClick
      },
      image: {
        items: analysis.imageItems,
        name: 'imagem',
        handler: handleImageClick
      }
    }
  }

  const updateNavigationIndex = (elementType, index) => {
    setNavigationIndexes((currentIndexes) => ({
      ...currentIndexes,
      [elementType]: index
    }))
  }

  const getOriginalItemIndex = (elementType, itemId) => {
    const items = getElementConfig()[elementType]?.items || []
    return items.findIndex((item) => item.id === itemId)
  }

  const showMoreResults = (elementType) => {
    setVisibleResultCounts((currentCounts) => ({
      ...currentCounts,
      [elementType]: currentCounts[elementType] + resultPageSize
    }))
  }

  const updateResultSearch = (value) => {
    setResultSearch(value)
    setVisibleResultCounts(createVisibleResultCounts())
  }

  const handleLocateCommand = async ({ elementType, position }) => {
    const elementConfig = getElementConfig()

    const config = elementConfig[elementType]
    const itemIndex = position - 1

    if (!config || itemIndex < 0 || itemIndex >= config.items.length) {
      const availableCount = config?.items.length || 0

      setStatus(
        `Não existe ${config?.name || 'elemento'} ${position} na lista. ` +
        `${availableCount} itens estão disponíveis.`
      )
      return
    }

    await config.handler(config.items[itemIndex].id)
    updateNavigationIndex(elementType, itemIndex)
  }

  const handleNavigateElementCommand = async ({
    elementType,
    direction
  }) => {
    const config = getElementConfig()[elementType]

    if (!config || config.items.length === 0) {
      setStatus(
        `${elementType === 'image' ? 'Nenhuma' : 'Nenhum'} ` +
        `${config?.name || 'elemento'} visível foi encontrado.`
      )
      return
    }

    const currentIndex = navigationIndexes[elementType] ?? -1
    const itemCount = config.items.length

    const nextIndex = direction === 'previous'
      ? currentIndex < 0
        ? itemCount - 1
        : (currentIndex - 1 + itemCount) % itemCount
      : (currentIndex + 1) % itemCount

    await config.handler(config.items[nextIndex].id)
    updateNavigationIndex(elementType, nextIndex)
  }

  const handleActivateCommand = async ({ elementType, position }) => {
    const config = getElementConfig()[elementType]
    const itemIndex = position - 1

    if (
      !config?.activator ||
      itemIndex < 0 ||
      itemIndex >= config.items.length
    ) {
      const availableCount = config?.items.length || 0

      setStatus(
        `Não existe ${config?.name || 'elemento'} ${position} na lista. ` +
        `${availableCount} itens estão disponíveis.`
      )
      return
    }

    const tab = await getActiveAnalyzedTab()

    if (!tab) {
      return
    }

    setStatus(`Ativando ${config.name} ${position}...`)

    try {
      const result = await config.activator(
        tab.id,
        config.items[itemIndex].id
      )

      if (result?.activated) {
        updateNavigationIndex(elementType, itemIndex)
        setStatus(`${config.name} ${position} ativado.`)
        return
      }

      if (result?.reason === 'disabled') {
        setStatus(`${config.name} ${position} está desabilitado.`)
        return
      }

      setStatus(`${config.name} ${position} não pôde ser ativado.`)
    } catch (error) {
      console.error('Erro ao ativar elemento:', error)
      setStatus(`Não foi possível ativar ${config.name} ${position}.`)
    }
  }

  const handleScrollCommand = async (direction) => {
    const tab = await getActiveAnalyzedTab()

    if (!tab) {
      return
    }

    try {
      await scrollPage(tab.id, direction)
      setStatus(
        direction === 'up'
          ? 'Página rolada para cima.'
          : 'Página rolada para baixo.'
      )
    } catch (error) {
      console.error('Erro ao rolar página:', error)
      setStatus('Não foi possível rolar a página.')
    }
  }

  const executeCommand = async (text, { clearInput = true } = {}) => {
    const parsedCommand = parseCommand(text)

    if (parsedCommand.type === 'empty') {
      setStatus('Digite um comando antes de executar.')
      return
    }

    if (parsedCommand.type === 'help') {
      setStatus(
        'Exemplos: próximo título, link anterior, botão 2, ' +
        'clicar botão 2, abrir link 3, rolar pra baixo e ler resumo.'
      )
      return
    }

    if (clearInput) {
      setCommandText('')
    }

    switch (parsedCommand.type) {
      case 'read-summary':
        handleReadSummary()
        break

      case 'stop-reading':
        handleStopReading()
        break

      case 'navigate-element':
        await handleNavigateElementCommand(parsedCommand)
        break

      case 'locate-element':
        await handleLocateCommand(parsedCommand)
        break

      case 'activate-element':
        await handleActivateCommand(parsedCommand)
        break

      case 'scroll':
        await handleScrollCommand(parsedCommand.direction)
        break

      default:
        setStatus(
          `Comando não reconhecido: “${parsedCommand.originalText}”. ` +
          'Digite “ajuda” para ver exemplos.'
        )
    }
  }

  const handleCommandSubmit = async (event) => {
    event.preventDefault()
    await executeCommand(commandText)
  }

  const handleVoiceCommand = async () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setStatus('Finalizando reconhecimento...')
      return
    }

    try {
      stopSpeech()
      setIsSpeaking(false)

      const hasMicrophonePermission =
        await requestMicrophonePermission()

      if (!hasMicrophonePermission) {
        setStatus(
          'Autorize o microfone na aba aberta e tente novamente.'
        )
        return
      }

      const recognition = createSpeechRecognition({
        onStart: () => {
          setIsListening(true)
          setStatus('Ouvindo comando...')
        },

        onResult: (transcript) => {
          if (!transcript) {
            setStatus('Nenhuma fala foi identificada. Tente novamente.')
            return
          }

          setCommandText(transcript)
          setStatus(`Comando reconhecido: “${transcript}”.`)
          void executeCommand(transcript, { clearInput: false })
        },

        onEnd: () => {
          setIsListening(false)
          recognitionRef.current = null
        },

        onError: (event) => {
          console.error('Erro no reconhecimento de voz:', event.error)
          setIsListening(false)
          setStatus(getRecognitionErrorMessage(event.error))
        }
      })

      recognitionRef.current = recognition
      recognition.start()
    } catch (error) {
      console.error('Erro ao iniciar reconhecimento de voz:', error)
      setIsListening(false)
      setStatus(error.message)
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

      <AccessibilitySettings
        preferences={preferences}
        onChange={handlePreferenceChange}
        onReset={handleResetPreferences}
      />

      <button
        className="analyze-button"
        type="button"
        onClick={handleAnalyze}
      >
        {analysis ? 'Analisar novamente' : 'Analisar página'}
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
        <section
          className="command-panel"
          aria-labelledby="command-panel-title"
        >
          <h2 id="command-panel-title">Comandos de navegação</h2>

          <p id="command-description">
            Digite uma ação para localizar elementos ou controlar a página.
          </p>

          <form className="command-form" onSubmit={handleCommandSubmit}>
            <label htmlFor="command-input">Comando</label>

            <div className="command-row">
              <input
                id="command-input"
                type="text"
                value={commandText}
                onChange={(event) => setCommandText(event.target.value)}
                placeholder="Ex.: título 2"
                aria-describedby="command-description"
                autoComplete="off"
              />

              <button type="submit">Executar</button>
            </div>
          </form>

          {isSpeechRecognitionSupported() ? (
            <button
              className={`voice-command-button${
                isListening ? ' is-listening' : ''
              }`}
              type="button"
              onClick={handleVoiceCommand}
              aria-pressed={isListening}
            >
              {isListening ? 'Parar escuta' : 'Falar comando'}
            </button>
          ) : (
            <p className="voice-unavailable" role="note">
              O reconhecimento de voz não está disponível neste navegador.
            </p>
          )}

          <details className="command-help">
            <summary>Ver comandos disponíveis</summary>
            <ul>
              <li>ler resumo ou parar leitura;</li>
              <li>
                próximo ou anterior: título, link, botão, campo e imagem;
              </li>
              <li>título, link, botão, campo ou imagem seguido do número;</li>
              <li>clicar botão 2 ou abrir link 3;</li>
              <li>
                rolar pra cima/baixo ou subir/descer página.
              </li>
            </ul>
          </details>
        </section>
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


          <div className="result-search">
            <label htmlFor="result-search-input">
              Pesquisar nos elementos encontrados
            </label>

            <div className="result-search-row">
              <input
                id="result-search-input"
                type="search"
                value={resultSearch}
                onChange={(event) => updateResultSearch(event.target.value)}
                placeholder="Ex.: pesquisar, enviar ou imagem"
                aria-describedby="result-search-status"
                autoComplete="off"
              />

              {resultSearch && (
                <button
                  type="button"
                  onClick={() => updateResultSearch('')}
                >
                  Limpar
                </button>
              )}
            </div>

            <p id="result-search-status" role="status">
              {resultSearch.trim()
                ? `${filteredResultCount} resultados correspondentes.`
                : 'Exibindo até 100 itens de cada categoria.'}
            </p>
          </div>

          <ResultSection
            id="heading-results"
            title="Títulos encontrados"
            items={filteredResults.heading}
            emptyMessage="Nenhum título corresponde à pesquisa."
            visibleCount={visibleResultCounts.heading}
            onShowMore={() => showMoreResults('heading')}
            renderItem={(heading) => (
              <button
                className="result-button"
                type="button"
                onClick={() => {
                  updateNavigationIndex(
                    'heading',
                    getOriginalItemIndex('heading', heading.id)
                  )
                  void handleHeadingClick(heading.id)
                }}
              >
                <strong>{heading.level.toUpperCase()}:</strong>{' '}
                {heading.text}
              </button>
            )}
          />

          <ResultSection
            id="link-results"
            title="Links encontrados"
            items={filteredResults.link}
            emptyMessage="Nenhum link corresponde à pesquisa."
            visibleCount={visibleResultCounts.link}
            onShowMore={() => showMoreResults('link')}
            renderItem={(link) => (
              <button
                className="result-button"
                type="button"
                title={link.text}
                aria-label={`Localizar link: ${link.text}`}
                onClick={() => {
                  updateNavigationIndex(
                    'link',
                    getOriginalItemIndex('link', link.id)
                  )
                  void handleLinkClick(link.id)
                }}
              >
                {truncateText(link.text)}
              </button>
            )}
          />

          <ResultSection
            id="button-results"
            title="Botões encontrados"
            items={filteredResults.button}
            emptyMessage="Nenhum botão corresponde à pesquisa."
            visibleCount={visibleResultCounts.button}
            onShowMore={() => showMoreResults('button')}
            renderItem={(button) => (
              <button
                className="result-button"
                type="button"
                title={button.text}
                aria-label={`Localizar botão: ${button.text}`}
                onClick={() => {
                  updateNavigationIndex(
                    'button',
                    getOriginalItemIndex('button', button.id)
                  )
                  void handleButtonClick(button.id)
                }}
              >
                {truncateText(button.text)}
              </button>
            )}
          />

          <ResultSection
            id="field-results"
            title="Campos encontrados"
            items={filteredResults.field}
            emptyMessage="Nenhum campo corresponde à pesquisa."
            visibleCount={visibleResultCounts.field}
            onShowMore={() => showMoreResults('field')}
            renderItem={(field) => {
              const fieldDetails = [
                field.type,
                field.required && 'obrigatório',
                field.disabled && 'desabilitado'
              ].filter(Boolean).join(' · ')

              return (
                <button
                  className="result-button"
                  type="button"
                  title={field.label}
                  aria-label={
                    `Localizar campo: ${field.label}. ${fieldDetails}`
                  }
                  onClick={() => {
                    updateNavigationIndex(
                      'field',
                      getOriginalItemIndex('field', field.id)
                    )
                    void handleFieldClick(field.id)
                  }}
                >
                  <strong>{truncateText(field.label)}</strong>
                  <span className="result-meta">{fieldDetails}</span>
                </button>
              )
            }}
          />

          <ResultSection
            id="image-results"
            title="Imagens encontradas"
            items={filteredResults.image}
            emptyMessage="Nenhuma imagem corresponde à pesquisa."
            visibleCount={visibleResultCounts.image}
            onShowMore={() => showMoreResults('image')}
            renderItem={(image) => {
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
                <button
                  className="result-button"
                  type="button"
                  title={image.description}
                  aria-label={
                    `Localizar imagem: ${image.description}. ${imageDetails}`
                  }
                  onClick={() => {
                    updateNavigationIndex(
                      'image',
                      getOriginalItemIndex('image', image.id)
                    )
                    void handleImageClick(image.id)
                  }}
                >
                  <strong>{truncateText(image.description)}</strong>
                  <span className="result-meta">{imageDetails}</span>
                </button>
              )
            }}
          />

        </section>
      )}
    </main>
  )
}

export default App

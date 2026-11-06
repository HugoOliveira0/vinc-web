const getSpeechRecognition = () => {
  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition
  )
}

export const isSpeechRecognitionSupported = () => {
  return Boolean(getSpeechRecognition())
}

export const requestMicrophonePermission = async () => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      'O acesso ao microfone não está disponível neste navegador.'
    )
  }

  const permission = await navigator.permissions.query({
    name: 'microphone'
  })

  if (permission.state === 'granted') {
    return true
  }

  await chrome.tabs.create({
    url: chrome.runtime.getURL('microphone-permission.html')
  })

  return false
}

export const createSpeechRecognition = ({
  onStart,
  onResult,
  onEnd,
  onError
} = {}) => {
  const SpeechRecognition = getSpeechRecognition()

  if (!SpeechRecognition) {
    throw new Error(
      'O reconhecimento de voz não é suportado neste navegador.'
    )
  }

  const recognition = new SpeechRecognition()

  recognition.lang = 'pt-BR'
  recognition.continuous = false
  recognition.interimResults = false
  recognition.maxAlternatives = 1

  recognition.onstart = () => {
    onStart?.()
  }

  recognition.onresult = (event) => {
    const transcript =
      event.results[0]?.[0]?.transcript?.trim() || ''

    onResult?.(transcript)
  }

  recognition.onend = () => {
    onEnd?.()
  }

  recognition.onerror = (event) => {
    onError?.(event)
  }

  return recognition
}

export const getRecognitionErrorMessage = (error) => {
  const errorMessages = {
    'not-allowed': 'A permissão para usar o microfone foi negada.',
    'service-not-allowed': 'O serviço de reconhecimento de voz foi bloqueado.',
    'audio-capture': 'Não foi possível acessar o microfone.',
    'no-speech': 'Nenhuma fala foi identificada. Tente novamente.',
    network: 'O serviço de reconhecimento de voz está indisponível.'
  }

  return (
    errorMessages[error] ||
    'Não foi possível reconhecer o comando de voz.'
  )
}

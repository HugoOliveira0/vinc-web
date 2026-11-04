const getPortugueseVoice = () => {
  const voices = window.speechSynthesis.getVoices()

  return (
    voices.find((voice) => voice.lang.toLowerCase() === 'pt-br') ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith('pt'))
  )
}

export const speakText = (
  text,
  {
    onStart,
    onEnd,
    onError
  } = {}
) => {
  if (
    !('speechSynthesis' in window) ||
    !('SpeechSynthesisUtterance' in window)
  ) {
    throw new Error('A síntese de voz não é suportada neste navegador.')
  }

  const normalizedText = text.trim()

  if (!normalizedText) {
    throw new Error('Não há texto para ser lido.')
  }

  // Interrompe uma leitura anterior antes de iniciar outra.
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(normalizedText)
  const portugueseVoice = getPortugueseVoice()

  utterance.lang = 'pt-BR'
  utterance.rate = 1
  utterance.pitch = 1
  utterance.volume = 1

  if (portugueseVoice) {
    utterance.voice = portugueseVoice
  }

  utterance.onstart = () => {
    onStart?.()
  }

  utterance.onend = () => {
    onEnd?.()
  }

  utterance.onerror = (event) => {
    if (
      event.error === 'canceled' ||
      event.error === 'interrupted'
    ) {
      return
    }

    onError?.(event)
  }

  window.speechSynthesis.speak(utterance)

  return utterance
}

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
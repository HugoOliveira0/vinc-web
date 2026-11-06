const allowButton = document.querySelector('#allow-microphone')
const settingsButton = document.querySelector('#open-settings')
const statusMessage = document.querySelector('#permission-status')

const showBlockedState = () => {
  statusMessage.textContent =
    'O microfone está bloqueado. Altere a permissão nas configurações.'

  settingsButton.hidden = false
}

const requestPermission = async () => {
  allowButton.disabled = true
  statusMessage.textContent = 'Aguardando autorização do microfone...'

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    stream.getTracks().forEach((track) => {
      track.stop()
    })

    statusMessage.textContent =
      'Microfone autorizado. Você já pode fechar esta aba.'

    window.setTimeout(() => {
      window.close()
    }, 1200)
  } catch (error) {
    console.error('Erro ao solicitar acesso ao microfone:', error)

    allowButton.disabled = false

    if (error.name === 'NotAllowedError') {
      showBlockedState()
      return
    }

    statusMessage.textContent =
      'Não foi possível acessar o microfone. Verifique o dispositivo.'
  }
}

const openMicrophoneSettings = () => {
  const extensionOrigin = chrome.runtime.getURL('')
  const settingsUrl =
    'chrome://settings/content/siteDetails?site=' +
    encodeURIComponent(extensionOrigin)

  chrome.tabs.create({ url: settingsUrl })
}

allowButton.addEventListener('click', requestPermission)
settingsButton.addEventListener('click', openMicrophoneSettings)

navigator.permissions.query({ name: 'microphone' }).then((permission) => {
  if (permission.state === 'granted') {
    statusMessage.textContent =
      'O microfone já está autorizado. Você pode fechar esta aba.'
  } else if (permission.state === 'denied') {
    showBlockedState()
  }
})

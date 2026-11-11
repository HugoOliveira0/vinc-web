const normalizeCommand = (text) => {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[.,!?;:]+/g, ' ')
    .replace(/\bpra\b/g, 'para')
    .replace(/\bpro\b/g, 'para o')
    .replace(/\bpras\b/g, 'para as')
    .replace(/\bpros\b/g, 'para os')
    .trim()
    .replace(/\s+/g, ' ')
}

const elementTypes = {
  titulo: 'heading',
  titulos: 'heading',
  link: 'link',
  links: 'link',
  botao: 'button',
  botoes: 'button',
  campo: 'field',
  campos: 'field',
  imagem: 'image',
  imagens: 'image'
}

const elementPattern =
  '(titulo|titulos|link|links|botao|botoes|campo|campos|imagem|imagens)'

const numberWords = {
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  onze: 11,
  doze: 12,
  treze: 13,
  quatorze: 14,
  catorze: 14,
  quinze: 15,
  dezesseis: 16,
  dezessete: 17,
  dezoito: 18,
  dezenove: 19,
  vinte: 20
}

const positionPattern = `(\\d+|${Object.keys(numberWords).join('|')})`

const parsePosition = (positionText) => {
  return numberWords[positionText] || Number(positionText)
}

export const parseCommand = (commandText) => {
  const command = normalizeCommand(commandText)

  if (!command) {
    return { type: 'empty' }
  }

  if (
    command === 'ler resumo' ||
    command === 'ouvir resumo' ||
    command === 'leia o resumo' ||
    command === 'ler o resumo' ||
    command === 'le o resumo'
  ) {
    return { type: 'read-summary' }
  }

  if (
    command === 'parar leitura' ||
    command === 'parar de ler' ||
    command === 'pare a leitura' ||
    command === 'pare de ler' ||
    command === 'para de ler'
  ) {
    return { type: 'stop-reading' }
  }

  const navigationMatch = command.match(
    new RegExp(
      `^(?:(?:ir|va|vai|voltar|volte|volta) para ` +
      `(?:(?:o|a) )?|mostrar )?` +
      `(?:(proximo|proxima|anterior) ${elementPattern}|` +
      `${elementPattern} (seguinte|anterior))$`
    )
  )

  if (navigationMatch) {
    const directionText = navigationMatch[1] || navigationMatch[4]
    const elementName = navigationMatch[2] || navigationMatch[3]

    return {
      type: 'navigate-element',
      direction: directionText === 'anterior' ? 'previous' : 'next',
      elementType: elementTypes[elementName]
    }
  }

  if (
    /^(?:rolar|role|rola)(?: a pagina)? para baixo$/.test(command) ||
    /^(?:descer|desca|desce)(?: a)? pagina$/.test(command) ||
    ['pagina para baixo', 'ir para baixo', 'descer'].includes(command)
  ) {
    return { type: 'scroll', direction: 'down' }
  }

  if (
    /^(?:rolar|role|rola)(?: a pagina)? para cima$/.test(command) ||
    /^(?:subir|suba|sobe)(?: a)? pagina$/.test(command) ||
    ['pagina para cima', 'ir para cima', 'subir'].includes(command)
  ) {
    return { type: 'scroll', direction: 'up' }
  }

  const activationMatch = command.match(
    new RegExp(
      `^(?:clicar|clique|clica|pressionar|pressione|apertar|aperte|` +
      `ativar|ative|acionar|acione|abrir|abra|acessar|acesse) ` +
      `(?:(?:no|na|o|a) )?${elementPattern} ${positionPattern}$`
    )
  )

  if (activationMatch) {
    const [, elementName, positionText] = activationMatch
    const elementType = elementTypes[elementName]

    if (elementType === 'link' || elementType === 'button') {
      return {
        type: 'activate-element',
        elementType,
        position: parsePosition(positionText)
      }
    }
  }

  const elementMatch = command.match(
    new RegExp(
      `^(?:(?:ir|va|vai|me leve|me leva|localizar|mostrar) ` +
      `(?:para )?(?:(?:o|a) )?)?${elementPattern} ${positionPattern}$`
    )
  )

  if (elementMatch) {
    const [, elementName, positionText] = elementMatch

    return {
      type: 'locate-element',
      elementType: elementTypes[elementName],
      position: parsePosition(positionText)
    }
  }

  if (
    command === 'ajuda' ||
    command === 'mostrar comandos' ||
    command === 'listar comandos' ||
    command === 'ver comandos' ||
    command === 'ver comandos disponiveis'
  ) {
    return { type: 'help' }
  }

  return {
    type: 'unknown',
    originalText: commandText.trim()
  }
}

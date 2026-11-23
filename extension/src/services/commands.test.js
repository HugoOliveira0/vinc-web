import { describe, expect, it } from 'vitest'
import { parseCommand } from './commands'

describe('parseCommand', () => {
  it('identifica comandos vazios e desconhecidos', () => {
    expect(parseCommand('   ')).toEqual({ type: 'empty' })
    expect(parseCommand('faça uma coisa qualquer')).toEqual({
      type: 'unknown',
      originalText: 'faça uma coisa qualquer'
    })
  })

  it('interpreta leitura e interrupção do resumo', () => {
    expect(parseCommand('Leia o resumo!')).toEqual({
      type: 'read-summary'
    })
    expect(parseCommand('pare de ler')).toEqual({
      type: 'stop-reading'
    })
  })

  it('normaliza acentos, pontuação e contrações', () => {
    expect(parseCommand('Rolar pra baixo.')).toEqual({
      type: 'scroll',
      direction: 'down'
    })
    expect(parseCommand('role a página para cima')).toEqual({
      type: 'scroll',
      direction: 'up'
    })
  })

  it('interpreta navegação sequencial entre categorias', () => {
    expect(parseCommand('próximo título')).toEqual({
      type: 'navigate-element',
      direction: 'next',
      elementType: 'heading'
    })
    expect(parseCommand('imagem anterior')).toEqual({
      type: 'navigate-element',
      direction: 'previous',
      elementType: 'image'
    })
  })

  it('localiza elementos por algarismo ou número por extenso', () => {
    expect(parseCommand('botão três')).toEqual({
      type: 'locate-element',
      elementType: 'button',
      position: 3
    })
    expect(parseCommand('me leve para o campo 12')).toEqual({
      type: 'locate-element',
      elementType: 'field',
      position: 12
    })
  })

  it('reconhece ativação apenas para links e botões', () => {
    expect(parseCommand('clique no link 2')).toEqual({
      type: 'activate-element',
      elementType: 'link',
      position: 2
    })
    expect(parseCommand('aperte o botão quatro')).toEqual({
      type: 'activate-element',
      elementType: 'button',
      position: 4
    })
    expect(parseCommand('clicar imagem 1').type).toBe('unknown')
  })

  it('preserva o texto original ao preencher um campo', () => {
    expect(
      parseCommand('Preencha o campo dois com Hugo da Silva')
    ).toEqual({
      type: 'fill-field',
      position: 2,
      value: 'Hugo da Silva'
    })
    expect(
      parseCommand('Digite E-mail@Teste.com no campo 3')
    ).toEqual({
      type: 'fill-field',
      position: 3,
      value: 'E-mail@Teste.com'
    })
  })

  it('interpreta limpeza de campo e solicitação de ajuda', () => {
    expect(parseCommand('limpe o campo um')).toEqual({
      type: 'clear-field',
      position: 1
    })
    expect(parseCommand('ver comandos disponíveis')).toEqual({
      type: 'help'
    })
  })
})

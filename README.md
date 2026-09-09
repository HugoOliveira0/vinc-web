# V.INC Web

O V.INC Web é uma solução de acessibilidade digital composta por uma extensão de navegador e uma plataforma web. O projeto está sendo desenvolvido como Trabalho de Conclusão de Curso do curso Técnico em Informática para Internet da Etec Pedro Ferreira Alves.

## Objetivo

O projeto tem como objetivo auxiliar a compreensão e a navegação em páginas da internet por meio da análise de sua estrutura semântica.

A extensão deverá identificar elementos como títulos, links, botões, formulários e imagens, permitindo que o usuário consulte e execute ações por comandos de texto, voz ou teclado.

Entre os exemplos de interação previstos estão:

- listar os títulos da página;
- localizar links e botões;
- navegar até uma seção;
- rolar a página;
- ler conteúdos em voz alta;
- explicar o contexto de elementos com nomes repetidos;
- aplicar ajustes visuais;
- solicitar a descrição de imagens.

## Diferencial

O V.INC Web não pretende substituir leitores de tela ou outras tecnologias assistivas. Sua proposta é funcionar como uma camada complementar de navegação, reunindo análise semântica, comandos multimodais e explicações contextuais em português brasileiro.

Um exemplo de uso será a possibilidade de perguntar:

> Qual é o contexto do segundo botão “Continuar”?

A extensão deverá analisar informações próximas ao elemento, como títulos, formulários, regiões e textos relacionados, para apresentar uma resposta contextualizada.

## Componentes

O projeto será dividido em dois componentes principais:

### Extensão de navegador

Responsável por analisar a página atual, construir um mapa semântico de seus elementos e permitir a navegação por texto, voz e teclado.

### Plataforma web

Responsável pela autenticação, documentação de uso, sincronização de preferências e histórico opcional.

## Relação com o V.INC – Voz Inclusiva

O V.INC Web é um desdobramento do V.INC – Voz Inclusiva, aplicação desktop desenvolvida como TCC do curso Técnico em Desenvolvimento de Sistemas.

Link do TCC V.Inc - Voz Inclusiva: https://github.com/nicolasrocha0809-png/v-inc-tcc

Os projetos compartilham a identidade e o compromisso com a acessibilidade, mas possuem códigos-fonte, arquiteturas, objetivos, documentações e testes próprios.

O V.INC – Voz Inclusiva atua sobre recursos do computador, enquanto o V.INC Web será direcionado à interpretação e à navegação de páginas da internet. O funcionamento do V.INC Web não dependerá da execução ou da modificação da aplicação original.

## Tecnologias previstas

- React;
- Vite;
- JavaScript;
- HTML e CSS;
- Chrome Extension Manifest V3;
- Web Speech API;
- APIs de extensões do navegador;
- Supabase.

As tecnologias poderão ser ajustadas durante o desenvolvimento conforme as necessidades identificadas.

## Situação do projeto

O projeto encontra-se em fase inicial de desenvolvimento.

A primeira versão terá como objetivo:

1. executar como extensão em navegadores baseados em Chromium;
2. analisar a página aberta;
3. identificar seus principais elementos;
4. apresentar os elementos em um painel lateral;
5. permitir que o usuário localize e selecione um elemento.

## Autores

- Hugo Oliveira da Silva
- Eloá Khadijah Silva Amâncio de Souza

## Instituição

Etec Pedro Ferreira Alves — Mogi Mirim, SP.

Curso Técnico em Informática para Internet.
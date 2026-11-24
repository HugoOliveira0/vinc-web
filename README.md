# V.Inc Web

O V.Inc Web é uma solução complementar de acessibilidade digital composta
por uma extensão para navegadores Chromium e uma plataforma web de apresentação
e documentação. O projeto é desenvolvido como Trabalho de Conclusão de Curso
do curso Técnico em Informática para Internet da Etec Pedro Ferreira Alves.

## Estado atual

A extensão já oferece:

- análise automática da aba ativa permitida;
- organização de títulos, links, botões, campos e imagens visíveis;
- pesquisa e apresentação progressiva dos resultados;
- localização por rolagem, foco e destaque de contraste adaptativo;
- acionamento de links e botões e preenchimento seguro de campos;
- comandos equivalentes por texto ou voz;
- leitura por síntese de voz;
- preferências locais de tema, escala de texto e redução de movimento;
- triagem local de barreiras comuns de acessibilidade;
- resumo e perguntas contextuais por inteligência artificial, mediante ação
  explícita do usuário;
- cache temporário de resumos e respostas por página.

A plataforma web apresenta o produto, seus recursos, comandos e instruções de
instalação. Ela também oferece autenticação opcional e permite consultar ou
salvar, mediante ação explícita, as mesmas preferências que a extensão pode
recuperar. A descrição visual multimodal de imagens permanece como evolução
futura.

## Princípios

O V.Inc Web não substitui leitores de tela nem declara que uma página é
acessível. Ele oferece outra forma de consultar a estrutura e acionar elementos,
preservando HTML semântico, foco previsível e mensagens de estado para favorecer
a interoperabilidade com tecnologias assistivas.

A análise estrutural ocorre localmente. O texto visível da página somente é
enviado ao serviço opcional de inteligência artificial quando o usuário solicita
um resumo ou uma resposta. Valores de formulários não são coletados.

## Estrutura do repositório

- `extension`: painel lateral da extensão Manifest V3;
- `platform`: plataforma web acessível de apresentação e documentação;
- `supabase`: função de borda que protege a credencial do provedor de IA.

## Executar a extensão

```bash
cd extension
npm install
npm run lint
npm test
npm run build
```

Depois, abra `chrome://extensions`, ative o modo do desenvolvedor e carregue a
pasta `extension/dist` com a opção **Carregar sem compactação**.

Para habilitar a IA, consulte [`extension/README.md`](extension/README.md) e
[`supabase/README.md`](supabase/README.md).

## Executar a plataforma

```bash
cd platform
npm install
npm run lint
npm run build
npm run dev
```

Para habilitar a conta na plataforma, copie `platform/.env.example` para
`platform/.env` e informe a URL e a chave pública do mesmo projeto Supabase
utilizado pela extensão. A plataforma continua acessível sem autenticação.

## Qualidade

A extensão possui testes automatizados com Vitest para comandos, filtros,
auditoria de acessibilidade, catálogo da IA e cache temporário. O fluxo de
integração contínua executa lint, testes e builds a cada push ou pull request.

## Relação com o V.Inc – Voz Inclusiva

O V.Inc Web é um produto independente inspirado no V.Inc – Voz Inclusiva,
aplicação desktop desenvolvida anteriormente. Os projetos compartilham a
identidade e o compromisso com acessibilidade, mas possuem código-fonte,
arquitetura, documentação e testes próprios.

## Autores

- Hugo Oliveira da Silva
- Eloá Khadijah Silva Amâncio de Souza

Etec Pedro Ferreira Alves — Mogi Mirim, SP.

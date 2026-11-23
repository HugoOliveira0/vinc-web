# Extensão V.Inc Web

Extensão para navegadores Chromium construída com React, Vite e Manifest V3.
Ela analisa elementos visíveis da aba ativa, oferece navegação assistida, gera
um resumo contextual e responde perguntas sobre a página com inteligência
artificial.

## Desenvolvimento

```bash
npm install
npm run dev
```

Para gerar a versão carregada pelo navegador:

```bash
npm run lint
npm test
npm run build
```

Os testes automatizados cobrem comandos, filtros, auditoria local, catálogo de
elementos enviado à IA e cache temporário.

Depois, abra `chrome://extensions`, ative o modo do desenvolvedor e carregue a
pasta `extension/dist` como extensão sem compactação.

## Auditoria de acessibilidade

A extensão realiza uma triagem local da página e verifica título do documento,
idioma, presença e hierarquia de H1 a H6, nomes acessíveis de links e botões,
rótulos de campos e alternativas textuais de imagens. Os problemas associados
a elementos visíveis podem ser selecionados para localização e destaque.

A triagem é um apoio automatizado e não representa certificação de conformidade
com as WCAG nem substitui testes manuais com tecnologias assistivas.

## Resumo com IA

A análise estrutural permanece local. O conteúdo textual da página só é enviado
quando o usuário solicita um resumo ou faz uma pergunta à IA. Campos de
formulário e seus valores não são coletados.

Resumos e respostas são mantidos temporariamente em
`chrome.storage.session` por até 30 minutos. O cache armazena somente os
resultados e os índices validados, nunca o texto completo coletado da página.

As perguntas podem ser digitadas ou ditadas. Quando a resposta cita um título,
link, botão, campo ou imagem, a referência usa o mesmo índice da análise e pode
ser selecionada para localizar o elemento na página.

1. Copie `.env.example` para `.env`.
2. Informe a URL da função implantada no Supabase.
3. Informe a chave pública do projeto Supabase.
4. Execute novamente `npm run build`.

```env
VITE_AI_API_URL=https://SEU-PROJETO.supabase.co/functions/v1/summarize-page
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE_PUBLICA
```

A chave secreta da Groq deve existir somente no Supabase, nunca neste arquivo.
O código da função está em `../supabase/functions/summarize-page`.

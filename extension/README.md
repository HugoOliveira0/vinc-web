# Extensão V.Inc Web

Extensão para navegadores Chromium construída com React, Vite e Manifest V3.
Ela analisa elementos visíveis da aba ativa, oferece navegação assistida e pode
gerar um resumo contextual com inteligência artificial.

## Desenvolvimento

```bash
npm install
npm run dev
```

Para gerar a versão carregada pelo navegador:

```bash
npm run lint
npm run build
```

Depois, abra `chrome://extensions`, ative o modo do desenvolvedor e carregue a
pasta `extension/dist` como extensão sem compactação.

## Resumo com IA

A análise estrutural permanece local. O conteúdo textual da página só é enviado
quando o usuário seleciona **Gerar resumo com IA**. Campos de formulário e seus
valores não são coletados.

Os resumos são mantidos temporariamente em `chrome.storage.session` por até 30
minutos. O cache armazena somente o resultado e os índices validados, nunca o
texto completo coletado da página.

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

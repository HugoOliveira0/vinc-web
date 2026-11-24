# Plataforma V.Inc Web

Site acessível de apresentação, documentação e conta opcional do V.Inc Web.

## Desenvolvimento

```bash
npm install
npm run lint
npm run build
```

## Conta e preferências

Copie `.env.example` para `.env` e informe a URL e a chave pública do mesmo
projeto Supabase utilizado pela extensão:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_SUA_CHAVE_PUBLICA
```

A plataforma permite criar uma conta, entrar e alterar tema, escala de texto e
redução de movimento. Esses dados são gravados somente quando o usuário
seleciona o botão de salvar. A tabela `user_preferences` usa Row Level Security,
de modo que cada conta acessa somente o próprio registro.

# Serviço de IA do V.Inc Web

A Edge Function `summarize-page` protege a chave da Groq e valida os índices
dos elementos escolhidos pela IA antes de responder à extensão.

## Implantação

Com um projeto Supabase criado e a CLI autenticada:

```bash
supabase link --project-ref SEU_PROJECT_REF
supabase secrets set GROQ_API_KEY=SUA_CHAVE_GROQ
supabase functions deploy summarize-page
```

O modelo padrão é `openai/gpt-oss-20b`. Para substituí-lo sem alterar o
código:

```bash
supabase secrets set GROQ_MODEL=ID_DO_MODELO
```

Após a implantação, configure `extension/.env` com a URL da função e a chave
pública do projeto. Nunca envie `GROQ_API_KEY` ao Git ou à extensão.

# CLAUDE.md — tea-form-api

## O que é

API REST que recebe e persiste submissões do formulário **CARS** (Childhood Autism
Rating Scale) para avaliação de TEA, enviadas pelo app mobile TEA Form App. Calcula o
`totalScore`, gera um laudo psicológico via DeepSeek e o converte em PDF (pdfkit),
retornado em base64. Documentação detalhada (endpoints, regras de negócio): `DOCS.md`.

## Stack e gerenciador

- **Bun** (runtime e gerenciador — `bun.lock`). **Nunca usar npm/yarn/pnpm.**
- Fastify 5 + @fastify/cors, Zod 4, Prisma 6, PostgreSQL 16 (docker-compose), pdfkit.
- TypeScript ESM (`"type": "module"`).

## Comandos

```bash
bun install                # dependências
docker compose up -d       # PostgreSQL (container tea-form-postgres, porta 5432)
bunx prisma migrate dev    # criar/aplicar migrations
bunx prisma generate       # gerar Prisma Client
bun dev                    # servidor com watch (porta 3000)
bun run build              # bundle para dist/index.js
bunx prisma studio         # UI do banco (porta 5555)
```

## Convenções deste repo

- Estrutura `src/`: `routes/` (endpoints) → `controllers/` (validação Zod + resposta) →
  `services/` (DeepSeek, análise CARS, PDF) / `utils/` (funções puras) / `schemas/`
  (Zod + tipos inferidos) / `lib/` (instância do Prisma).
- Arquivos em kebab-case com sufixo do papel: `cars-form.controller.ts`,
  `pdf-generator.service.ts`.
- Sempre validar body com Zod antes de processar; `ZodError` → 400 com `issues`.
- Imports só de tipos com `import type`.
- Schema Prisma: modelo único `CARSFormSubmission` (`@@map("cars_form_submissions")`),
  15 domínios como pares `<domínio>Score: Float` + `<domínio>Observations: String?`.
  Mudança de schema → sempre via `bunx prisma migrate dev --name <descricao>`.

## Cuidados

- `.env` (não commitado): `DATABASE_URL` (Postgres local) e `DEEPSEEK_API_KEY`.
  Sem a key, a API pula o laudo/PDF com warning — não é erro fatal.
- Geração de PDF consome stream do pdfkit para Buffer; falha no laudo ou no PDF não
  pode derrubar o POST — o form já foi persistido (try/catch por etapa, só loga).
- Scores CARS: 1–4 em incrementos de 0.5; `totalScore` é calculado no servidor,
  nunca aceito do cliente.
- Não subir containers nem rodar migrations sem o usuário pedir.

# TEA Form API — Documentação Técnica

## Visão Geral

API REST desenvolvida para receber e armazenar submissões do formulário CARS
(Childhood Autism Rating Scale) provenientes do aplicativo mobile **TEA Form App**.
A API valida, processa e persiste as avaliações realizadas por profissionais da
saúde, calcula o `totalScore`, gera um laudo psicológico via DeepSeek e o converte
em PDF.

## Stack Tecnológica

- **Runtime / gerenciador**: Bun
- **Framework**: Fastify 5 (+ @fastify/cors)
- **Validação**: Zod 4
- **ORM**: Prisma 6
- **Banco de Dados**: PostgreSQL 16 (Docker Compose)
- **IA**: DeepSeek (`deepseek-chat`) para geração do laudo
- **PDF**: pdfkit

## Regras de Negócio

### CARS (Childhood Autism Rating Scale)

O formulário CARS avalia 15 domínios comportamentais, cada um com:

- **Score**: valor de 1 a 4 com incrementos de 0.5
- **Observations**: campo opcional para observações do profissional (padrão `""`)

#### Domínios avaliados

1. Relações Pessoais (Personal Relationships)
2. Imitação (Imitation)
3. Resposta Emocional (Emotional Response)
4. Uso Corporal (Body Use)
5. Uso de Objetos (Object Use)
6. Resposta a Mudanças (Response to Change)
7. Resposta Visual (Visual Response)
8. Resposta Auditiva (Auditory Response)
9. Paladar, Olfato e Tato (Taste, Smell & Touch)
10. Medo ou Nervosismo (Fear or Nervousness)
11. Comunicação Verbal (Verbal Communication)
12. Comunicação Não-Verbal (Non-Verbal Communication)
13. Nível de Atividade (Activity Level)
14. Resposta Intelectual (Intellectual Response)
15. Impressões Gerais (General Impressions)

### Cálculo automático

A API calcula o **totalScore** somando os 15 scores individuais:

- **15 a 29.5 pontos**: sem autismo
- **30 a 36.5 pontos**: autismo leve a moderado
- **37 a 60 pontos**: autismo grave

### Laudo e PDF

No `POST /cars-forms`, após persistir a submissão:

1. `CARSAnalysisService` monta a análise e o `DeepSeekService` gera o laudo
   psicológico (requer `DEEPSEEK_API_KEY`; sem a key, a etapa é pulada com warning).
2. `PDFGeneratorService` (pdfkit) converte o laudo em PDF, retornado no campo
   `pdfReport` (base64) da resposta.
3. Falhas no laudo ou no PDF são logadas e não derrubam a request — o form já foi
   persistido.

## Arquitetura

```
tea-form-api/
├── prisma/
│   ├── migrations/          # Histórico de migrations
│   └── schema.prisma        # Schema do banco de dados
├── src/
│   ├── controllers/cars-form.controller.ts   # Lógica de negócio
│   ├── routes/cars-form.routes.ts            # Definição de rotas
│   ├── schemas/cars-form.schema.ts           # Validação com Zod
│   ├── services/
│   │   ├── cars-analysis.service.ts          # Análise CARS p/ o laudo
│   │   ├── deepseek.service.ts               # Cliente DeepSeek
│   │   └── pdf-generator.service.ts          # Geração de PDF (pdfkit)
│   ├── utils/cars-form.utils.ts              # Funções auxiliares
│   ├── lib/prisma.ts                         # Cliente Prisma
│   └── index.ts                              # Servidor Fastify (porta 3000)
├── docker-compose.yml       # PostgreSQL 16
└── .env                     # Variáveis de ambiente (não commitado)
```

### Separação de responsabilidades

1. **Routes** (`src/routes/`): registra endpoints e mapeia para controllers.
2. **Controllers** (`src/controllers/`): valida com Zod, orquestra services/utils,
   formata responses.
3. **Schemas** (`src/schemas/`): schemas Zod + tipos TypeScript inferidos.
4. **Services** (`src/services/`): integrações externas e processos (IA, PDF).
5. **Utils** (`src/utils/`): funções puras (cálculos, mapeamentos).
6. **Lib** (`src/lib/`): instâncias compartilhadas (Prisma Client).

### Convenções de código

- **Imports**: usar `import type` para imports apenas de tipos
- **Async/await** em vez de Promises encadeadas
- **Error handling**: try/catch com logs estruturados (Fastify logger);
  `ZodError` → 400 com `issues`
- **Nomenclatura**: funções/constantes em camelCase, tipos em PascalCase,
  arquivos em kebab-case com sufixo do papel (`*.controller.ts`, `*.service.ts`)

## API Endpoints

### POST /cars-forms

Cria uma nova submissão do formulário CARS.

**Request body**: os 15 domínios, cada um `{ "score": number, "observations": string }`.

**Response 201:**

```json
{
  "id": "uuid-v4",
  "totalScore": 31.5,
  "createdAt": "2025-10-06T18:00:00.000Z",
  "pdfReport": "<base64 do PDF, quando gerado>"
}
```

**Response 400** (validação): `{ "error": "Validation error", "issues": [...] }`

### GET /cars-forms

Lista todas as submissões ordenadas por data de criação (mais recentes primeiro).

### GET /cars-forms/:id

Busca uma submissão por ID. **404**: `{ "error": "CARS form not found" }`.

## Banco de Dados

Modelo único `CARSFormSubmission` (`@@map("cars_form_submissions")`), com `id` UUID,
15 pares `<domínio>Score Float` + `<domínio>Observations String?`, `totalScore Float`,
`createdAt` e `updatedAt`.

### Migrations

```bash
bunx prisma migrate dev --name description   # criar e aplicar
bunx prisma migrate deploy                   # aplicar pendentes (produção)
bunx prisma migrate status                   # verificar status
bunx prisma generate                         # gerar Prisma Client
```

## Desenvolvimento

### Requisitos

- Bun >= 1.2
- Docker (para o PostgreSQL)

### Setup

```bash
bun install               # dependências
docker compose up -d      # PostgreSQL
bunx prisma migrate dev   # migrations
bunx prisma generate      # Prisma Client
bun dev                   # servidor (porta 3000)
```

### Variáveis de ambiente (`.env`)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/teaform?schema=public"
DEEPSEEK_API_KEY="..."   # opcional; sem ela o laudo/PDF é pulado
```

## Segurança e Observabilidade

- Validação rigorosa com Zod em todos os inputs
- CORS habilitado para o frontend mobile
- Logs estruturados via Fastify logger; erros internos não são expostos
- Healthcheck do PostgreSQL no Docker Compose
- Prisma Studio para inspeção dos dados: `bunx prisma studio` (porta 5555)

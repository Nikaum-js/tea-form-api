# Tea Form API

API REST construída com Bun, Prisma, Zod e PostgreSQL.

## Pré-requisitos

- [Bun](https://bun.sh) instalado
- [Docker](https://www.docker.com/) instalado (para o PostgreSQL)

## Configuração

1. **Instale as dependências:**
   ```bash
   bun install
   ```

2. **Inicie o banco de dados PostgreSQL com Docker:**
   ```bash
   docker compose up -d
   ```

3. **Execute as migrations:**
   ```bash
   bunx prisma migrate dev
   ```

4. **Gere o Prisma Client:**
   ```bash
   bunx prisma generate
   ```

## Executar o servidor

```bash
bun --hot src/index.ts
```

O servidor estará disponível em `http://localhost:3000`.

## Endpoints

### POST /posts
Cria um novo post.

**Body:**
```json
{
  "title": "Meu primeiro post",
  "content": "Conteúdo do post",
  "published": false
}
```

**Resposta (201):**
```json
{
  "id": "clxxx...",
  "title": "Meu primeiro post",
  "content": "Conteúdo do post",
  "published": false,
  "createdAt": "2025-10-06T...",
  "updatedAt": "2025-10-06T..."
}
```

### GET /posts
Lista todos os posts.

### GET /posts/:id
Busca um post específico por ID.

## Estrutura do Projeto

```
tea-form-api/
├── prisma/
│   ├── schema.prisma       # Schema do Prisma
│   └── migrations/         # Migrations do banco de dados
├── src/
│   └── index.ts           # Servidor principal
├── docker-compose.yml     # Configuração do Docker
└── .env                   # Variáveis de ambiente
```

## Tecnologias

- **Bun**: Runtime JavaScript/TypeScript
- **Prisma**: ORM
- **Zod**: Validação de schemas
- **PostgreSQL**: Banco de dados
- **Docker**: Containerização

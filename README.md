# edu-api

Backend NestJS + Prisma + **MySQL** para o dashboard de pagamentos.

## Rodando com Docker (recomendado)

Tudo (front + API + MySQL) sobe a partir da raiz do repositório:

```bash
docker compose up -d --build
```

Veja o [README da raiz](../README.md) para detalhes.

## Setup nativo (sem Docker)

Requer um MySQL acessível. O `docker compose` já expõe um em `localhost:3307`
(usuário `edu` / senha `edu` / banco `edu`); aponte o `DATABASE_URL` do `.env`
para essa porta. Depois:

```bash
npm install
npx prisma generate
npx prisma db push     # cria as tabelas a partir dos models
npm run start:dev      # a aplicação cria o admin padrão no bootstrap
```

A API sobe em `http://localhost:3001` (porta definida por `PORT` no `.env`).

### Migrations

O fluxo padrão aqui é `prisma db push` (sincroniza o schema direto, sem arquivos
de migration). Se quiser histórico de migrations versionado, rode
`npx prisma migrate dev --name init` apontando para o MySQL — o Prisma gera a
pasta `prisma/migrations` já no provider `mysql`.

## Variáveis de ambiente (`.env`)

| Variável | Exemplo | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | `mysql://edu:edu@localhost:3306/edu` | Conexão MySQL |
| `PORT` | `3001` | Porta da API |
| `JWT_SECRET` | `...` | Segredo do JWT |
| `JWT_EXPIRES_IN` | `7d` | Validade do token |
| `CORS_ORIGIN` | `http://localhost:5174` | Origens permitidas (separadas por vírgula) |
| `OWNER_EMAIL` / `OWNER_PASSWORD` / `OWNER_NOME` | — | Admin padrão criado no bootstrap |

## Endpoints principais

- `POST /auth/login` → `{ token, user }`
- `GET /auth/me` (JWT)
- `GET /users` / `POST /users` (owner only)
- `GET /payments` / `POST /payments` (gera parcelas server-side)
- `GET /installments?status=pendente|pago|vencido`
- `PATCH /installments/:id/status` — `{"status":"pago"}` gera Commission
- `GET /commissions[?userId=...]`
- `GET /dashboard/stats`

## Deploy no Railway

A API de produção roda em `edu-api-production-2e4a.up.railway.app`. O build e o
deploy são controlados pelo [`railway.json`](railway.json):

- **`build.builder: DOCKERFILE`** — usa o mesmo `Dockerfile` do projeto (Prisma,
  schema e build já prontos na imagem).
- **`deploy.preDeployCommand: npx prisma db push`** — *release command*: cria/atualiza
  as tabelas no MySQL **antes** de cada deploy entrar no ar.
- **`deploy.startCommand: node dist/main.js`** — sobe a API. O **admin padrão** é
  criado pela própria aplicação no bootstrap ([SeedService](src/bootstrap/seed.service.ts)).

Ou seja, a cada deploy as tabelas são garantidas e o admin é criado automaticamente.

### Pré-requisitos no painel do Railway

Na aba *Variables* do serviço, configure:

- `DATABASE_URL` → MySQL do Railway. Adicione o plugin **MySQL** e referencie a
  connection string dele (ex.: `${{ MySQL.MYSQL_URL }}`).
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `CORS_ORIGIN` → URL do front de produção.
- `OWNER_EMAIL` / `OWNER_PASSWORD` / `OWNER_NOME` → credenciais do admin padrão.

> O `preDeployCommand` usa `prisma db push` **sem** `--accept-data-loss`: criação de
> tabelas e mudanças aditivas passam automaticamente; uma mudança **destrutiva** falha
> o deploy de propósito, para não apagar dados em produção. Quando o banco tiver dados
> reais, considere migrar para migrations versionadas (`prisma migrate deploy`).

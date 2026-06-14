# edu-api

Backend NestJS + Prisma + **MySQL** para o dashboard de pagamentos.

## Rodando com Docker (recomendado)

Tudo (front + API + MySQL) sobe a partir da raiz do repositório:

```bash
docker compose up -d --build
```

Veja o [README da raiz](../README.md) para detalhes.

## Setup nativo (sem Docker)

Requer um MySQL acessível. O `docker compose` já expõe um em `localhost:3306`
(usuário `edu` / senha `edu` / banco `edu`), então basta subir o MySQL e rodar:

```bash
npm install
npx prisma generate
npx prisma db push     # cria/atualiza as tabelas a partir do schema
npm run seed           # cria owner@edu.com / owner123
npm run start:dev
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
| `OWNER_EMAIL` / `OWNER_PASSWORD` / `OWNER_NOME` | — | Owner criado pelo seed |

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

A API de produção roda em `edu-api-production-2e4a.up.railway.app`. No Railway,
configure as variáveis acima — em especial `DATABASE_URL` apontando para um MySQL
(plugin MySQL do Railway) e `CORS_ORIGIN` com a URL do front de produção. O start
de produção é `npm run start:prod` (`node dist/main`).

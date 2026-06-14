# edu-api

Backend NestJS + Prisma + SQLite para o dashboard de pagamentos.

## Setup

```bash
npm install
npx prisma migrate dev --name init
npm run seed    # cria owner@edu.com / owner123
npm run start:dev
```

API sobe em `http://localhost:3000`.

## Endpoints principais

- `POST /auth/login` → `{ token, user }`
- `GET /auth/me` (JWT)
- `GET /users` / `POST /users` (owner only)
- `GET /payments` / `POST /payments` (gera parcelas server-side)
- `GET /installments?status=pendente|pago|vencido`
- `PATCH /installments/:id/status` — `{"status":"pago"}` gera Commission
- `GET /commissions[?userId=...]`
- `GET /dashboard/stats`

## Trocar SQLite por Postgres

1. Em `prisma/schema.prisma`, mude `provider = "sqlite"` para `"postgresql"`.
2. Atualize `DATABASE_URL` no `.env`.
3. Rode `npx prisma migrate dev`.

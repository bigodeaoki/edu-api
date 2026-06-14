# edu-api — NestJS + Prisma (MySQL)
FROM node:20-slim

WORKDIR /app

# openssl: exigido pela engine do Prisma em runtime.
# build-essential/python3: fallback para compilar bcrypt caso não haja prebuilt.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

# Gera o Prisma Client para a engine do container e compila o Nest.
RUN npx prisma generate && npm run build

# Normaliza fim de linha do entrypoint (evita erro de CRLF vindo do Windows).
RUN sed -i 's/\r$//' docker-entrypoint.sh

EXPOSE 3001

CMD ["sh", "docker-entrypoint.sh"]

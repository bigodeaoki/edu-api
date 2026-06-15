#!/bin/sh
set -e

echo "→ Sincronizando schema com o MySQL (prisma db push)..."
n=0
until npx prisma db push --skip-generate --accept-data-loss; do
  n=$((n + 1))
  if [ "$n" -ge 15 ]; then
    echo "✗ MySQL não respondeu a tempo. Abortando."
    exit 1
  fi
  echo "  MySQL ainda não está pronto — nova tentativa em 3s ($n/15)..."
  sleep 3
done

# O usuário admin padrão é criado pela própria aplicação no bootstrap
# (SeedService / OnApplicationBootstrap), em qualquer ambiente.
echo "→ Iniciando edu-api na porta ${PORT:-3001}..."
exec node dist/main.js

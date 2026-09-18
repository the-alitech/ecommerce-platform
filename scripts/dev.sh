#!/bin/bash
# Start backend + frontend for local development
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

export POSTGRES_HOST=localhost
export POSTGRES_DB=ecommerce_db
export POSTGRES_USER=ecommerce_user
export POSTGRES_PASSWORD=admin
export USE_REDIS=False

echo "==> Seeding database (if needed)..."
cd "$ROOT/backend"
.venv/bin/python manage.py migrate --noinput
.venv/bin/python manage.py seed_data

echo "==> Starting Django on http://127.0.0.1:2000"
.venv/bin/python manage.py runserver 0.0.0.0:2000 &
BACKEND_PID=$!

echo "==> Starting Next.js on http://localhost:3000"
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait

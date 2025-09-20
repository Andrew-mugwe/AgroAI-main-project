#!/usr/bin/env bash
set -euo pipefail

docker run --name agroai-dev-postgres \
  -e POSTGRES_USER=agroai -e POSTGRES_PASSWORD=agroai -e POSTGRES_DB=agroai_dev \
  -p 5432:5432 -d postgres:15

echo 'export DATABASE_URL="postgres://agroai:agroai@localhost:5432/agroai_dev?sslmode=disable"'

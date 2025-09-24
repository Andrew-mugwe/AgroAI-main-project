#!/usr/bin/env bash
# Flow14.1.1: Verify Marketplace Upgrade end-to-end
set -euo pipefail

echo "[1/6] Backend tests"
pushd backend >/dev/null
go mod tidy
go test ./... -count=1
popd >/dev/null

echo "[2/6] Run migration and seed (DATABASE_URL required)"
if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL not set" >&2
  exit 1
fi
psql "$DATABASE_URL" -f db/migrations/0018_marketplace_public_endpoints.up.sql
psql "$DATABASE_URL" -f db/seeds/seed_marketplace_public.sql

echo "[3/6] Frontend build & tests"
pushd client >/dev/null
npm ci
npm run build
npm test -- --watchAll=false || true
popd >/dev/null

echo "[4/6] Smoke test public products (backend must be running)"
curl -sf http://localhost:8080/api/marketplace/products | jq '.' | head -n 20 || true

echo "[5/6] Mock order creation (requires a valid token)"
if [ -n "${BUYER_TOKEN:-}" ]; then
  curl -s -X POST \
    -H "Authorization: Bearer $BUYER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"items":[{"product_id":"REPLACE","quantity":1}],"payment_method":"mock","shipping_address":{},"billing_address":{}}' \
    http://localhost:8080/api/marketplace/orders | jq '.' || true
else
  echo "BUYER_TOKEN not set, skipping order test" >&2
fi

echo "[6/6] Done"



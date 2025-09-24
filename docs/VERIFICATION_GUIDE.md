// Flow14.1.1

# Marketplace Upgrade Verification Guide

## Prerequisites
- Postgres running and `DATABASE_URL` set
- Backend server running on :8080
- Frontend configured with `VITE_API_URL=/api`

## Steps
1. Run migration and seeds:
   - `psql "$DATABASE_URL" -f db/migrations/0018_marketplace_public_endpoints.up.sql`
   - `psql "$DATABASE_URL" -f db/seeds/seed_marketplace_public.sql`
2. Start backend: `cd backend && go run main.go`
3. Start frontend: `cd client && npm ci && npm run dev`
4. Visit `/marketplace` and confirm products render from API (set `VITE_USE_MOCK_MARKETPLACE=false`).
5. API smoke:
   - `curl -s http://localhost:8080/api/marketplace/products?page=1&limit=10 | jq`
   - Get product by ID and check fields.
6. Order flow (mock):
   - Acquire `$BUYER_TOKEN`
   - `curl -X POST -H "Authorization: Bearer $BUYER_TOKEN" -H "Content-Type: application/json" -d '{"items":[{"product_id":"<id>","quantity":1}],"payment_method":"mock","shipping_address":{},"billing_address":{}}' http://localhost:8080/api/marketplace/orders | jq`
7. Optional Stripe test if keys present: use `payment_method":"stripe"`.

## CI
CI workflow `marketplace_upgrade_verify.yml` builds backend, runs migrations/seeds, builds frontend.



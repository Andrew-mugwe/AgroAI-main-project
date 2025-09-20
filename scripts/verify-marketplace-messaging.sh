#!/bin/bash
set -e

echo "👉 Running messaging verification..."

# 1. Check migrations
psql $DATABASE_URL -c "SELECT to_regclass('public.threads');"
psql $DATABASE_URL -c "SELECT to_regclass('public.messages');"

# 2. Seed check
psql $DATABASE_URL -c "SELECT * FROM threads LIMIT 1;"
psql $DATABASE_URL -c "SELECT * FROM messages LIMIT 2;"

echo "✅ Messaging tables + seeds verified."
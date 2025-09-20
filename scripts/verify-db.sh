#!/bin/bash
set -e
source .env

# Create logs directory if it doesn't exist
mkdir -p logs

echo "🔍 Running local Flow 11 verification..."

# Run migrations and seeds
psql $DATABASE_URL -f ./db/migrations/001_create_notifications_table.sql
psql $DATABASE_URL -f ./db/seeds/seed.sql

# Query notifications and log output
echo "📊 Querying notifications table..."
psql $DATABASE_URL -c "SELECT * FROM notifications LIMIT 5;" > logs/verify-db.log 2>&1

# Count total notifications
ROWS=$(psql $DATABASE_URL -t -c "SELECT COUNT(*) FROM notifications;" | xargs)
echo "✅ Found $ROWS rows in notifications table."

# Log the count to the log file
echo "Total notifications: $ROWS" >> logs/verify-db.log

if [ "$ROWS" -gt 0 ]; then
  echo "✅ Verification passed locally."
  echo "📄 Log saved to logs/verify-db.log"
  exit 0
else
  echo "❌ Verification failed: No rows found."
  echo "❌ Check logs/verify-db.log for details"
  exit 1
fi

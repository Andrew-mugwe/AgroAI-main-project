#!/bin/bash
set -e

# Log function
log() {
    echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')] $@"
}

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    log "ERROR: DATABASE_URL environment variable is required"
    exit 1
fi

# Function to run SQL file and log output
run_sql_file() {
    local file=$1
    log "Running migration: $file"
    psql "$DATABASE_URL" -f "$file" -v ON_ERROR_STOP=1
}

# Check if analytics_events table exists
TABLE_EXISTS=$(psql "$DATABASE_URL" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'analytics_events')")

if [[ $TABLE_EXISTS =~ t ]]; then
    log "analytics_events table already exists"
else
    log "Creating analytics_events table and related objects"
    run_sql_file "migrations/analytics/001_create_analytics_events.sql"
fi

# Check and create indexes
log "Verifying indexes..."
run_sql_file "migrations/analytics/002_verify_indexes.sql"

# Run any pending migrations
log "Running pending migrations..."
for f in migrations/analytics/[0-9]*.sql
do
    if [[ $f != *"001_create"* ]] && [[ $f != *"002_verify"* ]]; then
        run_sql_file "$f"
    fi
done

log "Analytics migrations completed successfully"

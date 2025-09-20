#!/bin/bash
set -e

# Configuration
MIGRATION_DIR="/app/migrations"
LOG_FILE="/var/log/migrations.log"
TIMEOUT=30

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if migrations directory exists
if [ ! -d "$MIGRATION_DIR" ]; then
    log "ERROR: Migrations directory not found at $MIGRATION_DIR"
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    log "ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

# Create migrations table if it doesn't exist
psql "$DATABASE_URL" <<-EOSQL
    CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
EOSQL

# Get list of migration files
migrations=($(ls -v $MIGRATION_DIR/*.sql))

# Function to check if migration has been applied
migration_applied() {
    local version=$1
    local result=$(psql -t -A "$DATABASE_URL" -c "SELECT COUNT(*) FROM schema_migrations WHERE version = '$version';")
    [ "$result" -eq "1" ]
}

# Function to apply migration
apply_migration() {
    local file=$1
    local version=$(basename "$file" .sql)
    
    log "Applying migration: $version"
    
    # Start transaction
    psql "$DATABASE_URL" <<-EOSQL
        BEGIN;
        
        -- Apply migration
        \i $file
        
        -- Record migration
        INSERT INTO schema_migrations (version) VALUES ('$version');
        
        COMMIT;
EOSQL
    
    if [ $? -eq 0 ]; then
        log "Successfully applied migration: $version"
        return 0
    else
        log "ERROR: Failed to apply migration: $version"
        return 1
    fi
}

# Main migration loop
for migration in "${migrations[@]}"; do
    version=$(basename "$migration" .sql)
    
    if migration_applied "$version"; then
        log "Skipping already applied migration: $version"
        continue
    fi
    
    log "Found new migration to apply: $version"
    
    # Apply migration with timeout
    timeout $TIMEOUT bash -c "apply_migration '$migration'"
    
    if [ $? -ne 0 ]; then
        log "ERROR: Migration failed or timed out: $version"
        exit 1
    fi
done

log "All migrations completed successfully"
exit 0

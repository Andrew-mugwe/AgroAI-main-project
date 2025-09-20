-- AgroAI Database Initialization Script
-- This script runs when the PostgreSQL container starts for the first time

-- Create additional databases for different environments
CREATE DATABASE agroai_test;
CREATE DATABASE agroai_staging;

-- Create extensions
\c agroai_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c agroai_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c agroai_staging;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Switch back to main database
\c agroai_dev;

-- Create a read-only user for reporting
CREATE USER agroai_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE agroai_dev TO agroai_readonly;
GRANT USAGE ON SCHEMA public TO agroai_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO agroai_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO agroai_readonly;

-- Create a backup user
CREATE USER agroai_backup WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE agroai_dev TO agroai_backup;
GRANT USAGE ON SCHEMA public TO agroai_backup;

-- Log successful initialization
INSERT INTO pg_stat_statements_info VALUES ('AgroAI Database Initialized', NOW());

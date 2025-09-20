-- Migration: Drop trader-specific tables
-- Backup recommended before running in production

BEGIN;

-- Log rollback start
INSERT INTO schema_migrations_audit (migration_name, operation, status)
VALUES ('000003_create_trader_tables', 'ROLLBACK_START', 'IN_PROGRESS');

-- Drop orders table if exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        DROP TABLE orders;
        
        -- Log table removal
        INSERT INTO schema_migrations_audit (migration_name, operation, status)
        VALUES ('000003_create_trader_tables', 'DROP_ORDERS', 'SUCCESS');
    END IF;
END$$;

-- Drop marketplace_products table if exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_products') THEN
        DROP TABLE marketplace_products;
        
        -- Log table removal
        INSERT INTO schema_migrations_audit (migration_name, operation, status)
        VALUES ('000003_create_trader_tables', 'DROP_MARKETPLACE_PRODUCTS', 'SUCCESS');
    END IF;
END$$;

-- Drop order_status type if exists
DO $$
BEGIN
    DROP TYPE IF EXISTS order_status;
    
    -- Log type removal
    INSERT INTO schema_migrations_audit (migration_name, operation, status)
    VALUES ('000003_create_trader_tables', 'DROP_ORDER_STATUS_TYPE', 'SUCCESS');
END$$;

-- Log successful rollback completion
INSERT INTO schema_migrations_audit (migration_name, operation, status)
VALUES ('000003_create_trader_tables', 'ROLLBACK_COMPLETE', 'SUCCESS');

COMMIT;

-- Verification queries (commented out - run manually):
/*
-- Verify tables are dropped:
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('marketplace_products', 'orders');

-- Verify type is dropped:
SELECT typname 
FROM pg_type 
WHERE typname = 'order_status';

-- Check audit log:
SELECT * FROM schema_migrations_audit 
WHERE migration_name = '000003_create_trader_tables' 
ORDER BY executed_at DESC;
*/

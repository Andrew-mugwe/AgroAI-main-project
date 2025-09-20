-- Migration: Create trader-specific tables
-- Backup recommended before running in production

BEGIN;

-- Log migration start
INSERT INTO schema_migrations_audit (migration_name, operation, status)
VALUES ('000003_create_trader_tables', 'START', 'IN_PROGRESS');

-- Create marketplace_products table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_products') THEN
        CREATE TABLE marketplace_products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            trader_id UUID NOT NULL REFERENCES users(id),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            category VARCHAR(100) NOT NULL,
            status VARCHAR(50) NOT NULL DEFAULT 'active',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes
        CREATE INDEX idx_marketplace_products_trader ON marketplace_products(trader_id);
        CREATE INDEX idx_marketplace_products_category ON marketplace_products(category);
        CREATE INDEX idx_marketplace_products_status ON marketplace_products(status);

        -- Log table creation
        INSERT INTO schema_migrations_audit (migration_name, operation, status)
        VALUES ('000003_create_trader_tables', 'CREATE_MARKETPLACE_PRODUCTS', 'SUCCESS');
    ELSE
        INSERT INTO schema_migrations_audit (migration_name, operation, status)
        VALUES ('000003_create_trader_tables', 'CREATE_MARKETPLACE_PRODUCTS', 'SKIPPED - Table exists');
    END IF;
END$$;

-- Create orders table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'orders') THEN
        -- Create order status type
        CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

        CREATE TABLE orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            trader_id UUID NOT NULL REFERENCES users(id),
            buyer_id UUID NOT NULL REFERENCES users(id),
            product_id UUID NOT NULL REFERENCES marketplace_products(id),
            quantity INTEGER NOT NULL,
            unit_price DECIMAL(10,2) NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            status order_status NOT NULL DEFAULT 'pending',
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create indexes
        CREATE INDEX idx_orders_trader ON orders(trader_id);
        CREATE INDEX idx_orders_buyer ON orders(buyer_id);
        CREATE INDEX idx_orders_product ON orders(product_id);
        CREATE INDEX idx_orders_status ON orders(status);
        CREATE INDEX idx_orders_created_at ON orders(created_at);

        -- Log table creation
        INSERT INTO schema_migrations_audit (migration_name, operation, status)
        VALUES ('000003_create_trader_tables', 'CREATE_ORDERS', 'SUCCESS');
    ELSE
        INSERT INTO schema_migrations_audit (migration_name, operation, status)
        VALUES ('000003_create_trader_tables', 'CREATE_ORDERS', 'SKIPPED - Table exists');
    END IF;
END$$;

-- Create updated_at triggers
DO $$
BEGIN
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Add trigger to marketplace_products
    DROP TRIGGER IF EXISTS update_marketplace_products_updated_at ON marketplace_products;
    CREATE TRIGGER update_marketplace_products_updated_at
        BEFORE UPDATE ON marketplace_products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Add trigger to orders
    DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
    CREATE TRIGGER update_orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END$$;

-- Log successful completion
INSERT INTO schema_migrations_audit (migration_name, operation, status)
VALUES ('000003_create_trader_tables', 'COMPLETE', 'SUCCESS');

COMMIT;

-- Verification queries (commented out - run manually):
/*
-- Check tables:
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('marketplace_products', 'orders');

-- Check indexes:
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('marketplace_products', 'orders');

-- Check triggers:
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('marketplace_products', 'orders');

-- Check audit log:
SELECT * FROM schema_migrations_audit 
WHERE migration_name = '000003_create_trader_tables' 
ORDER BY executed_at DESC;
*/

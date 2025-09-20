-- Drop tables and indexes
DROP TABLE IF EXISTS analytics_events;
DROP TABLE IF EXISTS ngo_users;

-- Drop enum type if no other tables are using it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE udt_name = 'user_role' 
        AND table_name != 'analytics_events'
    ) THEN
        DROP TYPE IF EXISTS user_role;
    END IF;
END $$;

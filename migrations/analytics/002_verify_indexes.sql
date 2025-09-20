-- Verify and create required indexes for analytics_events table
DO $$
DECLARE
    index_exists boolean;
BEGIN
    -- Check and create user_role index
    SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'analytics_events' 
        AND indexname = 'idx_analytics_events_user_role'
    ) INTO index_exists;
    
    IF NOT index_exists THEN
        RAISE NOTICE 'Creating index on (user_id, role)';
        CREATE INDEX idx_analytics_events_user_role ON analytics_events(user_id, role);
    END IF;

    -- Check and create event_type index
    SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'analytics_events' 
        AND indexname = 'idx_analytics_events_type'
    ) INTO index_exists;
    
    IF NOT index_exists THEN
        RAISE NOTICE 'Creating index on event_type';
        CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
    END IF;

    -- Check and create created_at index
    SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'analytics_events' 
        AND indexname = 'idx_analytics_events_created'
    ) INTO index_exists;
    
    IF NOT index_exists THEN
        RAISE NOTICE 'Creating index on created_at';
        CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);
    END IF;

    -- Check and create metadata GIN index
    SELECT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'analytics_events' 
        AND indexname = 'idx_analytics_events_metadata'
    ) INTO index_exists;
    
    IF NOT index_exists THEN
        RAISE NOTICE 'Creating GIN index on metadata';
        CREATE INDEX idx_analytics_events_metadata ON analytics_events USING gin (metadata);
    END IF;
END $$;

-- Create role enum type if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('farmer', 'ngo', 'trader');
    END IF;
END$$;

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT valid_event_type CHECK (event_type ~ '^[a-z_]+\.[a-z_]+$'), -- e.g., 'farmer.crop_added'
    CONSTRAINT valid_metadata CHECK (jsonb_typeof(metadata) = 'object')
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_user_role ON analytics_events(user_id, role);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_metadata ON analytics_events USING gin (metadata);

-- Create ngo_users table for NGO-Farmer relationships
CREATE TABLE IF NOT EXISTS ngo_users (
    ngo_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (ngo_id, farmer_id),
    CONSTRAINT ngo_must_be_ngo CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = ngo_id AND role = 'ngo'::user_role
        )
    ),
    CONSTRAINT farmer_must_be_farmer CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = farmer_id AND role = 'farmer'::user_role
        )
    )
);

-- Index for NGO-Farmer lookups
CREATE INDEX idx_ngo_users_ngo ON ngo_users(ngo_id);
CREATE INDEX idx_ngo_users_farmer ON ngo_users(farmer_id);

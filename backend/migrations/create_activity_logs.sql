-- Migration: Create activity_logs table for audit trail
-- Created: 2024-01-15
-- Description: Tracks user and system actions for debugging, compliance, and trust

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID NULL, -- FK to users.id, nullable for system actions
    role TEXT, -- User role at time of action
    action TEXT NOT NULL, -- Action type (e.g., LOGIN, CREATE_ORDER, UPDATE_PROFILE)
    metadata JSONB, -- Extra context: product_id, payload, etc.
    ip_address TEXT, -- Client IP address
    user_agent TEXT, -- Client user agent
    created_at TIMESTAMP DEFAULT now() -- Action timestamp
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_role ON activity_logs(role);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_action ON activity_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_role_created ON activity_logs(role, created_at);

-- Add foreign key constraint if users table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE activity_logs 
        ADD CONSTRAINT fk_activity_logs_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE activity_logs IS 'Audit trail for user and system actions';
COMMENT ON COLUMN activity_logs.id IS 'Primary key';
COMMENT ON COLUMN activity_logs.user_id IS 'User who performed the action (nullable for system actions)';
COMMENT ON COLUMN activity_logs.role IS 'User role at time of action';
COMMENT ON COLUMN activity_logs.action IS 'Type of action performed';
COMMENT ON COLUMN activity_logs.metadata IS 'Additional context data in JSON format';
COMMENT ON COLUMN activity_logs.ip_address IS 'Client IP address';
COMMENT ON COLUMN activity_logs.user_agent IS 'Client user agent string';
COMMENT ON COLUMN activity_logs.created_at IS 'Timestamp when action was performed';

-- Insert sample data for testing (optional)
INSERT INTO activity_logs (user_id, role, action, metadata, ip_address, user_agent) VALUES
    (NULL, 'SYSTEM', 'MIGRATION_COMPLETED', '{"migration": "create_activity_logs", "version": "1.0"}', '127.0.0.1', 'PostgreSQL Migration'),
    (NULL, 'SYSTEM', 'DATABASE_INITIALIZED', '{"tables_created": 1, "indexes_created": 6}', '127.0.0.1', 'PostgreSQL Migration')
ON CONFLICT DO NOTHING;

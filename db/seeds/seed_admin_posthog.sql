-- Seed: Admin user and PostHog demo data
-- Description: Flow 14.10 - Admin Dashboard + PostHog Monitoring

-- Insert demo admin user (only for local/demo environments)
INSERT INTO users (id, username, email, password_hash, role, country, created_at, updated_at) 
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    'admin@agroai.test',
    '$2a$10$rQZ8K9vX8nP2mN3oL4pQOeK9vX8nP2mN3oL4pQOeK9vX8nP2mN3oL4p', -- password: 'admin123'
    'admin',
    'Kenya',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert admin user record
INSERT INTO admin_users (user_id, role, permissions, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin',
    '{"can_verify_sellers": true, "can_view_analytics": true, "can_manage_alerts": true, "can_access_admin_dashboard": true}'::jsonb,
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Insert demo alert rules for testing
INSERT INTO alert_rules (rule_name, description, condition_json, channels, active) VALUES
(
    'demo_high_orders',
    'Demo alert when orders exceed 100 in 1 hour',
    '{"metric":"total_orders","threshold":100,"window":"1h","operator":">"}'::jsonb,
    '{"slack": true, "email": true}'::jsonb,
    false -- Disabled by default
),
(
    'demo_low_users',
    'Demo alert when active users drop below 10',
    '{"metric":"active_users","threshold":10,"window":"1h","operator":"<"}'::jsonb,
    '{"slack": true, "email": false}'::jsonb,
    false -- Disabled by default
) ON CONFLICT (rule_name) DO NOTHING;

-- Insert demo alerts for testing the UI
INSERT INTO alerts (id, rule_name, severity, triggered_at, payload, delivered, delivered_channels, created_at) VALUES
(
    gen_random_uuid(),
    'high_payment_failure_rate',
    'high',
    NOW() - INTERVAL '2 hours',
    '{"metric":"payment_failure_rate","value":7.5,"threshold":5,"operator":">","window":"1h","description":"Alert when payment failure rate exceeds 5% in 1 hour"}'::jsonb,
    true,
    '["slack", "email"]'::text[],
    NOW() - INTERVAL '2 hours'
),
(
    gen_random_uuid(),
    'low_seller_reputation',
    'medium',
    NOW() - INTERVAL '1 day',
    '{"metric":"avg_seller_reputation","value":35.2,"threshold":40,"operator":"<","window":"24h","description":"Alert when average seller reputation drops below 40"}'::jsonb,
    true,
    '["slack"]'::text[],
    NOW() - INTERVAL '1 day'
),
(
    gen_random_uuid(),
    'system_error_spike',
    'critical',
    NOW() - INTERVAL '30 minutes',
    '{"metric":"system_errors","value":75,"threshold":50,"operator":">","window":"1h","description":"Alert when system errors exceed 50 in 1 hour"}'::jsonb,
    false,
    '[]'::text[],
    NOW() - INTERVAL '30 minutes'
);

-- Update user role to admin for the demo user
UPDATE users SET role = 'admin' WHERE email = 'admin@agroai.test';

-- Add some sample activity logs for testing (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_logs') THEN
        INSERT INTO activity_logs (user_id, action, resource_type, resource_id, level, metadata, created_at) VALUES
        ('00000000-0000-0000-0000-000000000001', 'admin_login', 'user', '00000000-0000-0000-0000-000000000001', 'INFO', '{"ip":"127.0.0.1","user_agent":"Mozilla/5.0"}'::jsonb, NOW() - INTERVAL '1 hour'),
        ('00000000-0000-0000-0000-000000000001', 'seller_verified', 'seller', '00000000-0000-0000-0000-000000000002', 'INFO', '{"seller_id":"00000000-0000-0000-0000-000000000002","verified":true}'::jsonb, NOW() - INTERVAL '2 hours'),
        (NULL, 'system_error', 'system', NULL, 'ERROR', '{"error":"Database connection timeout","component":"payment_service"}'::jsonb, NOW() - INTERVAL '30 minutes'),
        (NULL, 'system_error', 'system', NULL, 'ERROR', '{"error":"Failed to send notification","component":"notification_service"}'::jsonb, NOW() - INTERVAL '25 minutes');
    END IF;
END $$;

-- Comments
COMMENT ON TABLE admin_users IS 'Admin users with elevated permissions for Flow 14.10';
COMMENT ON TABLE alert_rules IS 'Configurable alert rules for monitoring system';
COMMENT ON TABLE alerts IS 'Triggered alerts from monitoring rules';


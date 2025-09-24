-- Migration: Create monitoring alerts tables
-- Description: Flow 14.10 - Admin Dashboard + PostHog Monitoring

-- Create alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    payload JSONB DEFAULT '{}'::jsonb,
    delivered BOOLEAN DEFAULT false,
    delivered_channels TEXT[] DEFAULT '{}',
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- Create alert_rules table
CREATE TABLE alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name TEXT UNIQUE NOT NULL,
    description TEXT,
    condition_json JSONB NOT NULL, -- e.g., {"metric":"payment_failure_rate","threshold":5,"window":"1h"}
    channels JSONB DEFAULT '{"slack": true, "email": true}'::jsonb,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Create admin_users table for demo admin user
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin',
    permissions JSONB DEFAULT '{"can_verify_sellers": true, "can_view_analytics": true, "can_manage_alerts": true}'::jsonb,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_alerts_triggered_at ON alerts(triggered_at DESC);
CREATE INDEX idx_alerts_rule_name ON alerts(rule_name);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_delivered ON alerts(delivered);
CREATE INDEX idx_alert_rules_active ON alert_rules(active);
CREATE INDEX idx_admin_users_user_id ON admin_users(user_id);

-- Insert default alert rules
INSERT INTO alert_rules (rule_name, description, condition_json, channels) VALUES
('high_payment_failure_rate', 'Alert when payment failure rate exceeds 5% in 1 hour', 
 '{"metric":"payment_failure_rate","threshold":5,"window":"1h","operator":">"}', 
 '{"slack": true, "email": true}'),
('low_seller_reputation', 'Alert when average seller reputation drops below 40',
 '{"metric":"avg_seller_reputation","threshold":40,"window":"24h","operator":"<"}',
 '{"slack": true, "email": true}'),
('high_dispute_rate', 'Alert when dispute rate exceeds 10% in 24 hours',
 '{"metric":"dispute_rate","threshold":10,"window":"24h","operator":">"}',
 '{"slack": true, "email": true}'),
('system_error_spike', 'Alert when system errors exceed 50 in 1 hour',
 '{"metric":"system_errors","threshold":50,"window":"1h","operator":">"}',
 '{"slack": true, "email": true}');

-- Comments
COMMENT ON TABLE alerts IS 'System alerts triggered by monitoring rules';
COMMENT ON TABLE alert_rules IS 'Configurable alert rules for monitoring';
COMMENT ON TABLE admin_users IS 'Admin users with elevated permissions';


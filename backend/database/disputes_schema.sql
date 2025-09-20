-- AgroAI Disputes System Database Schema
-- This file contains the SQL schema for the disputes system

-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id UUID NOT NULL,
    order_id UUID NOT NULL,
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED_BUYER', 'RESOLVED_SELLER', 'ESCALATED')),
    reason VARCHAR(20) NOT NULL CHECK (reason IN ('undelivered', 'damaged', 'wrong_item', 'other')),
    description TEXT NOT NULL,
    evidence TEXT[] DEFAULT '{}',
    resolution_note TEXT,
    resolution VARCHAR(20) CHECK (resolution IN ('buyer_favor', 'seller_favor', 'partial', 'no_fault')),
    resolved_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    escalated_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    
    -- Indexes for better performance
    CONSTRAINT fk_dispute_escrow FOREIGN KEY (escrow_id) REFERENCES escrows(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_dispute_resolver FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_disputes_escrow_id ON disputes(escrow_id);
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_buyer_id ON disputes(buyer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_seller_id ON disputes(seller_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_reason ON disputes(reason);
CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON disputes(created_at);
CREATE INDEX IF NOT EXISTS idx_disputes_resolved_by ON disputes(resolved_by);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_disputes_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_disputes_updated_at 
    BEFORE UPDATE ON disputes 
    FOR EACH ROW 
    EXECUTE FUNCTION update_disputes_updated_at_column();

-- Create view for dispute summary
CREATE OR REPLACE VIEW dispute_summary AS
SELECT 
    COUNT(*) as total_disputes,
    COUNT(CASE WHEN status = 'OPEN' THEN 1 END) as open_disputes,
    COUNT(CASE WHEN status = 'UNDER_REVIEW' THEN 1 END) as under_review_disputes,
    COUNT(CASE WHEN status IN ('RESOLVED_BUYER', 'RESOLVED_SELLER') THEN 1 END) as resolved_disputes,
    COUNT(CASE WHEN status = 'ESCALATED' THEN 1 END) as escalated_disputes,
    COUNT(CASE WHEN status = 'RESOLVED_BUYER' THEN 1 END) as buyer_wins,
    COUNT(CASE WHEN status = 'RESOLVED_SELLER' THEN 1 END) as seller_wins,
    AVG(CASE WHEN resolved_at IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 
    END) as avg_resolution_time_hours
FROM disputes;

-- Insert sample data for testing
INSERT INTO disputes (escrow_id, order_id, buyer_id, seller_id, status, reason, description, evidence, metadata) VALUES
    ('123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174001', '789e0123-e89b-12d3-a456-426614174002', '890e1234-e89b-12d3-a456-426614174003', 'OPEN', 'damaged', 'Item arrived damaged and unusable', ARRAY['damage_photo_1.jpg', 'damage_photo_2.jpg'], '{"demo": true, "product": "Organic Tomatoes"}'),
    ('234e5678-e89b-12d3-a456-426614174004', '567e8901-e89b-12d3-a456-426614174005', '890e1234-e89b-12d3-a456-426614174006', '901e2345-e89b-12d3-a456-426614174007', 'UNDER_REVIEW', 'undelivered', 'Package never arrived despite tracking showing delivered', ARRAY['tracking_screenshot.png'], '{"demo": true, "product": "Avocado Bunch"}'),
    ('345e6789-e89b-12d3-a456-426614174008', '678e9012-e89b-12d3-a456-426614174009', '901e2345-e89b-12d3-a456-426614174010', '012e3456-e89b-12d3-a456-426614174011', 'RESOLVED_BUYER', 'wrong_item', 'Received wrong variety of seeds', ARRAY['wrong_item_photo.jpg'], '{"demo": true, "product": "Fresh Vegetables"}');

-- Create dispute_timeline table for audit trail
CREATE TABLE IF NOT EXISTS dispute_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID NOT NULL,
    event VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actor_id UUID NOT NULL,
    actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('buyer', 'seller', 'admin', 'ngo')),
    details TEXT,
    metadata JSONB,
    
    CONSTRAINT fk_timeline_dispute FOREIGN KEY (dispute_id) REFERENCES disputes(id) ON DELETE CASCADE,
    CONSTRAINT fk_timeline_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for dispute_timeline
CREATE INDEX IF NOT EXISTS idx_dispute_timeline_dispute_id ON dispute_timeline(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_timeline_timestamp ON dispute_timeline(timestamp);
CREATE INDEX IF NOT EXISTS idx_dispute_timeline_actor ON dispute_timeline(actor_id);
CREATE INDEX IF NOT EXISTS idx_dispute_timeline_event ON dispute_timeline(event);

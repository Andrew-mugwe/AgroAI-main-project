-- AgroAI Escrow System Database Schema
-- This file contains the SQL schema for the escrow system

-- Create escrows table
CREATE TABLE IF NOT EXISTS escrows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    buyer_id UUID NOT NULL,
    seller_id UUID NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'HELD' CHECK (status IN ('HELD', 'RELEASED', 'REFUNDED', 'DISPUTED')),
    payment_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    released_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    
    -- Indexes for better performance
    CONSTRAINT fk_escrow_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_escrow_buyer FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_escrow_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_escrows_order_id ON escrows(order_id);
CREATE INDEX IF NOT EXISTS idx_escrows_buyer_id ON escrows(buyer_id);
CREATE INDEX IF NOT EXISTS idx_escrows_seller_id ON escrows(seller_id);
CREATE INDEX IF NOT EXISTS idx_escrows_status ON escrows(status);
CREATE INDEX IF NOT EXISTS idx_escrows_created_at ON escrows(created_at);
CREATE INDEX IF NOT EXISTS idx_escrows_currency ON escrows(currency);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_escrows_updated_at 
    BEFORE UPDATE ON escrows 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for escrow summary
CREATE OR REPLACE VIEW escrow_summary AS
SELECT 
    currency,
    COUNT(*) as total_escrows,
    COUNT(CASE WHEN status = 'HELD' THEN 1 END) as held_count,
    COUNT(CASE WHEN status = 'RELEASED' THEN 1 END) as released_count,
    COUNT(CASE WHEN status = 'REFUNDED' THEN 1 END) as refunded_count,
    SUM(CASE WHEN status = 'HELD' THEN amount ELSE 0 END) as total_held,
    SUM(CASE WHEN status = 'RELEASED' THEN amount ELSE 0 END) as total_released,
    SUM(CASE WHEN status = 'REFUNDED' THEN amount ELSE 0 END) as total_refunded,
    AVG(CASE WHEN status = 'RELEASED' AND released_at IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (released_at - created_at))/3600 
    END) as avg_release_time_hours
FROM escrows 
GROUP BY currency;

-- Insert sample data for testing
INSERT INTO escrows (order_id, buyer_id, seller_id, amount, currency, status, payment_id, metadata) VALUES
    ('123e4567-e89b-12d3-a456-426614174000', '456e7890-e89b-12d3-a456-426614174001', '789e0123-e89b-12d3-a456-426614174002', 50.00, 'USD', 'HELD', 'pi_stripe_demo_123', '{"demo": true, "product": "Organic Tomatoes"}'),
    ('234e5678-e89b-12d3-a456-426614174003', '567e8901-e89b-12d3-a456-426614174004', '890e1234-e89b-12d3-a456-426614174005', 75.00, 'USD', 'RELEASED', 'pi_stripe_demo_124', '{"demo": true, "product": "Avocado Bunch"}'),
    ('345e6789-e89b-12d3-a456-426614174006', '678e9012-e89b-12d3-a456-426614174007', '901e2345-e89b-12d3-a456-426614174008', 1000.00, 'KES', 'HELD', 'pi_mpesa_demo_125', '{"demo": true, "product": "Fresh Vegetables"}');

-- Create payout_logs table for tracking payout transactions
CREATE TABLE IF NOT EXISTS payout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    escrow_id UUID NOT NULL,
    provider VARCHAR(50) NOT NULL,
    payout_id VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB,
    
    CONSTRAINT fk_payout_escrow FOREIGN KEY (escrow_id) REFERENCES escrows(id) ON DELETE CASCADE
);

-- Create indexes for payout_logs
CREATE INDEX IF NOT EXISTS idx_payout_logs_escrow_id ON payout_logs(escrow_id);
CREATE INDEX IF NOT EXISTS idx_payout_logs_provider ON payout_logs(provider);
CREATE INDEX IF NOT EXISTS idx_payout_logs_status ON payout_logs(status);
CREATE INDEX IF NOT EXISTS idx_payout_logs_processed_at ON payout_logs(processed_at);

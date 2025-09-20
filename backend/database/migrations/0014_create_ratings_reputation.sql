-- AgroAI Reputation & Ratings System Migration
-- Migration: 0014_create_ratings_reputation.sql
-- Description: Creates tables for ratings and reputation tracking

-- Create ratings table
CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    order_id INT UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id),
    seller_id UUID NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT now(),
    
    -- Ensure one rating per order per reviewer
    CONSTRAINT unique_order_reviewer UNIQUE (order_id, reviewer_id)
);

-- Create reputation_history table for tracking score changes
CREATE TABLE IF NOT EXISTS reputation_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ratings_seller ON ratings(seller_id);
CREATE INDEX IF NOT EXISTS idx_ratings_reviewer ON ratings(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at);
CREATE INDEX IF NOT EXISTS idx_reputation_user ON reputation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reputation_created_at ON reputation_history(created_at);

-- Create view for seller reputation summary
CREATE OR REPLACE VIEW seller_reputation_summary AS
SELECT 
    u.id as seller_id,
    u.name as seller_name,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(r.id) as total_ratings,
    COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star_ratings,
    COUNT(CASE WHEN r.rating >= 4 THEN 1 END) as positive_ratings,
    COUNT(CASE WHEN r.rating <= 2 THEN 1 END) as negative_ratings,
    COUNT(CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_ratings,
    COALESCE((
        SELECT score 
        FROM reputation_history rh 
        WHERE rh.user_id = u.id 
        ORDER BY rh.created_at DESC 
        LIMIT 1
    ), 0) as current_reputation_score
FROM users u
LEFT JOIN ratings r ON u.id = r.seller_id
WHERE u.role = 'trader' OR u.role = 'seller'
GROUP BY u.id, u.name;

-- Create view for reputation breakdown components
CREATE OR REPLACE VIEW reputation_breakdown AS
SELECT 
    u.id as user_id,
    -- Rating component (50% weight)
    COALESCE(AVG(r.rating) * 10, 0) as rating_contrib,
    COUNT(r.id) as total_ratings,
    
    -- Orders component (+0.5 per order, capped at 20)
    LEAST(COUNT(DISTINCT o.id) * 0.5, 20) as orders_contrib,
    COUNT(DISTINCT o.id) as total_orders,
    
    -- Disputes penalty (-2 per dispute in last 180 days)
    COALESCE((
        SELECT COUNT(*) * -2 
        FROM disputes d 
        WHERE d.seller_id = u.id 
        AND d.created_at >= NOW() - INTERVAL '180 days'
        AND d.status IN ('RESOLVED_BUYER', 'ESCALATED')
    ), 0) as disputes_penalty,
    
    -- Verified seller bonus (+10)
    CASE WHEN u.verified = true THEN 10 ELSE 0 END as verified_bonus,
    
    -- Calculate final score
    GREATEST(0, LEAST(100, 
        COALESCE(AVG(r.rating) * 10, 0) * 0.5 +  -- 50% rating weight
        LEAST(COUNT(DISTINCT o.id) * 0.5, 20) +  -- Orders bonus (capped)
        COALESCE((
            SELECT COUNT(*) * -2 
            FROM disputes d 
            WHERE d.seller_id = u.id 
            AND d.created_at >= NOW() - INTERVAL '180 days'
            AND d.status IN ('RESOLVED_BUYER', 'ESCALATED')
        ), 0) +                                   -- Disputes penalty
        CASE WHEN u.verified = true THEN 10 ELSE 0 END  -- Verified bonus
    )) as calculated_score
FROM users u
LEFT JOIN ratings r ON u.id = r.seller_id
LEFT JOIN orders o ON u.id = o.seller_id AND o.status = 'completed'
GROUP BY u.id, u.verified;

-- Add verified column to users table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'verified') THEN
        ALTER TABLE users ADD COLUMN verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create function to automatically update reputation when rating is added
CREATE OR REPLACE FUNCTION update_seller_reputation()
RETURNS TRIGGER AS $$
DECLARE
    new_score NUMERIC(5,2);
    breakdown_data JSONB;
BEGIN
    -- Calculate new reputation score
    SELECT calculated_score INTO new_score
    FROM reputation_breakdown 
    WHERE user_id = NEW.seller_id;
    
    -- Create breakdown metadata
    SELECT jsonb_build_object(
        'rating_contrib', rating_contrib,
        'orders_contrib', orders_contrib,
        'disputes_penalty', disputes_penalty,
        'verified_bonus', verified_bonus,
        'total_ratings', total_ratings,
        'total_orders', total_orders
    ) INTO breakdown_data
    FROM reputation_breakdown 
    WHERE user_id = NEW.seller_id;
    
    -- Insert into reputation history
    INSERT INTO reputation_history (user_id, score, reason, metadata)
    VALUES (NEW.seller_id, new_score, 'Rating added: ' || NEW.rating || ' stars', breakdown_data);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update reputation on rating insert
DROP TRIGGER IF EXISTS trigger_update_reputation ON ratings;
CREATE TRIGGER trigger_update_reputation
    AFTER INSERT ON ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_reputation();

-- Create function to get reputation breakdown for a user
CREATE OR REPLACE FUNCTION get_reputation_breakdown(target_user_id UUID)
RETURNS TABLE(
    rating_contrib NUMERIC,
    orders_contrib NUMERIC,
    disputes_penalty NUMERIC,
    verified_bonus NUMERIC,
    total_ratings BIGINT,
    total_orders BIGINT,
    calculated_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rb.rating_contrib,
        rb.orders_contrib,
        rb.disputes_penalty,
        rb.verified_bonus,
        rb.total_ratings,
        rb.total_orders,
        rb.calculated_score
    FROM reputation_breakdown rb
    WHERE rb.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data for testing
INSERT INTO ratings (order_id, reviewer_id, seller_id, rating, review) VALUES
    (1, '789e0123-e89b-12d3-a456-426614174002', '890e1234-e89b-12d3-a456-426614174003', 5, 'Excellent quality products, fast delivery!'),
    (2, '890e1234-e89b-12d3-a456-426614174006', '901e2345-e89b-12d3-a456-426614174007', 4, 'Good seller, products as described.'),
    (3, '901e2345-e89b-12d3-a456-426614174010', '012e3456-e89b-12d3-a456-426614174011', 3, 'Average experience, some delays in shipping.'),
    (4, '012e3456-e89b-12d3-a456-426614174012', '890e1234-e89b-12d3-a456-426614174003', 5, 'Perfect! Will definitely order again.');

-- Update some users as verified
UPDATE users SET verified = true WHERE id IN ('890e1234-e89b-12d3-a456-426614174003', '901e2345-e89b-12d3-a456-426614174007');

-- Insert initial reputation history for demo sellers
INSERT INTO reputation_history (user_id, score, reason, metadata) VALUES
    ('890e1234-e89b-12d3-a456-426614174003', 85.5, 'Initial reputation calculation', '{"rating_contrib": 45.0, "orders_contrib": 15.0, "disputes_penalty": 0, "verified_bonus": 10.0, "total_ratings": 2, "total_orders": 30}'),
    ('901e2345-e89b-12d3-a456-426614174007', 78.0, 'Initial reputation calculation', '{"rating_contrib": 40.0, "orders_contrib": 10.0, "disputes_penalty": -2.0, "verified_bonus": 10.0, "total_ratings": 1, "total_orders": 20}'),
    ('012e3456-e89b-12d3-a456-426614174011', 65.5, 'Initial reputation calculation', '{"rating_contrib": 30.0, "orders_contrib": 8.0, "disputes_penalty": 0, "verified_bonus": 0.0, "total_ratings": 1, "total_orders": 16}');

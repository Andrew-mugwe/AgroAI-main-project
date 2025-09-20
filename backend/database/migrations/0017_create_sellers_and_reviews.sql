-- Migration: Create enhanced sellers and reviews tables
-- Created: 2025-01-15
-- Description: Flow 14.9 — Seller Profiles & Trust System

-- Create enhanced sellers table
CREATE TABLE IF NOT EXISTS sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    bio TEXT,
    profile_image TEXT,
    location JSONB DEFAULT '{"country": "", "city": "", "lat": null, "lng": null}',
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE REFERENCES orders(id) ON DELETE SET NULL,
    buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Create reputation_history table for tracking reputation changes
CREATE TABLE IF NOT EXISTS reputation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    breakdown JSONB,
    reason TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- Add seller_id column to marketplace_products if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'marketplace_products' AND column_name = 'seller_id') THEN
        ALTER TABLE marketplace_products ADD COLUMN seller_id UUID REFERENCES users(id);
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(user_id);
CREATE INDEX IF NOT EXISTS idx_sellers_verified ON sellers(verified);
CREATE INDEX IF NOT EXISTS idx_reviews_seller_id ON reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer_id ON reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reputation_history_seller_id ON reputation_history(seller_id);
CREATE INDEX IF NOT EXISTS idx_reputation_history_created_at ON reputation_history(created_at DESC);

-- Create materialized view for seller stats
CREATE MATERIALIZED VIEW IF NOT EXISTS seller_stats AS
SELECT 
    s.id as seller_id,
    s.user_id,
    s.name,
    s.verified,
    COALESCE(AVG(r.rating), 0) as avg_rating,
    COUNT(r.id) as total_reviews,
    COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star_reviews,
    COUNT(CASE WHEN r.rating >= 4 THEN 1 END) as positive_reviews,
    COUNT(CASE WHEN r.rating <= 2 THEN 1 END) as negative_reviews,
    COUNT(CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_reviews,
    COUNT(DISTINCT o.id) as total_orders,
    COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as completed_orders,
    COUNT(DISTINCT CASE WHEN o.created_at >= NOW() - INTERVAL '30 days' THEN o.id END) as recent_orders,
    COALESCE(SUM(o.total_amount), 0) as total_sales,
    COALESCE(SUM(CASE WHEN o.created_at >= NOW() - INTERVAL '30 days' THEN o.total_amount ELSE 0 END), 0) as recent_sales
FROM sellers s
LEFT JOIN reviews r ON s.user_id = r.seller_id
LEFT JOIN orders o ON s.user_id = o.seller_id
GROUP BY s.id, s.user_id, s.name, s.verified;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_stats_seller_id ON seller_stats(seller_id);

-- Create function to refresh seller stats
CREATE OR REPLACE FUNCTION refresh_seller_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY seller_stats;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate reputation score
CREATE OR REPLACE FUNCTION calculate_reputation_score(seller_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
    base_score DECIMAL(5,2) := 50;
    rating_contrib DECIMAL(5,2);
    orders_contrib DECIMAL(5,2);
    disputes_penalty DECIMAL(5,2);
    verified_bonus DECIMAL(5,2);
    final_score DECIMAL(5,2);
BEGIN
    -- Get rating contribution (-20 to +20)
    SELECT COALESCE((AVG(rating) - 3) * 10, 0) INTO rating_contrib
    FROM reviews WHERE seller_id = seller_uuid;
    
    -- Get orders contribution (max 15)
    SELECT LEAST(COUNT(*) * 0.5, 15) INTO orders_contrib
    FROM orders WHERE seller_id = seller_uuid AND status = 'completed';
    
    -- Get disputes penalty (recent disputes)
    SELECT COALESCE(COUNT(*) * -2, 0) INTO disputes_penalty
    FROM disputes d 
    WHERE d.seller_id = seller_uuid 
    AND d.created_at >= NOW() - INTERVAL '180 days'
    AND d.status IN ('RESOLVED_BUYER', 'ESCALATED');
    
    -- Get verified bonus
    SELECT CASE WHEN verified THEN 10 ELSE 0 END INTO verified_bonus
    FROM sellers WHERE user_id = seller_uuid;
    
    -- Calculate final score (0-100)
    final_score := base_score + rating_contrib + orders_contrib + disputes_penalty + verified_bonus;
    
    -- Clamp between 0 and 100
    RETURN GREATEST(0, LEAST(100, final_score));
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update reputation when review is added
CREATE OR REPLACE FUNCTION update_seller_reputation_on_review()
RETURNS TRIGGER AS $$
DECLARE
    new_score DECIMAL(5,2);
    breakdown JSONB;
BEGIN
    -- Calculate new reputation score
    new_score := calculate_reputation_score(NEW.seller_id);
    
    -- Create breakdown
    breakdown := jsonb_build_object(
        'base_score', 50,
        'rating_contrib', COALESCE((SELECT (AVG(rating) - 3) * 10 FROM reviews WHERE seller_id = NEW.seller_id), 0),
        'orders_contrib', LEAST((SELECT COUNT(*) * 0.5 FROM orders WHERE seller_id = NEW.seller_id AND status = 'completed'), 15),
        'disputes_penalty', COALESCE((SELECT COUNT(*) * -2 FROM disputes WHERE seller_id = NEW.seller_id AND created_at >= NOW() - INTERVAL '180 days' AND status IN ('RESOLVED_BUYER', 'ESCALATED')), 0),
        'verified_bonus', (SELECT CASE WHEN verified THEN 10 ELSE 0 END FROM sellers WHERE user_id = NEW.seller_id)
    );
    
    -- Insert reputation history
    INSERT INTO reputation_history (seller_id, score, breakdown, reason)
    VALUES (NEW.seller_id, new_score, breakdown, 'Review added: ' || NEW.rating || ' stars');
    
    -- Refresh seller stats
    PERFORM refresh_seller_stats();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for review insertion
CREATE TRIGGER trigger_update_reputation_on_review
    AFTER INSERT ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_reputation_on_review();

-- Create trigger to update seller stats when order status changes
CREATE OR REPLACE FUNCTION update_seller_stats_on_order_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only refresh if order status changed to completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        PERFORM refresh_seller_stats();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order updates
CREATE TRIGGER trigger_update_seller_stats_on_order_change
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_seller_stats_on_order_change();

-- Add comments for documentation
COMMENT ON TABLE sellers IS 'Enhanced seller profiles with trust signals';
COMMENT ON TABLE reviews IS 'Seller reviews tied to completed orders';
COMMENT ON TABLE reputation_history IS 'Historical reputation scores and breakdowns';
COMMENT ON MATERIALIZED VIEW seller_stats IS 'Aggregated seller statistics for performance';
COMMENT ON FUNCTION calculate_reputation_score(UUID) IS 'Calculates reputation score based on reviews, orders, disputes, and verification status';
COMMENT ON FUNCTION refresh_seller_stats() IS 'Refreshes the seller stats materialized view';

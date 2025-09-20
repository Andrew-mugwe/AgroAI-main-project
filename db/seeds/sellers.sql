-- AgroAI Seller Profiles & Trust Signals Demo Data
-- Flow 14.7: Seller Profiles & Trust Signals

-- Create seller_reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS seller_reviews (
    id SERIAL PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert demo sellers with trust signals
INSERT INTO sellers (id, name, location, verified, rating, reviews_count, reputation_score, created_at, updated_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Mary - Farmer', 'Kenya - Makueni', true, 4.8, 120, 95, NOW() - INTERVAL '6 months', NOW()),
    ('22222222-2222-2222-2222-222222222222', 'John - Farmer', 'Uganda - Kampala', true, 4.6, 80, 90, NOW() - INTERVAL '4 months', NOW()),
    ('33333333-3333-3333-3333-333333333333', 'Alice - Trader', 'Rwanda - Kigali', false, 3.9, 20, 60, NOW() - INTERVAL '2 months', NOW()),
    ('44444444-4444-4444-4444-444444444444', 'David - Farmer', 'Tanzania - Dodoma', true, 4.9, 150, 98, NOW() - INTERVAL '8 months', NOW()),
    ('55555555-5555-5555-5555-555555555555', 'Sarah - Trader', 'Kenya - Nairobi', true, 4.7, 95, 92, NOW() - INTERVAL '5 months', NOW()),
    ('66666666-6666-6666-6666-666666666666', 'Michael - Farmer', 'Uganda - Jinja', false, 4.2, 45, 75, NOW() - INTERVAL '3 months', NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location,
    verified = EXCLUDED.verified,
    rating = EXCLUDED.rating,
    reviews_count = EXCLUDED.reviews_count,
    reputation_score = EXCLUDED.reputation_score,
    updated_at = NOW();

-- Insert demo buyers for reviews
INSERT INTO users (id, name, email, role, created_at) VALUES
    ('77777777-7777-7777-7777-777777777777', 'Alex Johnson', 'alex@example.com', 'farmer', NOW() - INTERVAL '1 year'),
    ('88888888-8888-8888-8888-888888888888', 'Emma Wilson', 'emma@example.com', 'farmer', NOW() - INTERVAL '8 months'),
    ('99999999-9999-9999-9999-999999999999', 'Tom Brown', 'tom@example.com', 'trader', NOW() - INTERVAL '6 months'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Lisa Davis', 'lisa@example.com', 'farmer', NOW() - INTERVAL '4 months'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'James Miller', 'james@example.com', 'trader', NOW() - INTERVAL '3 months')
ON CONFLICT (id) DO NOTHING;

-- Insert demo reviews for sellers
INSERT INTO seller_reviews (seller_id, buyer_id, rating, comment, created_at) VALUES
    -- Mary (High reputation seller)
    ('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 5, 'Excellent quality products! Mary is very reliable and her seeds have great germination rates.', NOW() - INTERVAL '2 days'),
    ('11111111-1111-1111-1111-111111111111', '88888888-8888-8888-8888-888888888888', 5, 'Outstanding service and product quality. Highly recommended!', NOW() - INTERVAL '1 week'),
    ('11111111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', 4, 'Good products, fast delivery. Will order again.', NOW() - INTERVAL '2 weeks'),
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 'Perfect! Exactly as described. Great communication.', NOW() - INTERVAL '3 weeks'),
    ('11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4, 'Very satisfied with the quality and service.', NOW() - INTERVAL '1 month'),

    -- John (Good reputation seller)
    ('22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 5, 'Great seller! Products are always fresh and high quality.', NOW() - INTERVAL '3 days'),
    ('22222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 4, 'Good experience overall. Reliable delivery.', NOW() - INTERVAL '1 week'),
    ('22222222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 5, 'Excellent products and service. Highly recommended!', NOW() - INTERVAL '2 weeks'),
    ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, 'Good quality, fair prices. Will buy again.', NOW() - INTERVAL '3 weeks'),

    -- Alice (Lower reputation seller)
    ('33333333-3333-3333-3333-333333333333', '77777777-7777-7777-7777-777777777777', 3, 'Average quality. Could be better.', NOW() - INTERVAL '1 week'),
    ('33333333-3333-3333-3333-333333333333', '88888888-8888-8888-8888-888888888888', 4, 'Decent products but slow shipping.', NOW() - INTERVAL '2 weeks'),
    ('33333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 4, 'Okay experience. Products were as described.', NOW() - INTERVAL '3 weeks'),
    ('33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, 'Not bad but could improve communication.', NOW() - INTERVAL '1 month'),

    -- David (Premium seller)
    ('44444444-4444-4444-4444-444444444444', '77777777-7777-7777-7777-777777777777', 5, 'Outstanding! Best seller on the platform. Premium quality products.', NOW() - INTERVAL '1 day'),
    ('44444444-4444-4444-4444-444444444444', '88888888-8888-8888-8888-888888888888', 5, 'Exceptional service and product quality. David is amazing!', NOW() - INTERVAL '3 days'),
    ('44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 5, 'Perfect in every way. Highly recommended!', NOW() - INTERVAL '1 week'),
    ('44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 5, 'Excellent products and fast delivery. Will definitely order again.', NOW() - INTERVAL '2 weeks'),
    ('44444444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4, 'Great quality products. Very satisfied.', NOW() - INTERVAL '3 weeks'),

    -- Sarah (Good trader)
    ('55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 5, 'Professional trader with excellent products.', NOW() - INTERVAL '2 days'),
    ('55555555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', 4, 'Good experience. Reliable and trustworthy.', NOW() - INTERVAL '1 week'),
    ('55555555-5555-5555-5555-555555555555', '99999999-9999-9999-9999-999999999999', 5, 'Excellent trader! Great products and service.', NOW() - INTERVAL '2 weeks'),
    ('55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, 'Good quality products. Recommended.', NOW() - INTERVAL '3 weeks'),

    -- Michael (New seller)
    ('66666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 4, 'Good products for a new seller. Keep it up!', NOW() - INTERVAL '1 week'),
    ('66666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', 4, 'Decent quality. Shows promise.', NOW() - INTERVAL '2 weeks'),
    ('66666666-6666-6666-6666-666666666666', '99999999-9999-9999-9999-999999999999', 5, 'Great products! Looking forward to more.', NOW() - INTERVAL '3 weeks'),
    ('66666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 4, 'Good experience overall.', NOW() - INTERVAL '1 month');

-- Update marketplace_products to link to sellers
UPDATE marketplace_products 
SET seller_id = '11111111-1111-1111-1111-111111111111' 
WHERE id IN ('demo-1', 'demo-2');

UPDATE marketplace_products 
SET seller_id = '22222222-2222-2222-2222-222222222222' 
WHERE id = 'demo-3';

UPDATE marketplace_products 
SET seller_id = '33333333-3333-3333-3333-333333333333' 
WHERE id = 'demo-4';

UPDATE marketplace_products 
SET seller_id = '44444444-4444-4444-4444-444444444444' 
WHERE id = 'demo-5';

UPDATE marketplace_products 
SET seller_id = '55555555-5555-5555-5555-555555555555' 
WHERE id = 'demo-6';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_seller_reviews_seller_id ON seller_reviews(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_buyer_id ON seller_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_rating ON seller_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_seller_reviews_created_at ON seller_reviews(created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE seller_reviews IS 'Reviews and ratings for sellers in AgroAI Marketplace';
COMMENT ON COLUMN seller_reviews.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN seller_reviews.comment IS 'Optional text review from buyer';

-- Display summary of seeded data
SELECT 
    'Sellers seeded successfully!' as status,
    COUNT(*) as total_sellers,
    COUNT(CASE WHEN verified = true THEN 1 END) as verified_sellers,
    ROUND(AVG(rating), 2) as avg_rating,
    SUM(reviews_count) as total_reviews
FROM sellers;

-- AgroAI Reputation & Ratings Demo Data
-- This file contains sample data for testing the reputation system

-- Insert demo sellers with verification status
INSERT INTO users (id, name, email, role, verified, created_at) VALUES
    ('890e1234-e89b-12d3-a456-426614174003', 'Green Valley Farms', 'info@greenvalleyfarms.com', 'trader', true, NOW() - INTERVAL '6 months'),
    ('901e2345-e89b-12d3-a456-426614174007', 'Organic Harvest Co', 'contact@organicharvest.co', 'trader', true, NOW() - INTERVAL '4 months'),
    ('012e3456-e89b-12d3-a456-426614174011', 'Fresh Produce Ltd', 'hello@freshproduce.com', 'trader', false, NOW() - INTERVAL '3 months'),
    ('123e4567-e89b-12d3-a456-426614174015', 'Local Garden Store', 'sales@localgarden.com', 'trader', false, NOW() - INTERVAL '2 months'),
    ('234e5678-e89b-12d3-a456-426614174019', 'Premium Seeds Co', 'info@premiumseeds.com', 'trader', true, NOW() - INTERVAL '8 months')
ON CONFLICT (id) DO UPDATE SET verified = EXCLUDED.verified;

-- Insert demo orders
INSERT INTO orders (id, seller_id, buyer_id, status, total_amount, currency, created_at) VALUES
    (1, '890e1234-e89b-12d3-a456-426614174003', '789e0123-e89b-12d3-a456-426614174002', 'completed', 45.99, 'USD', NOW() - INTERVAL '30 days'),
    (2, '901e2345-e89b-12d3-a456-426614174007', '890e1234-e89b-12d3-a456-426614174006', 'completed', 32.50, 'USD', NOW() - INTERVAL '25 days'),
    (3, '012e3456-e89b-12d3-a456-426614174011', '901e2345-e89b-12d3-a456-426614174010', 'completed', 28.75, 'USD', NOW() - INTERVAL '20 days'),
    (4, '890e1234-e89b-12d3-a456-426614174003', '012e3456-e89b-12d3-a456-426614174012', 'completed', 52.25, 'USD', NOW() - INTERVAL '15 days'),
    (5, '123e4567-e89b-12d3-a456-426614174015', '234e5678-e89b-12d3-a456-426614174016', 'completed', 18.99, 'USD', NOW() - INTERVAL '10 days'),
    (6, '234e5678-e89b-12d3-a456-426614174019', '345e6789-e89b-12d3-a456-426614174020', 'completed', 67.80, 'USD', NOW() - INTERVAL '5 days'),
    (7, '890e1234-e89b-12d3-a456-426614174003', '456e7890-e89b-12d3-a456-426614174024', 'completed', 41.30, 'USD', NOW() - INTERVAL '3 days'),
    (8, '901e2345-e89b-12d3-a456-426614174007', '567e8901-e89b-12d3-a456-426614174028', 'completed', 35.60, 'USD', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Insert demo ratings
INSERT INTO ratings (order_id, reviewer_id, seller_id, rating, review, created_at) VALUES
    -- Green Valley Farms (High reputation)
    (1, '789e0123-e89b-12d3-a456-426614174002', '890e1234-e89b-12d3-a456-426614174003', 5, 'Excellent quality products, fast delivery! Highly recommended.', NOW() - INTERVAL '29 days'),
    (4, '012e3456-e89b-12d3-a456-426614174012', '890e1234-e89b-12d3-a456-426614174003', 5, 'Perfect! Great communication and packaging. Will order again.', NOW() - INTERVAL '14 days'),
    (7, '456e7890-e89b-12d3-a456-426614174024', '890e1234-e89b-12d3-a456-426614174003', 4, 'Good seller, products as described. Minor delay but overall satisfied.', NOW() - INTERVAL '2 days'),
    
    -- Organic Harvest Co (Good reputation)
    (2, '890e1234-e89b-12d3-a456-426614174006', '901e2345-e89b-12d3-a456-426614174007', 4, 'Good quality organic products. Fair pricing and reliable delivery.', NOW() - INTERVAL '24 days'),
    (8, '567e8901-e89b-12d3-a456-426614174028', '901e2345-e89b-12d3-a456-426614174007', 3, 'Average experience. Products were okay but shipping was slow.', NOW() - INTERVAL '1 day'),
    
    -- Fresh Produce Ltd (Fair reputation)
    (3, '901e2345-e89b-12d3-a456-426614174010', '012e3456-e89b-12d3-a456-426614174011', 3, 'Decent products but customer service could be better.', NOW() - INTERVAL '19 days'),
    
    -- Local Garden Store (Low reputation)
    (5, '234e5678-e89b-12d3-a456-426614174016', '123e4567-e89b-12d3-a456-426614174015', 2, 'Product quality was not as expected. Poor packaging.', NOW() - INTERVAL '9 days'),
    
    -- Premium Seeds Co (New seller)
    (6, '345e6789-e89b-12d3-a456-426614174020', '234e5678-e89b-12d3-a456-426614174019', 5, 'Excellent seed quality! Fast germination and great results.', NOW() - INTERVAL '4 days');

-- Insert demo disputes (for penalty testing)
INSERT INTO disputes (id, escrow_id, order_id, buyer_id, seller_id, status, reason, description, evidence, created_at) VALUES
    ('d1e4567-e89b-12d3-a456-426614174001', 'e1e4567-e89b-12d3-a456-426614174001', 9, '789e0123-e89b-12d3-a456-426614174002', '901e2345-e89b-12d3-a456-426614174007', 'RESOLVED_BUYER', 'undelivered', 'Package never arrived despite tracking showing delivered', ARRAY['tracking_screenshot.png'], NOW() - INTERVAL '60 days'),
    ('d2e4567-e89b-12d3-a456-426614174002', 'e2e4567-e89b-12d3-a456-426614174002', 10, '890e1234-e89b-12d3-a456-426614174006', '123e4567-e89b-12d3-a456-426614174015', 'RESOLVED_BUYER', 'damaged', 'Items arrived damaged and unusable', ARRAY['damage_photo_1.jpg', 'damage_photo_2.jpg'], NOW() - INTERVAL '45 days');

-- Insert additional demo orders for disputes
INSERT INTO orders (id, seller_id, buyer_id, status, total_amount, currency, created_at) VALUES
    (9, '901e2345-e89b-12d3-a456-426614174007', '789e0123-e89b-12d3-a456-426614174002', 'completed', 38.50, 'USD', NOW() - INTERVAL '65 days'),
    (10, '123e4567-e89b-12d3-a456-426614174015', '890e1234-e89b-12d3-a456-426614174006', 'completed', 22.75, 'USD', NOW() - INTERVAL '50 days')
ON CONFLICT (id) DO NOTHING;

-- Insert initial reputation history for demo sellers
INSERT INTO reputation_history (user_id, score, reason, metadata, created_at) VALUES
    ('890e1234-e89b-12d3-a456-426614174003', 87.5, 'Initial reputation calculation', '{"rating_contrib": 45.0, "orders_contrib": 15.0, "disputes_penalty": 0, "verified_bonus": 10.0, "total_ratings": 3, "total_orders": 30}', NOW() - INTERVAL '1 month'),
    ('901e2345-e89b-12d3-a456-426614174007', 78.0, 'Initial reputation calculation', '{"rating_contrib": 35.0, "orders_contrib": 12.5, "disputes_penalty": -2.0, "verified_bonus": 10.0, "total_ratings": 2, "total_orders": 25}', NOW() - INTERVAL '1 month'),
    ('012e3456-e89b-12d3-a456-426614174011', 65.5, 'Initial reputation calculation', '{"rating_contrib": 30.0, "orders_contrib": 8.0, "disputes_penalty": 0, "verified_bonus": 0.0, "total_ratings": 1, "total_orders": 16}', NOW() - INTERVAL '1 month'),
    ('123e4567-e89b-12d3-a456-426614174015', 42.3, 'Initial reputation calculation', '{"rating_contrib": 15.0, "orders_contrib": 4.0, "disputes_penalty": -4.0, "verified_bonus": 0.0, "total_ratings": 1, "total_orders": 8}', NOW() - INTERVAL '1 month'),
    ('234e5678-e89b-12d3-a456-426614174019', 75.0, 'Initial reputation calculation', '{"rating_contrib": 50.0, "orders_contrib": 10.0, "disputes_penalty": 0, "verified_bonus": 10.0, "total_ratings": 1, "total_orders": 20}', NOW() - INTERVAL '1 week');

-- Update reputation history with recent changes
INSERT INTO reputation_history (user_id, score, reason, metadata, created_at) VALUES
    ('890e1234-e89b-12d3-a456-426614174003', 88.0, 'New rating added: 4 stars', '{"rating_contrib": 45.5, "orders_contrib": 15.0, "disputes_penalty": 0, "verified_bonus": 10.0, "total_ratings": 4, "total_orders": 30}', NOW() - INTERVAL '2 days'),
    ('901e2345-e89b-12d3-a456-426614174007', 77.0, 'New rating added: 3 stars', '{"rating_contrib": 35.0, "orders_contrib": 12.5, "disputes_penalty": -2.0, "verified_bonus": 10.0, "total_ratings": 3, "total_orders": 25}', NOW() - INTERVAL '1 day'),
    ('234e5678-e89b-12d3-a456-426614174019', 76.0, 'New rating added: 5 stars', '{"rating_contrib": 50.0, "orders_contrib": 10.0, "disputes_penalty": 0, "verified_bonus": 10.0, "total_ratings": 2, "total_orders": 20}', NOW() - INTERVAL '4 days');

-- Insert demo users (buyers)
INSERT INTO users (id, name, email, role, created_at) VALUES
    ('789e0123-e89b-12d3-a456-426614174002', 'Alex Johnson', 'alex.johnson@email.com', 'buyer', NOW() - INTERVAL '1 year'),
    ('890e1234-e89b-12d3-a456-426614174006', 'Sarah Wilson', 'sarah.wilson@email.com', 'buyer', NOW() - INTERVAL '8 months'),
    ('901e2345-e89b-12d3-a456-426614174010', 'Mike Chen', 'mike.chen@email.com', 'buyer', NOW() - INTERVAL '6 months'),
    ('012e3456-e89b-12d3-a456-426614174012', 'Emma Davis', 'emma.davis@email.com', 'buyer', NOW() - INTERVAL '4 months'),
    ('234e5678-e89b-12d3-a456-426614174016', 'David Brown', 'david.brown@email.com', 'buyer', NOW() - INTERVAL '3 months'),
    ('345e6789-e89b-12d3-a456-426614174020', 'Lisa Garcia', 'lisa.garcia@email.com', 'buyer', NOW() - INTERVAL '2 months'),
    ('456e7890-e89b-12d3-a456-426614174024', 'Tom Anderson', 'tom.anderson@email.com', 'buyer', NOW() - INTERVAL '1 month'),
    ('567e8901-e89b-12d3-a456-426614174028', 'Rachel Lee', 'rachel.lee@email.com', 'buyer', NOW() - INTERVAL '2 weeks')
ON CONFLICT (id) DO NOTHING;

-- Create summary view for easy querying
CREATE OR REPLACE VIEW demo_reputation_summary AS
SELECT 
    u.id as seller_id,
    u.name as seller_name,
    u.verified,
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
    ), 50.0) as current_reputation_score,
    COUNT(DISTINCT o.id) as total_orders
FROM users u
LEFT JOIN ratings r ON u.id = r.seller_id
LEFT JOIN orders o ON u.id = o.seller_id AND o.status = 'completed'
WHERE u.role = 'trader'
GROUP BY u.id, u.name, u.verified;

-- Display demo data summary
SELECT 
    seller_name,
    CASE WHEN verified THEN '✅' ELSE '❌' END as verified,
    ROUND(current_reputation_score::numeric, 1) as score,
    total_ratings as reviews,
    total_orders as orders
FROM demo_reputation_summary
ORDER BY current_reputation_score DESC;

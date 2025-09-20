-- Seed data for sellers and reviews
-- Created: 2025-01-15
-- Description: Flow 14.9 — Seller Profiles & Trust System Demo Data

-- First, ensure we have demo users to link to sellers
-- These should match existing demo users or create new ones if needed
INSERT INTO users (id, email, name, role, created_at, updated_at) VALUES
-- Seller users
('550e8400-e29b-41d4-a716-446655440001', 'mary.kenya@example.com', 'Mary Kenya', 'trader', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440002', 'john.uganda@example.com', 'John Uganda', 'trader', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440003', 'nairobi.trader@example.com', 'Nairobi Trader', 'trader', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440004', 'dodoma.ngo@example.com', 'Dodoma NGO', 'trader', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440005', 'rwanda.trader@example.com', 'Rwanda Trader', 'trader', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440006', 'ethiopia.farmer@example.com', 'Ethiopia Farmer', 'trader', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440007', 'tanzania.coop@example.com', 'Tanzania Cooperative', 'trader', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440008', 'ghana.agri@example.com', 'Ghana Agriculture', 'trader', NOW(), NOW()),

-- Buyer users for reviews
('550e8400-e29b-41d4-a716-446655440010', 'buyer1@example.com', 'Alex Johnson', 'farmer', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440011', 'buyer2@example.com', 'Sarah Wilson', 'farmer', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440012', 'buyer3@example.com', 'Mike Chen', 'farmer', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440013', 'buyer4@example.com', 'Lisa Anderson', 'farmer', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440014', 'buyer5@example.com', 'David Brown', 'farmer', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440015', 'buyer6@example.com', 'Emma Davis', 'farmer', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440016', 'buyer7@example.com', 'James Miller', 'farmer', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440017', 'buyer8@example.com', 'Maria Garcia', 'farmer', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create demo sellers with enhanced profiles
INSERT INTO sellers (id, user_id, name, bio, profile_image, location, verified, created_at, updated_at) VALUES
-- Mary Kenya - Verified Premium Seller
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Mary Kenya', 
 'Experienced coffee farmer with 15 years in sustainable agriculture. Specializing in premium Arabica coffee beans from the highlands of Kenya. Committed to fair trade and organic farming practices.',
 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
 '{"country": "Kenya", "city": "Nairobi", "lat": -1.2921, "lng": 36.8219}',
 true, NOW() - INTERVAL '2 years', NOW()),

-- John Uganda - Verified Enterprise Seller
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'John Uganda',
 'Agricultural cooperative leader specializing in maize, beans, and cassava. Leading a network of 500+ farmers across Uganda. Focus on food security and sustainable farming techniques.',
 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
 '{"country": "Uganda", "city": "Kampala", "lat": 0.3476, "lng": 32.5825}',
 true, NOW() - INTERVAL '18 months', NOW()),

-- Nairobi Trader - Non-verified
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Nairobi Trader',
 'Small-scale trader focusing on vegetable seeds and fertilizers. Building reputation through quality products and customer service.',
 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
 '{"country": "Kenya", "city": "Nairobi", "lat": -1.2921, "lng": 36.8219}',
 false, NOW() - INTERVAL '6 months', NOW()),

-- Dodoma NGO - Verified NGO Seller
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Dodoma NGO',
 'Non-profit organization supporting smallholder farmers in Tanzania. Providing quality seeds, training, and market access. Committed to community development and food security.',
 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
 '{"country": "Tanzania", "city": "Dodoma", "lat": -6.1630, "lng": 35.7516}',
 true, NOW() - INTERVAL '3 years', NOW()),

-- Rwanda Trader - Verified High-Reputation
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', 'Rwanda Trader',
 'Specialist in high-altitude crops including potatoes, beans, and coffee. Working with cooperatives across Rwanda to provide premium agricultural products.',
 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
 '{"country": "Rwanda", "city": "Kigali", "lat": -1.9441, "lng": 30.0619}',
 true, NOW() - INTERVAL '2 years', NOW()),

-- Ethiopia Farmer - Unverified
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', 'Ethiopia Farmer',
 'Traditional farmer growing teff, barley, and various vegetables. Focus on organic and traditional farming methods passed down through generations.',
 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
 '{"country": "Ethiopia", "city": "Addis Ababa", "lat": 9.1450, "lng": 38.7667}',
 false, NOW() - INTERVAL '4 months', NOW()),

-- Tanzania Cooperative - Verified
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', 'Tanzania Cooperative',
 'Agricultural cooperative representing 300+ farmers. Specializing in cashew nuts, cotton, and sunflower seeds. Committed to fair pricing and sustainable practices.',
 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
 '{"country": "Tanzania", "city": "Arusha", "lat": -3.3869, "lng": 36.6830}',
 true, NOW() - INTERVAL '1 year', NOW()),

-- Ghana Agriculture - Verified
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', 'Ghana Agriculture',
 'Large-scale agricultural enterprise specializing in cocoa, palm oil, and cassava. Modern farming techniques with focus on productivity and sustainability.',
 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face',
 '{"country": "Ghana", "city": "Accra", "lat": 5.6037, "lng": -0.1870}',
 true, NOW() - INTERVAL '2 years', NOW());

-- Create demo orders for review purposes
INSERT INTO orders (id, user_id, seller_id, status, subtotal, tax_amount, shipping_amount, total_amount, currency, payment_status, payment_method, shipping_address, billing_address, notes, created_at, updated_at) VALUES
-- Completed orders for reviews
('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'completed', 250.00, 25.00, 15.00, 290.00, 'KES', 'paid', 'stripe', '{"first_name": "Alex", "last_name": "Johnson", "address1": "123 Main St", "city": "Nairobi", "state": "Nairobi", "postal_code": "00100", "country": "Kenya"}', '{"first_name": "Alex", "last_name": "Johnson", "address1": "123 Main St", "city": "Nairobi", "state": "Nairobi", "postal_code": "00100", "country": "Kenya"}', 'Coffee beans order', NOW() - INTERVAL '30 days', NOW()),
('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'completed', 180.00, 18.00, 12.00, 210.00, 'KES', 'paid', 'mpesa', '{"first_name": "Sarah", "last_name": "Wilson", "address1": "456 Oak Ave", "city": "Mombasa", "state": "Coast", "postal_code": "80100", "country": "Kenya"}', '{"first_name": "Sarah", "last_name": "Wilson", "address1": "456 Oak Ave", "city": "Mombasa", "state": "Coast", "postal_code": "80100", "country": "Kenya"}', 'Coffee order', NOW() - INTERVAL '25 days', NOW()),
('770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 'completed', 320.00, 32.00, 20.00, 372.00, 'UGX', 'paid', 'stripe', '{"first_name": "Mike", "last_name": "Chen", "address1": "789 Pine St", "city": "Kampala", "state": "Central", "postal_code": "256", "country": "Uganda"}', '{"first_name": "Mike", "last_name": "Chen", "address1": "789 Pine St", "city": "Kampala", "state": "Central", "postal_code": "256", "country": "Uganda"}', 'Maize seeds', NOW() - INTERVAL '20 days', NOW()),
('770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 'completed', 150.00, 15.00, 10.00, 175.00, 'UGX', 'paid', 'mpesa', '{"first_name": "Lisa", "last_name": "Anderson", "address1": "321 Elm St", "city": "Entebbe", "state": "Central", "postal_code": "256", "country": "Uganda"}', '{"first_name": "Lisa", "last_name": "Anderson", "address1": "321 Elm St", "city": "Entebbe", "state": "Central", "postal_code": "256", "country": "Uganda"}', 'Bean seeds', NOW() - INTERVAL '15 days', NOW()),
('770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 'completed', 95.00, 9.50, 8.00, 112.50, 'KES', 'paid', 'stripe', '{"first_name": "David", "last_name": "Brown", "address1": "654 Maple Ave", "city": "Nairobi", "state": "Nairobi", "postal_code": "00200", "country": "Kenya"}', '{"first_name": "David", "last_name": "Brown", "address1": "654 Maple Ave", "city": "Nairobi", "state": "Nairobi", "postal_code": "00200", "country": "Kenya"}', 'Vegetable seeds', NOW() - INTERVAL '10 days', NOW()),
('770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', 'completed', 200.00, 20.00, 15.00, 235.00, 'TZS', 'paid', 'stripe', '{"first_name": "Emma", "last_name": "Davis", "address1": "987 Cedar St", "city": "Dodoma", "state": "Dodoma", "postal_code": "41101", "country": "Tanzania"}', '{"first_name": "Emma", "last_name": "Davis", "address1": "987 Cedar St", "city": "Dodoma", "state": "Dodoma", "postal_code": "41101", "country": "Tanzania"}', 'NGO seeds', NOW() - INTERVAL '8 days', NOW()),
('770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440005', 'completed', 280.00, 28.00, 18.00, 326.00, 'RWF', 'paid', 'stripe', '{"first_name": "James", "last_name": "Miller", "address1": "147 Birch Ave", "city": "Kigali", "state": "Kigali", "postal_code": "001", "country": "Rwanda"}', '{"first_name": "James", "last_name": "Miller", "address1": "147 Birch Ave", "city": "Kigali", "state": "Kigali", "postal_code": "001", "country": "Rwanda"}', 'Potato seeds', NOW() - INTERVAL '5 days', NOW()),
('770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440005', 'completed', 160.00, 16.00, 12.00, 188.00, 'RWF', 'paid', 'mpesa', '{"first_name": "Maria", "last_name": "Garcia", "address1": "258 Spruce St", "city": "Butare", "state": "Southern", "postal_code": "001", "country": "Rwanda"}', '{"first_name": "Maria", "last_name": "Garcia", "address1": "258 Spruce St", "city": "Butare", "state": "Southern", "postal_code": "001", "country": "Rwanda"}', 'Coffee beans', NOW() - INTERVAL '3 days', NOW());

-- Create demo reviews with varied ratings
INSERT INTO reviews (id, order_id, buyer_id, seller_id, rating, comment, created_at) VALUES
-- Mary Kenya Reviews (High ratings)
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 5, 
 'Excellent quality coffee beans! Mary''s attention to detail and sustainable farming practices really show in the final product. Will definitely order again.', NOW() - INTERVAL '30 days'),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 5,
 'Outstanding coffee! Fast shipping and excellent packaging. Mary is a trusted seller with great communication.', NOW() - INTERVAL '25 days'),

-- John Uganda Reviews (Mixed ratings)
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 4,
 'Good quality maize seeds. John''s cooperative has a solid reputation. Delivery was prompt and seeds were well packaged.', NOW() - INTERVAL '20 days'),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 3,
 'Decent bean seeds but some packaging issues. Communication could be better, but overall acceptable quality.', NOW() - INTERVAL '15 days'),

-- Nairobi Trader Reviews (Lower ratings)
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 3,
 'Vegetable seeds were okay but not exceptional. Some seeds didn''t germinate well. Seller is responsive but needs to improve quality control.', NOW() - INTERVAL '10 days'),

-- Dodoma NGO Reviews (High ratings)
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', 5,
 'Excellent NGO with great mission! Seeds are high quality and they provide excellent support to farmers. Highly recommend!', NOW() - INTERVAL '8 days'),

-- Rwanda Trader Reviews (Mixed ratings)
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440005', 4,
 'Good potato seeds with high germination rate. Rwanda Trader has good knowledge of high-altitude farming.', NOW() - INTERVAL '5 days'),
('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440005', 5,
 'Premium coffee beans from Rwanda! Excellent quality and fast shipping. Will definitely order again.', NOW() - INTERVAL '3 days');

-- Create additional reviews to show reputation variability
INSERT INTO reviews (id, order_id, buyer_id, seller_id, rating, comment, created_at) VALUES
-- More reviews for Mary Kenya (maintaining high reputation)
('880e8400-e29b-41d4-a716-446655440009', NULL, '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 5,
 'Mary''s coffee beans are consistently excellent. Great for both home brewing and small business use.', NOW() - INTERVAL '45 days'),
('880e8400-e29b-41d4-a716-446655440010', NULL, '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 5,
 'Outstanding seller with excellent communication and product quality. Highly recommended!', NOW() - INTERVAL '40 days'),

-- More reviews for John Uganda
('880e8400-e29b-41d4-a716-446655440011', NULL, '550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440002', 4,
 'Good cooperative with fair pricing. Seeds are reliable and delivery is consistent.', NOW() - INTERVAL '35 days'),
('880e8400-e29b-41d4-a716-446655440012', NULL, '550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440002', 2,
 'Had issues with seed quality this time. Some didn''t germinate properly. Need to improve quality control.', NOW() - INTERVAL '30 days'),

-- More reviews for Dodoma NGO
('880e8400-e29b-41d4-a716-446655440013', NULL, '550e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440004', 5,
 'Great NGO doing important work! Seeds are excellent and they provide valuable support.', NOW() - INTERVAL '25 days'),
('880e8400-e29b-41d4-a716-446655440014', NULL, '550e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440004', 5,
 'Reliable partner for agricultural inputs. Quality seeds and excellent customer service.', NOW() - INTERVAL '20 days'),

-- Reviews for Tanzania Cooperative
('880e8400-e29b-41d4-a716-446655440015', NULL, '550e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440007', 4,
 'Good cooperative with quality products. Cashew nuts were excellent quality.', NOW() - INTERVAL '15 days'),
('880e8400-e29b-41d4-a716-446655440016', NULL, '550e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440007', 4,
 'Reliable supplier with good communication. Cotton seeds performed well.', NOW() - INTERVAL '12 days'),

-- Reviews for Ghana Agriculture
('880e8400-e29b-41d4-a716-446655440017', NULL, '550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440008', 4,
 'Large scale operation with good logistics. Cocoa beans were high quality.', NOW() - INTERVAL '10 days'),
('880e8400-e29b-41d4-a716-446655440018', NULL, '550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440008', 3,
 'Good products but delivery was slower than expected. Quality was acceptable.', NOW() - INTERVAL '8 days');

-- Refresh seller stats to calculate current statistics
SELECT refresh_seller_stats();

-- Update marketplace products to link to sellers
UPDATE marketplace_products SET seller_id = '550e8400-e29b-41d4-a716-446655440001' WHERE name ILIKE '%coffee%';
UPDATE marketplace_products SET seller_id = '550e8400-e29b-41d4-a716-446655440002' WHERE name ILIKE '%maize%' OR name ILIKE '%bean%';
UPDATE marketplace_products SET seller_id = '550e8400-e29b-41d4-a716-446655440003' WHERE name ILIKE '%vegetable%' OR name ILIKE '%tomato%';
UPDATE marketplace_products SET seller_id = '550e8400-e29b-41d4-a716-446655440004' WHERE name ILIKE '%seed%' AND seller_id IS NULL;
UPDATE marketplace_products SET seller_id = '550e8400-e29b-41d4-a716-446655440005' WHERE name ILIKE '%potato%' OR name ILIKE '%cassava%';
UPDATE marketplace_products SET seller_id = '550e8400-e29b-41d4-a716-446655440006' WHERE name ILIKE '%teff%' OR name ILIKE '%barley%';
UPDATE marketplace_products SET seller_id = '550e8400-e29b-41d4-a716-446655440007' WHERE name ILIKE '%cashew%' OR name ILIKE '%cotton%';
UPDATE marketplace_products SET seller_id = '550e8400-e29b-41d4-a716-446655440008' WHERE name ILIKE '%cocoa%' OR name ILIKE '%palm%';

-- Set any remaining products to random sellers
UPDATE marketplace_products 
SET seller_id = (
  SELECT user_id FROM sellers 
  ORDER BY RANDOM() 
  LIMIT 1
)
WHERE seller_id IS NULL;

-- Add some reputation history entries
INSERT INTO reputation_history (seller_id, score, breakdown, reason, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 95.5, '{"base_score": 50, "rating_contrib": 20, "orders_contrib": 15, "disputes_penalty": 0, "verified_bonus": 10}', 'Initial reputation calculation', NOW() - INTERVAL '30 days'),
('550e8400-e29b-41d4-a716-446655440002', 78.2, '{"base_score": 50, "rating_contrib": 7, "orders_contrib": 12, "disputes_penalty": -2, "verified_bonus": 10}', 'Reputation after mixed reviews', NOW() - INTERVAL '25 days'),
('550e8400-e29b-41d4-a716-446655440003', 45.8, '{"base_score": 50, "rating_contrib": -10, "orders_contrib": 8, "disputes_penalty": -2, "verified_bonus": 0}', 'New seller building reputation', NOW() - INTERVAL '10 days'),
('550e8400-e29b-41d4-a716-446655440004', 92.3, '{"base_score": 50, "rating_contrib": 20, "orders_contrib": 12, "disputes_penalty": 0, "verified_bonus": 10}', 'NGO with excellent reviews', NOW() - INTERVAL '8 days'),
('550e8400-e29b-41d4-a716-446655440005', 85.7, '{"base_score": 50, "rating_contrib": 15, "orders_contrib": 10, "disputes_penalty": 0, "verified_bonus": 10}', 'High-altitude specialist', NOW() - INTERVAL '5 days');

-- Final refresh of seller stats
SELECT refresh_seller_stats();

-- Display summary of seeded data
SELECT 
  'Sellers seeded' as category,
  COUNT(*) as count
FROM sellers
UNION ALL
SELECT 
  'Reviews seeded',
  COUNT(*)
FROM reviews
UNION ALL
SELECT 
  'Orders seeded',
  COUNT(*)
FROM orders
UNION ALL
SELECT 
  'Products linked to sellers',
  COUNT(*)
FROM marketplace_products
WHERE seller_id IS NOT NULL;

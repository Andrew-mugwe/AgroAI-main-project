-- AgroAI Marketplace Demo Products Seed Data
-- Flow 14.1: Marketplace UI Polish - Demo Listings

-- Clear existing demo data
DELETE FROM marketplace_products WHERE id IN ('demo-1', 'demo-2', 'demo-3', 'demo-4', 'demo-5', 'demo-6');

-- Insert demo products with trust signals
INSERT INTO marketplace_products (
    id,
    trader_id,
    name,
    description,
    price,
    currency,
    stock_quantity,
    category,
    image_url,
    status,
    location,
    seller_name,
    seller_verified,
    seller_trust_score,
    seller_verification_type,
    seller_location,
    seller_country,
    seller_region,
    rating,
    review_count,
    created_at,
    updated_at
) VALUES 
-- 1. Maize Seeds (50kg bag) - $25 - Farmer (Kenya, Verified)
(
    'demo-1',
    'trader-001',
    'Premium Maize Seeds (Drought Resistant)',
    'High-yield maize seeds resistant to drought conditions. Perfect for dry season farming. Certified organic with 95% germination rate.',
    25.00,
    'USD',
    500,
    'seeds',
    '/images/products/maize-seeds.jpg',
    'active',
    'Nairobi, Kenya',
    'AgriTech Solutions Ltd',
    true,
    98,
    'premium',
    'Nairobi',
    'Kenya',
    'Central',
    4.8,
    156,
    NOW(),
    NOW()
),

-- 2. Beans (50kg bag) - $30 - Farmer (Uganda, Verified)
(
    'demo-2',
    'trader-002',
    'Organic Beans (50kg bag)',
    'Premium organic beans grown in fertile Ugandan soil. Rich in protein and nutrients. Perfect for both local and export markets.',
    30.00,
    'USD',
    300,
    'seeds',
    '/images/products/beans.jpg',
    'active',
    'Kampala, Uganda',
    'Uganda Farmers Co-op',
    true,
    95,
    'basic',
    'Kampala',
    'Uganda',
    'Central',
    4.6,
    89,
    NOW(),
    NOW()
),

-- 3. Fertilizer (DAP, 50kg) - $40 - Trader (Kenya, Non-verified)
(
    'demo-3',
    'trader-003',
    'DAP Fertilizer (50kg)',
    'High-quality DAP fertilizer for improved crop yield. Contains 18% nitrogen and 46% phosphorus. Suitable for all crops.',
    40.00,
    'USD',
    200,
    'fertilizers',
    '/images/products/fertilizer.jpg',
    'active',
    'Mombasa, Kenya',
    'East Africa Fertilizers',
    false,
    75,
    'basic',
    'Mombasa',
    'Kenya',
    'Coast',
    4.2,
    45,
    NOW(),
    NOW()
),

-- 4. Irrigation Kit (Drip system) - $120 - NGO (Tanzania, Verified)
(
    'demo-4',
    'trader-004',
    'Smart Irrigation Kit (Drip System)',
    'Complete drip irrigation system with smart controller. Water-efficient technology for sustainable farming. Includes installation guide.',
    120.00,
    'USD',
    50,
    'tools',
    '/images/products/irrigation-kit.jpg',
    'active',
    'Dar es Salaam, Tanzania',
    'Tanzania Agricultural NGO',
    true,
    92,
    'enterprise',
    'Dar es Salaam',
    'Tanzania',
    'Dar es Salaam',
    4.9,
    78,
    NOW(),
    NOW()
),

-- 5. Pesticide (Fall Armyworm control) - $15 - Trader (Rwanda, Verified)
(
    'demo-5',
    'trader-005',
    'Fall Armyworm Control Pesticide',
    'Effective organic pesticide for Fall Armyworm control. Safe for beneficial insects and environment. 1L bottle treats 1 acre.',
    15.00,
    'USD',
    150,
    'pesticides',
    '/images/products/pesticide.jpg',
    'active',
    'Kigali, Rwanda',
    'Rwanda Crop Protection',
    true,
    88,
    'premium',
    'Kigali',
    'Rwanda',
    'Kigali',
    4.5,
    124,
    NOW(),
    NOW()
),

-- 6. Solar Dryer - $200 - Farmer (Kenya, Verified)
(
    'demo-6',
    'trader-006',
    'Solar-Powered Crop Dryer',
    'Eco-friendly solar dryer for post-harvest processing. Reduces post-harvest losses by 80%. Perfect for grains, fruits, and vegetables.',
    200.00,
    'USD',
    25,
    'tools',
    '/images/products/solar-dryer.jpg',
    'active',
    'Nakuru, Kenya',
    'Green Energy Farmers',
    true,
    96,
    'enterprise',
    'Nakuru',
    'Kenya',
    'Rift Valley',
    4.7,
    92,
    NOW(),
    NOW()
);

-- Update product categories enum if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'seeds' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_category')) THEN
        ALTER TYPE product_category ADD VALUE 'seeds';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'fertilizers' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_category')) THEN
        ALTER TYPE product_category ADD VALUE 'fertilizers';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'pesticides' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_category')) THEN
        ALTER TYPE product_category ADD VALUE 'pesticides';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'tools' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_category')) THEN
        ALTER TYPE product_category ADD VALUE 'tools';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'harvest' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'product_category')) THEN
        ALTER TYPE product_category ADD VALUE 'harvest';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON marketplace_products(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_seller_verified ON marketplace_products(seller_verified);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_rating ON marketplace_products(rating);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_location ON marketplace_products(location);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_status ON marketplace_products(status);

-- Add comments for documentation
COMMENT ON TABLE marketplace_products IS 'AgroAI Marketplace Products - Demo data for Flow 14.1';
COMMENT ON COLUMN marketplace_products.seller_verified IS 'Whether the seller has been verified (trust signal)';
COMMENT ON COLUMN marketplace_products.seller_trust_score IS 'Seller trust score (0-100)';
COMMENT ON COLUMN marketplace_products.seller_verification_type IS 'Type of verification: basic, premium, enterprise';
COMMENT ON COLUMN marketplace_products.rating IS 'Product rating (1-5 stars)';
COMMENT ON COLUMN marketplace_products.review_count IS 'Number of reviews for this product';



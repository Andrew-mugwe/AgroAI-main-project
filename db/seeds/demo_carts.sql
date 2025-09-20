-- Demo Cart Seeds for AgroAI Marketplace
-- These carts demonstrate different payment scenarios

-- Cart 1: Maize + Fertilizer (Stripe, USD)
INSERT INTO demo_carts (id, user_id, items, total_amount, currency, payment_method, created_at) VALUES (
  'demo_cart_1',
  'demo_user_1',
  '[
    {
      "id": "maize_seeds_001",
      "name": "Premium Maize Seeds - Hybrid Variety",
      "price": 45.00,
      "quantity": 2,
      "image": "/assets/seeds/maize.jpg",
      "seller": {
        "name": "GreenFields Agriculture",
        "rating": 4.8,
        "verified": true,
        "location": "Iowa, USA"
      }
    },
    {
      "id": "fertilizer_001", 
      "name": "NPK Fertilizer 20-20-20",
      "price": 25.00,
      "quantity": 1,
      "image": "/assets/fertilizers/npk.jpg",
      "seller": {
        "name": "AgroChem Solutions",
        "rating": 4.6,
        "verified": true,
        "location": "California, USA"
      }
    }
  ]',
  115.00,
  'USD',
  'stripe',
  NOW()
);

-- Cart 2: Irrigation Kit (M-Pesa, KES)
INSERT INTO demo_carts (id, user_id, items, total_amount, currency, payment_method, created_at) VALUES (
  'demo_cart_2',
  'demo_user_2',
  '[
    {
      "id": "irrigation_kit_001",
      "name": "Smart Drip Irrigation System",
      "price": 2500.00,
      "quantity": 1,
      "image": "/assets/tools/irrigation.jpg",
      "seller": {
        "name": "Kenya Irrigation Co.",
        "rating": 4.9,
        "verified": true,
        "location": "Nairobi, Kenya"
      }
    }
  ]',
  2500.00,
  'KES',
  'mpesa',
  NOW()
);

-- Cart 3: Multi-item Cart (PayPal, EUR)
INSERT INTO demo_carts (id, user_id, items, total_amount, currency, payment_method, created_at) VALUES (
  'demo_cart_3',
  'demo_user_3',
  '[
    {
      "id": "wheat_seeds_001",
      "name": "Winter Wheat Seeds - Organic",
      "price": 35.00,
      "quantity": 3,
      "image": "/assets/seeds/wheat.jpg",
      "seller": {
        "name": "European Organic Farms",
        "rating": 4.7,
        "verified": true,
        "location": "Bavaria, Germany"
      }
    },
    {
      "id": "pesticide_001",
      "name": "Organic Pest Control Spray",
      "price": 18.00,
      "quantity": 2,
      "image": "/assets/pesticides/organic.jpg",
      "seller": {
        "name": "EcoFriendly Solutions",
        "rating": 4.5,
        "verified": true,
        "location": "Netherlands"
      }
    },
    {
      "id": "harvest_tool_001",
      "name": "Professional Harvesting Knife",
      "price": 12.00,
      "quantity": 1,
      "image": "/assets/tools/harvest_knife.jpg",
      "seller": {
        "name": "Farm Tools Europe",
        "rating": 4.8,
        "verified": true,
        "location": "France"
      }
    }
  ]',
  149.00,
  'EUR',
  'paypal',
  NOW()
);

-- Create demo_carts table if it doesn't exist
CREATE TABLE IF NOT EXISTS demo_carts (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  payment_method VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_demo_carts_user_id ON demo_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_carts_payment_method ON demo_carts(payment_method);
CREATE INDEX IF NOT EXISTS idx_demo_carts_currency ON demo_carts(currency);

-- Flow14.1.1: Seed public marketplace demo data

-- Create demo sellers if missing
INSERT INTO sellers (id, name, location, verified, rating, reviews_count)
SELECT gen_random_uuid(), name, location, TRUE, 4.5, 120
FROM (VALUES
  ('Green Fields Co', 'Nakuru'),
  ('Maize Masters', 'Eldoret'),
  ('Organic Harvest', 'Nyeri')
) AS v(name, location)
WHERE NOT EXISTS (
  SELECT 1 FROM sellers s WHERE s.name = v.name
);

-- Insert 12 demo products referencing any existing sellers
WITH s AS (
  SELECT id FROM sellers LIMIT 3
)
INSERT INTO marketplace_products (seller_id, title, description, category, price_cents, currency, stock, images, is_active)
SELECT s.id, p.title, p.description, p.category, p.price_cents, 'USD', p.stock, p.images, TRUE
FROM s, (
  VALUES
  ('Premium Maize (50kg)', 'High-quality maize suitable for milling.', 'grains', 2500, 120, '["/images/maize1.jpg"]'::jsonb),
  ('Organic Wheat (50kg)', 'Organic wheat harvested this season.', 'grains', 3000, 80, '["/images/wheat1.jpg"]'),
  ('Fresh Beans (25kg)', 'Freshly harvested beans.', 'legumes', 1800, 150, '["/images/beans1.jpg"]'),
  ('Soya Beans (25kg)', 'High-protein soybeans.', 'legumes', 2200, 70, '["/images/soy1.jpg"]'),
  ('Sunflower Seeds (25kg)', 'Oil-grade sunflower seeds.', 'seeds', 2600, 60, '["/images/sun1.jpg"]'),
  ('Fertilizer NPK (50kg)', 'Balanced NPK fertilizer for cereals.', 'inputs', 4000, 40, '["/images/npk.jpg"]'),
  ('Drip Irrigation Kit', 'Complete kit for 1 acre.', 'equipment', 15000, 25, '["/images/drip.jpg"]'),
  ('Hybrid Maize Seed', 'High-yield hybrid seed.', 'seeds', 3500, 90, '["/images/seed.jpg"]'),
  ('Coffee Cherries (50kg)', 'Fresh AA-grade cherries.', 'cash_crops', 12000, 30, '["/images/coffee.jpg"]'),
  ('Avocado (crate)', 'Hass avocado crate.', 'fruits', 5000, 45, '["/images/avocado.jpg"]'),
  ('Bananas (bunch)', 'Mature green bananas.', 'fruits', 2000, 100, '["/images/banana.jpg"]'),
  ('Onions (50kg)', 'Red bulb onions.', 'vegetables', 4500, 55, '["/images/onion.jpg"]')
) AS p(title, description, category, price_cents, stock, images);

-- Create one demo paid order
-- Assumes users table exists; pick first user as buyer and first seller
WITH buyer AS (
  SELECT id FROM users LIMIT 1
), seller AS (
  SELECT seller_id FROM marketplace_products LIMIT 1
), prod AS (
  SELECT id, price_cents FROM marketplace_products LIMIT 1
)
INSERT INTO orders (id, order_number, user_id, seller_id, status, subtotal, tax_amount, shipping_amount, total_amount, currency, payment_status, payment_method, shipping_address, billing_address, created_at, updated_at)
SELECT gen_random_uuid(), 'DEMO-1001', buyer.id, seller.seller_id, 'confirmed', (prod.price_cents/100.0), 0, 0, (prod.price_cents/100.0), 'USD', 'paid', 'mock', '{}'::jsonb, '{}'::jsonb, now(), now()
FROM buyer, seller, prod
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE order_number='DEMO-1001');

-- Insert matching order item
WITH o AS (
  SELECT id FROM orders WHERE order_number='DEMO-1001'
), prod AS (
  SELECT id, (price_cents/100.0) AS unit_price FROM marketplace_products LIMIT 1
)
INSERT INTO order_items (id, order_id, product_id, product_name, product_sku, quantity, unit_price, total_price, created_at)
SELECT gen_random_uuid(), o.id, prod.id::text, 'Demo Product', 'SKU-DEMO', 1, prod.unit_price, prod.unit_price, now()
FROM o, prod
WHERE NOT EXISTS (SELECT 1 FROM order_items WHERE product_sku='SKU-DEMO');



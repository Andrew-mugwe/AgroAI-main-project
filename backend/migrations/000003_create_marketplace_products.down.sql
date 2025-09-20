-- Drop the table and related objects
DROP TRIGGER IF EXISTS update_marketplace_products_updated_at ON marketplace_products;
DROP TABLE IF EXISTS marketplace_products;
DROP TYPE IF EXISTS product_category;
DROP FUNCTION IF EXISTS update_updated_at_column();

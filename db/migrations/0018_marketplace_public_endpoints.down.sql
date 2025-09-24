-- Flow14.1.1: Marketplace public endpoints, search, and views (DOWN)

DROP VIEW IF EXISTS public_products;
DROP TRIGGER IF EXISTS trg_marketplace_products_search ON marketplace_products;
DROP FUNCTION IF EXISTS update_search_tsv();
DROP INDEX IF EXISTS idx_marketplace_products_search_tsv;
DROP INDEX IF EXISTS idx_marketplace_products_category;
DROP INDEX IF EXISTS idx_marketplace_products_created_at;
DROP INDEX IF EXISTS idx_marketplace_products_is_active;
-- Note: We do not drop marketplace_products to remain non-destructive.



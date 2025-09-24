-- Flow14.1.1: Marketplace public endpoints, search, and views (UP)

-- Ensure marketplace_products table exists with required columns
CREATE TABLE IF NOT EXISTS marketplace_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID,
    trader_id UUID,
    title TEXT,
    name TEXT,
    description TEXT NOT NULL,
    category TEXT,
    price_cents BIGINT,
    price NUMERIC(12,2),
    currency TEXT DEFAULT 'USD',
    stock INT DEFAULT 0 NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Align columns for public API usage
ALTER TABLE marketplace_products
    ADD COLUMN IF NOT EXISTS search_tsv tsvector;

-- Trigger function to keep tsvector updated
CREATE OR REPLACE FUNCTION update_search_tsv() RETURNS trigger AS $$
BEGIN
  NEW.search_tsv :=
    setweight(to_tsvector('simple', coalesce(NEW.title, NEW.name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.category, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Trigger on insert/update
DROP TRIGGER IF EXISTS trg_marketplace_products_search ON marketplace_products;
CREATE TRIGGER trg_marketplace_products_search
BEFORE INSERT OR UPDATE ON marketplace_products
FOR EACH ROW EXECUTE FUNCTION update_search_tsv();

-- Indexes for search and filters
CREATE INDEX IF NOT EXISTS idx_marketplace_products_search_tsv ON marketplace_products USING GIN (search_tsv);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_category ON marketplace_products (category);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_created_at ON marketplace_products (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_products_is_active ON marketplace_products (is_active);

-- Public view with seller info if available
-- Assumes a sellers table exists; safely left join
CREATE OR REPLACE VIEW public_products AS
SELECT
  p.id,
  COALESCE(p.seller_id, p.trader_id) AS seller_id,
  COALESCE(p.title, p.name) AS title,
  p.description,
  p.category,
  COALESCE(p.price_cents, (p.price * 100)::bigint) AS price_cents,
  p.currency,
  p.stock,
  COALESCE(NULLIF(p.images::text, 'null'), '[]')::jsonb AS images,
  p.image_url,
  p.created_at,
  p.updated_at,
  s.name AS seller_name,
  s.verified AS seller_verified,
  s.rating AS seller_rating,
  s.reviews_count AS seller_reviews_count
FROM marketplace_products p
LEFT JOIN sellers s ON s.id = COALESCE(p.seller_id, p.trader_id)
WHERE p.is_active = TRUE;



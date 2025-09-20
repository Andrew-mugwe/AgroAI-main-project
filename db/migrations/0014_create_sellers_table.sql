-- Migration: Create sellers table for Flow 14.7 - Seller Profiles & Trust Signals
-- This migration creates the sellers table with trust signal fields

-- Create sellers table
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    verified BOOLEAN DEFAULT false,
    rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0.0 AND rating <= 5.0),
    reviews_count INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 0 CHECK (reputation_score >= 0 AND reputation_score <= 100),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
);

-- Add seller_id foreign key to marketplace_products
ALTER TABLE marketplace_products 
ADD COLUMN seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX idx_sellers_verified ON sellers(verified);
CREATE INDEX idx_sellers_rating ON sellers(rating);
CREATE INDEX idx_sellers_reputation_score ON sellers(reputation_score);
CREATE INDEX idx_marketplace_products_seller_id ON marketplace_products(seller_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sellers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for sellers table
CREATE TRIGGER update_sellers_updated_at
    BEFORE UPDATE ON sellers
    FOR EACH ROW
    EXECUTE FUNCTION update_sellers_updated_at();

-- Add comments for documentation
COMMENT ON TABLE sellers IS 'Seller profiles with trust signals for AgroAI Marketplace';
COMMENT ON COLUMN sellers.verified IS 'Whether the seller has been verified (blue checkmark)';
COMMENT ON COLUMN sellers.rating IS 'Average rating from reviews (0.0-5.0)';
COMMENT ON COLUMN sellers.reviews_count IS 'Total number of reviews received';
COMMENT ON COLUMN sellers.reputation_score IS 'Overall reputation score (0-100)';
COMMENT ON COLUMN marketplace_products.seller_id IS 'Foreign key reference to sellers table';

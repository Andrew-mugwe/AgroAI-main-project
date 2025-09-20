-- Migration: Create pest reports table
-- Created: 2025-01-15
-- Description: Flow 13 - Pest & Disease Detection system

-- Create pest_reports table
CREATE TABLE pest_reports (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    pest_name TEXT,
    confidence NUMERIC(5,2) CHECK (confidence >= 0 AND confidence <= 100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pest_reports_user_id ON pest_reports(user_id);
CREATE INDEX idx_pest_reports_created_at ON pest_reports(created_at DESC);
CREATE INDEX idx_pest_reports_pest_name ON pest_reports(pest_name);
CREATE INDEX idx_pest_reports_confidence ON pest_reports(confidence DESC);

-- Add comments for documentation
COMMENT ON TABLE pest_reports IS 'Pest and disease detection reports with AI classification';
COMMENT ON COLUMN pest_reports.confidence IS 'AI confidence score (0-100)';
COMMENT ON COLUMN pest_reports.image_url IS 'Path to uploaded pest image';
COMMENT ON COLUMN pest_reports.pest_name IS 'AI-detected pest or disease name';

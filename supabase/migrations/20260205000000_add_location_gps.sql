-- Migration: Add GPS coordinates to locations table
-- Created: 2026-02-05

ALTER TABLE locations ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Update type definition
COMMENT ON COLUMN locations.latitude IS 'GPS latitude coordinate for the location';
COMMENT ON COLUMN locations.longitude IS 'GPS longitude coordinate for the location';

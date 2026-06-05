ALTER TABLE users
ADD COLUMN IF NOT EXISTS store_nav_links JSONB DEFAULT '[]'::jsonb;

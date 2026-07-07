ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS citation text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accent_color text DEFAULT 'brass';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT true;

CREATE TABLE IF NOT EXISTS weapons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  recording_id uuid REFERENCES recordings(id) ON DELETE SET NULL,
  name text NOT NULL,
  weapon_type text NOT NULL,
  power integer CHECK (power BETWEEN 0 AND 100),
  range_stat integer CHECK (range_stat BETWEEN 0 AND 100),
  precision_stat integer CHECK (precision_stat BETWEEN 0 AND 100),
  style_stat integer CHECK (style_stat BETWEEN 0 AND 100),
  overall_score integer CHECK (overall_score BETWEEN 0 AND 100),
  rarity text NOT NULL CHECK (rarity IN ('common','uncommon','rare','epic','legendary')),
  visual_seed text NOT NULL,
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  battles_won integer DEFAULT 0,
  battles_lost integer DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_weapons_user ON weapons(user_id);
CREATE INDEX IF NOT EXISTS idx_weapons_rarity ON weapons(rarity);
CREATE INDEX IF NOT EXISTS idx_weapons_score ON weapons(overall_score DESC);
ALTER TABLE weapons ENABLE ROW LEVEL SECURITY;
CREATE POLICY weapons_read_own ON weapons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY weapons_insert_own ON weapons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY weapons_update_own ON weapons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY weapons_delete_own ON weapons FOR DELETE USING (auth.uid() = user_id);

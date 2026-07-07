ALTER TABLE compositions ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE compositions ADD COLUMN IF NOT EXISTS play_count integer DEFAULT 0;
ALTER TABLE compositions ADD COLUMN IF NOT EXISTS duration_ms integer;

CREATE TABLE IF NOT EXISTS composition_plays (
  composition_id uuid REFERENCES compositions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  played_at timestamptz DEFAULT now(),
  PRIMARY KEY (composition_id, user_id, played_at)
);
ALTER TABLE composition_plays ENABLE ROW LEVEL SECURITY;
CREATE POLICY comp_plays_select ON composition_plays FOR SELECT USING (true);
CREATE POLICY comp_plays_insert ON composition_plays FOR INSERT WITH CHECK (true);

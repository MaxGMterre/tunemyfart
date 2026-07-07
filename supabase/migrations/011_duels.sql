CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS duels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  challenged_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('db_max','duree_ms','notes_count','freq_max')),
  challenger_recording_id uuid REFERENCES recordings(id) ON DELETE SET NULL,
  challenged_recording_id uuid REFERENCES recordings(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','completed','expired','declined')),
  winner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;
CREATE POLICY duels_select ON duels FOR SELECT
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);
CREATE POLICY duels_insert ON duels FOR INSERT
  WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY duels_update ON duels FOR UPDATE
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);
CREATE INDEX IF NOT EXISTS idx_duels_challenger ON duels(challenger_id);
CREATE INDEX IF NOT EXISTS idx_duels_challenged ON duels(challenged_id);
CREATE INDEX IF NOT EXISTS idx_duels_expires ON duels(expires_at);

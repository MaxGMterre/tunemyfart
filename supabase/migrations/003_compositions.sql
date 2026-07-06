-- Compositions table for the Clavier/Composer feature
CREATE TABLE IF NOT EXISTS compositions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudo      text,
  title       text NOT NULL DEFAULT 'Sans titre',
  notes       jsonb NOT NULL DEFAULT '[]',
  -- notes format: [{ note: string, frequency: number, duration_ms: number, t: number }]
  duration_ms integer NOT NULL DEFAULT 0,
  bpm         integer,
  audio_url   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS compositions_user_id_idx ON compositions(user_id);
CREATE INDEX IF NOT EXISTS compositions_created_at_idx ON compositions(created_at DESC);

-- RLS
ALTER TABLE compositions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own compositions"
  ON compositions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own compositions"
  ON compositions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own compositions"
  ON compositions FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================
-- TUNEMYFART — MIGRATIONS COMBINÉES (002 → 007)
-- Colle ce fichier entier dans Supabase SQL Editor et exécute.
-- =============================================================


-- =============================================================
-- 002 — RECORDINGS EXTRA
-- =============================================================

ALTER TABLE recordings
  ADD COLUMN IF NOT EXISTS humeur       text,
  ADD COLUMN IF NOT EXISTS social       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS chercheur_note text;

COMMENT ON COLUMN recordings.humeur IS 'Emoji humeur au moment de l''enregistrement (ex: 😊, 😴)';
COMMENT ON COLUMN recordings.social IS 'Enregistrement réalisé en présence de tiers';
COMMENT ON COLUMN recordings.chercheur_note IS 'Note libre du chercheur sur le spécimen';


-- =============================================================
-- 003 — COMPOSITIONS
-- =============================================================

CREATE TABLE IF NOT EXISTS compositions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudo      text,
  title       text NOT NULL DEFAULT 'Sans titre',
  notes       jsonb NOT NULL DEFAULT '[]',
  duration_ms integer NOT NULL DEFAULT 0,
  bpm         integer,
  audio_url   text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS compositions_user_id_idx ON compositions(user_id);
CREATE INDEX IF NOT EXISTS compositions_created_at_idx ON compositions(created_at DESC);

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


-- =============================================================
-- 004 — DAILY CHALLENGES + XP/LEVEL
-- =============================================================

CREATE TABLE IF NOT EXISTS daily_challenges (
  id serial PRIMARY KEY,
  date date NOT NULL UNIQUE,
  challenge_type text NOT NULL,
  challenge_params jsonb NOT NULL DEFAULT '{}',
  challenge_description text NOT NULL,
  reward_type text NOT NULL DEFAULT 'xp',
  reward_value text
);

CREATE TABLE IF NOT EXISTS user_daily_progress (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id integer REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed_at timestamptz,
  progress jsonb DEFAULT '{}',
  PRIMARY KEY (user_id, challenge_id)
);

ALTER TABLE user_daily_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_progress_select ON user_daily_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY daily_progress_insert ON user_daily_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY daily_progress_update ON user_daily_progress FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_challenges_read ON daily_challenges FOR SELECT USING (true);
CREATE POLICY daily_challenges_insert ON daily_challenges FOR INSERT WITH CHECK (true);

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;


-- =============================================================
-- 005 — FRIENDS (codes + amitiés)
-- =============================================================

CREATE TABLE IF NOT EXISTS friend_codes (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS friendships (
  user_a uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_b uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_a, user_b),
  CHECK (user_a < user_b)
);

ALTER TABLE friend_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY friend_codes_read ON friend_codes FOR SELECT USING (true);
CREATE POLICY friend_codes_own_write ON friend_codes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY friendships_read ON friendships FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY friendships_insert ON friendships FOR INSERT WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);
CREATE POLICY friendships_delete ON friendships FOR DELETE USING (auth.uid() = user_a OR auth.uid() = user_b);


-- =============================================================
-- 006 — ANALYTICS (opt-in, anonymes)
-- =============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id bigserial PRIMARY KEY,
  event_type text NOT NULL,
  event_data jsonb,
  session_id text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(created_at);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_write ON analytics_events FOR INSERT WITH CHECK (true);


-- =============================================================
-- 007 — FEEDBACK
-- =============================================================

CREATE TABLE IF NOT EXISTS feedback (
  id bigserial PRIMARY KEY,
  user_id uuid,
  type text,
  severity text,
  description text,
  device_info text,
  app_version text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY feedback_write ON feedback FOR INSERT WITH CHECK (true);


-- =============================================================
-- FONCTION RPC — increment_xp
-- =============================================================

CREATE OR REPLACE FUNCTION increment_xp(p_user_id uuid, p_xp integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, xp, level)
  VALUES (p_user_id, p_xp, 1)
  ON CONFLICT (id) DO UPDATE
    SET xp    = profiles.xp + EXCLUDED.xp,
        level = CASE
          WHEN profiles.xp + EXCLUDED.xp < 100  THEN 1
          WHEN profiles.xp + EXCLUDED.xp < 250  THEN 2
          WHEN profiles.xp + EXCLUDED.xp < 500  THEN 3
          ELSE GREATEST(3, floor(power((profiles.xp + EXCLUDED.xp) / 100.0, 1.0/1.5))::int)
        END;
END;
$$;


-- =============================================================
-- FIN — toutes les migrations ont été appliquées
-- =============================================================

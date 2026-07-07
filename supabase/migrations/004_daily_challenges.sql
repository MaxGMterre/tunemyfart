-- Daily challenges tables
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

-- XP and level columns on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;

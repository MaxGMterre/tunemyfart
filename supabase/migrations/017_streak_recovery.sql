CREATE TABLE IF NOT EXISTS user_streak_recovery (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  coupons integer DEFAULT 0,
  last_awarded_at timestamptz,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE user_streak_recovery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_streak_recovery" ON user_streak_recovery
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

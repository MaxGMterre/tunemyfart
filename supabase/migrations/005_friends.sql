-- Friend codes and friendships
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

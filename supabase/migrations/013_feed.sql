CREATE TABLE IF NOT EXISTS activity_feed (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  target_type text,
  target_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_feed_user ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_date ON activity_feed(created_at DESC);

CREATE TABLE IF NOT EXISTS activity_likes (
  activity_id bigint REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  liked_at timestamptz DEFAULT now(),
  PRIMARY KEY (activity_id, user_id)
);

CREATE TABLE IF NOT EXISTS activity_comments (
  id bigserial PRIMARY KEY,
  activity_id bigint REFERENCES activity_feed(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 280),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY feed_read ON activity_feed FOR SELECT USING (true);
CREATE POLICY feed_insert ON activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY feed_delete ON activity_feed FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY likes_read ON activity_likes FOR SELECT USING (true);
CREATE POLICY likes_write ON activity_likes FOR ALL USING (auth.uid() = user_id);

CREATE POLICY comments_read ON activity_comments FOR SELECT USING (true);
CREATE POLICY comments_write ON activity_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY comments_delete ON activity_comments FOR DELETE USING (auth.uid() = user_id);

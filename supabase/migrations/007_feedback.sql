-- User feedback and bug reports
CREATE TABLE IF NOT EXISTS feedback (
  id bigserial PRIMARY KEY,
  user_id uuid,
  type text,       -- 'bug' | 'suggestion'
  severity text,   -- 'blocking' | 'annoying' | 'cosmetic'
  description text,
  device_info text,
  app_version text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY feedback_write ON feedback FOR INSERT WITH CHECK (true);

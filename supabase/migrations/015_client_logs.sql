CREATE TABLE IF NOT EXISTS client_logs (
  id bigserial PRIMARY KEY,
  level text NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  message text NOT NULL,
  stack text,
  component text,
  metadata jsonb,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE client_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY logs_insert ON client_logs FOR INSERT WITH CHECK (true);
CREATE POLICY logs_select ON client_logs FOR SELECT USING (false);

CREATE INDEX IF NOT EXISTS idx_logs_level ON client_logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created ON client_logs(created_at DESC);

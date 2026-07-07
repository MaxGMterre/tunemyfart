CREATE TABLE IF NOT EXISTS user_purchases (
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY purchases_read ON user_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY purchases_insert ON user_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

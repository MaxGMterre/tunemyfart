CREATE TABLE IF NOT EXISTS seasons (
  id serial PRIMARY KEY,
  name text NOT NULL,
  theme text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  banner_color text,
  color_primary text,
  description text
);

CREATE TABLE IF NOT EXISTS season_missions (
  id serial PRIMARY KEY,
  season_id integer REFERENCES seasons(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  condition jsonb,
  reward jsonb,
  exclusive boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS user_season_progress (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id integer REFERENCES seasons(id) ON DELETE CASCADE,
  season_xp integer DEFAULT 0,
  season_rank integer,
  PRIMARY KEY (user_id, season_id)
);

ALTER TABLE user_season_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY season_prog_read ON user_season_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY season_prog_write ON user_season_progress FOR ALL USING (auth.uid() = user_id);

-- 4 predefined seasons
INSERT INTO seasons (name, theme, starts_at, ends_at, banner_color, color_primary, description) VALUES
  ('Printemps des Découvertes', 'spring',
   '2026-03-01 00:00:00+00', '2026-05-31 23:59:59+00',
   '#7ec8a0', '#2ecc71',
   'Les premières notes émergent avec la saison nouvelle. Explorez les registres graves.'),
  ('Été Acoustique', 'summer',
   '2026-06-01 00:00:00+00', '2026-08-31 23:59:59+00',
   '#f5a623', '#c99a3d',
   'Chaleur, amplitude, puissance. La saison des grands décibels.'),
  ('Automne des Résonances', 'autumn',
   '2026-09-01 00:00:00+00', '2026-11-30 23:59:59+00',
   '#d9603b', '#d9603b',
   'Les harmoniques se complexifient. Explorez les timbres rares.'),
  ('Hiver de Cristal', 'winter',
   '2026-12-01 00:00:00+00', '2027-02-28 23:59:59+00',
   '#3498db', '#9b59b6',
   'Pureté, précision, cristallin. Les notes les plus hautes récompensées.')
ON CONFLICT DO NOTHING;

-- Season missions
INSERT INTO season_missions (season_id, title, description, condition, reward) VALUES
  (1, 'Premier Éveil', 'Enregistrez votre premier relevé de la saison', '{"type":"recording_count","value":1}', '{"xp":50,"title":"Éveillé du Printemps"}'),
  (1, 'Grave Profond', 'Atteignez une note en dessous de Do3', '{"type":"note_below_midi","value":48}', '{"xp":75}'),
  (1, 'Botaniste Sonore', 'Enregistrez 10 relevés en plein air (lieu="extérieur")', '{"type":"outdoor_count","value":10}', '{"xp":100}'),
  (2, 'Plein Été', 'Atteignez -5 dB ou plus', '{"type":"db_max_above","value":-5}', '{"xp":80,"title":"Tonnerre d''Été"}'),
  (2, 'Séquence Estivale', 'Enregistrez 5 jours consécutifs', '{"type":"streak","value":5}', '{"xp":120}'),
  (3, 'Palette Automnale', 'Obtenez 5 timbres différents en une semaine', '{"type":"timbre_variety","value":5}', '{"xp":100,"title":"Timbrologue"}'),
  (4, 'Cristal Pur', 'Obtenez le timbre "Cristallin"', '{"type":"timbre_category","value":"Cristallin"}', '{"xp":90,"title":"Voix de Cristal"}');

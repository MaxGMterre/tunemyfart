ALTER TABLE profiles ALTER COLUMN username DROP NOT NULL;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pseudo    text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar    text DEFAULT '🦨';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age       integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS genre     text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS poids     numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS taille    integer;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN user_id uuid
      GENERATED ALWAYS AS (id) STORED;
  END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_pseudo ON profiles(pseudo);
DROP POLICY IF EXISTS "Ecriture de son propre profil" ON profiles;
DROP POLICY IF EXISTS "Ecriture de son propre profil" ON profiles;
CREATE POLICY "Ecriture de son propre profil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Modification de son propre profil" ON profiles;
DROP POLICY IF EXISTS "Modification de son propre profil" ON profiles;
CREATE POLICY "Modification de son propre profil" ON profiles
  FOR UPDATE USING (auth.uid() = id);
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS freq_max     numeric;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS freq_min     numeric;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS notes_count  integer DEFAULT 0;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS pseudo       text;   -- dénormalisé depuis profiles
CREATE INDEX IF NOT EXISTS idx_recordings_freq_max    ON recordings(freq_max    DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_recordings_freq_min    ON recordings(freq_min    ASC  NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_recordings_notes_count ON recordings(notes_count DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_recordings_note        ON recordings(note_principale);
CREATE OR REPLACE FUNCTION trg_fn_recording_stats()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  note_item jsonb;
  freq      numeric;
  max_f     numeric;
  min_f     numeric;
  cnt       integer := 0;
BEGIN
  -- Stats depuis sequence_notes
  IF NEW.sequence_notes IS NOT NULL AND jsonb_array_length(NEW.sequence_notes) > 0 THEN
    FOR note_item IN SELECT * FROM jsonb_array_elements(NEW.sequence_notes) LOOP
      freq := (note_item->>'frequency')::numeric;
      IF freq IS NOT NULL AND freq > 0 THEN
        max_f := GREATEST(COALESCE(max_f, freq), freq);
        min_f := LEAST(COALESCE(min_f, freq), freq);
      END IF;
      cnt := cnt + 1;
    END LOOP;
  END IF;
  NEW.freq_max    := max_f;
  NEW.freq_min    := min_f;
  NEW.notes_count := cnt;
  -- Pseudo dénormalisé
  IF NEW.pseudo IS NULL AND NEW.user_id IS NOT NULL THEN
    SELECT pseudo INTO NEW.pseudo FROM profiles WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_recording_stats ON recordings;
CREATE TRIGGER trg_recording_stats
  BEFORE INSERT OR UPDATE ON recordings
  FOR EACH ROW EXECUTE FUNCTION trg_fn_recording_stats();
UPDATE recordings SET notes_count = 0 WHERE notes_count IS NULL;
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings',
  'recordings',
  true,
  52428800,   -- 50 MB max
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav', 'audio/webm;codecs=opus']
)
ON CONFLICT (id) DO UPDATE
  SET public = true,
      file_size_limit = 52428800;
DROP POLICY IF EXISTS "Public read recordings storage"    ON storage.objects;
DROP POLICY IF EXISTS "Auth upload to own folder"         ON storage.objects;
DROP POLICY IF EXISTS "Auth delete own recordings"        ON storage.objects;
DROP POLICY IF EXISTS "Public read recordings storage" ON storage.objects;
CREATE POLICY "Public read recordings storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings');
DROP POLICY IF EXISTS "Auth upload to own folder" ON storage.objects;
CREATE POLICY "Auth upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'recordings'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
DROP POLICY IF EXISTS "Auth delete own recordings" ON storage.objects;
CREATE POLICY "Auth delete own recordings" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE TABLE IF NOT EXISTS completed_missions (
  user_id      uuid        NOT NULL,
  mission_id   text        NOT NULL,
  completed_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, mission_id)
);
ALTER TABLE completed_missions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Read own completed missions"   ON completed_missions;
DROP POLICY IF EXISTS "Insert own completed missions" ON completed_missions;
DROP POLICY IF EXISTS "Read own completed missions" ON completed_missions;
CREATE POLICY "Read own completed missions" ON completed_missions
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Insert own completed missions" ON completed_missions;
CREATE POLICY "Insert own completed missions" ON completed_missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION get_world_ranks(p_user_id uuid)
RETURNS TABLE(category text, rank bigint) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 'db_max'::text,
    (SELECT COUNT(DISTINCT r2.user_id) + 1
     FROM recordings r2
     WHERE r2.db_max > COALESCE((SELECT MAX(r3.db_max) FROM recordings r3 WHERE r3.user_id = p_user_id), -999))
  UNION ALL
  SELECT 'duree_ms'::text,
    (SELECT COUNT(DISTINCT r2.user_id) + 1
     FROM recordings r2
     WHERE r2.duree_ms > COALESCE((SELECT MAX(r3.duree_ms) FROM recordings r3 WHERE r3.user_id = p_user_id), 0))
  UNION ALL
  SELECT 'freq_max'::text,
    (SELECT COUNT(DISTINCT r2.user_id) + 1
     FROM recordings r2
     WHERE r2.freq_max > COALESCE((SELECT MAX(r3.freq_max) FROM recordings r3 WHERE r3.user_id = p_user_id), 0))
  UNION ALL
  SELECT 'freq_min'::text,
    (SELECT COUNT(DISTINCT r2.user_id) + 1
     FROM recordings r2
     WHERE r2.freq_min < COALESCE((SELECT MIN(r3.freq_min) FROM recordings r3 WHERE r3.user_id = p_user_id AND r3.freq_min > 0), 99999)
       AND r2.freq_min > 0)
  UNION ALL
  SELECT 'notes_count'::text,
    (SELECT COUNT(DISTINCT r2.user_id) + 1
     FROM recordings r2
     WHERE r2.notes_count > COALESCE((SELECT MAX(r3.notes_count) FROM recordings r3 WHERE r3.user_id = p_user_id), 0))
  UNION ALL
  SELECT 'total'::text,
    (SELECT COUNT(DISTINCT r2.user_id) + 1
     FROM (SELECT user_id, COUNT(*) c FROM recordings GROUP BY user_id) r2
     WHERE r2.c > COALESCE((SELECT COUNT(*) FROM recordings r3 WHERE r3.user_id = p_user_id), 0));
END;
$$;
CREATE OR REPLACE VIEW leaderboard_full AS
SELECT
  r.id,
  r.user_id,
  COALESCE(r.pseudo, p.pseudo, 'Anonyme') AS pseudo,
  p.ville,
  p.pays,
  r.db_max,
  r.duree_ms,
  r.freq_max,
  r.freq_min,
  r.notes_count,
  r.note_principale,
  r.created_at
FROM recordings r
LEFT JOIN profiles p ON p.id = r.user_id;
ALTER TABLE recordings
  ADD COLUMN IF NOT EXISTS humeur       text,
  ADD COLUMN IF NOT EXISTS social       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS chercheur_note text;
COMMENT ON COLUMN recordings.humeur IS 'Emoji humeur au moment de l''enregistrement (ex: 😊, 😴)';
COMMENT ON COLUMN recordings.social IS 'Enregistrement réalisé en présence de tiers';
COMMENT ON COLUMN recordings.chercheur_note IS 'Note libre du chercheur sur le spécimen';
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
CREATE INDEX IF NOT EXISTS compositions_user_id_idx ON compositions(user_id);
CREATE INDEX IF NOT EXISTS compositions_created_at_idx ON compositions(created_at DESC);
ALTER TABLE compositions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own compositions" ON compositions;
CREATE POLICY "Users can read own compositions"
  ON compositions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "Users can insert own compositions" ON compositions;
CREATE POLICY "Users can insert own compositions"
  ON compositions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
DROP POLICY IF EXISTS "Users can delete own compositions" ON compositions;
CREATE POLICY "Users can delete own compositions"
  ON compositions FOR DELETE
  USING (auth.uid() = user_id);
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
DROP POLICY IF EXISTS daily_progress_select ON user_daily_progress;
CREATE POLICY daily_progress_select ON user_daily_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS daily_progress_insert ON user_daily_progress;
CREATE POLICY daily_progress_insert ON user_daily_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS daily_progress_update ON user_daily_progress;
CREATE POLICY daily_progress_update ON user_daily_progress FOR UPDATE USING (auth.uid() = user_id);
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS daily_challenges_read ON daily_challenges;
CREATE POLICY daily_challenges_read ON daily_challenges FOR SELECT USING (true);
DROP POLICY IF EXISTS daily_challenges_insert ON daily_challenges;
CREATE POLICY daily_challenges_insert ON daily_challenges FOR INSERT WITH CHECK (true);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level integer DEFAULT 1;
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
DROP POLICY IF EXISTS friend_codes_read ON friend_codes;
CREATE POLICY friend_codes_read ON friend_codes FOR SELECT USING (true);
DROP POLICY IF EXISTS friend_codes_own_write ON friend_codes;
CREATE POLICY friend_codes_own_write ON friend_codes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS friendships_read ON friendships;
CREATE POLICY friendships_read ON friendships FOR SELECT USING (auth.uid() = user_a OR auth.uid() = user_b);
DROP POLICY IF EXISTS friendships_insert ON friendships;
CREATE POLICY friendships_insert ON friendships FOR INSERT WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);
DROP POLICY IF EXISTS friendships_delete ON friendships;
CREATE POLICY friendships_delete ON friendships FOR DELETE USING (auth.uid() = user_a OR auth.uid() = user_b);
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
DROP POLICY IF EXISTS analytics_write ON analytics_events;
CREATE POLICY analytics_write ON analytics_events FOR INSERT WITH CHECK (true);
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
DROP POLICY IF EXISTS feedback_write ON feedback;
CREATE POLICY feedback_write ON feedback FOR INSERT WITH CHECK (true);
CREATE TABLE IF NOT EXISTS user_purchases (
  user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS purchases_read ON user_purchases;
CREATE POLICY purchases_read ON user_purchases
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS purchases_insert ON user_purchases;
CREATE POLICY purchases_insert ON user_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);
ALTER TABLE compositions ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE compositions ADD COLUMN IF NOT EXISTS play_count integer DEFAULT 0;
ALTER TABLE compositions ADD COLUMN IF NOT EXISTS duration_ms integer;
CREATE TABLE IF NOT EXISTS composition_plays (
  composition_id uuid REFERENCES compositions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  played_at timestamptz DEFAULT now(),
  PRIMARY KEY (composition_id, user_id, played_at)
);
ALTER TABLE composition_plays ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS comp_plays_select ON composition_plays;
CREATE POLICY comp_plays_select ON composition_plays FOR SELECT USING (true);
DROP POLICY IF EXISTS comp_plays_insert ON composition_plays;
CREATE POLICY comp_plays_insert ON composition_plays FOR INSERT WITH CHECK (true);
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS duels (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  challenged_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('db_max','duree_ms','notes_count','freq_max')),
  challenger_recording_id uuid REFERENCES recordings(id) ON DELETE SET NULL,
  challenged_recording_id uuid REFERENCES recordings(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','completed','expired','declined')),
  winner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '24 hours')
);
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS duels_select ON duels;
CREATE POLICY duels_select ON duels FOR SELECT
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);
DROP POLICY IF EXISTS duels_insert ON duels;
CREATE POLICY duels_insert ON duels FOR INSERT
  WITH CHECK (auth.uid() = challenger_id);
DROP POLICY IF EXISTS duels_update ON duels;
CREATE POLICY duels_update ON duels FOR UPDATE
  USING (auth.uid() = challenger_id OR auth.uid() = challenged_id);
CREATE INDEX IF NOT EXISTS idx_duels_challenger ON duels(challenger_id);
CREATE INDEX IF NOT EXISTS idx_duels_challenged ON duels(challenged_id);
CREATE INDEX IF NOT EXISTS idx_duels_expires ON duels(expires_at);
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
DROP POLICY IF EXISTS season_prog_read ON user_season_progress;
CREATE POLICY season_prog_read ON user_season_progress FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS season_prog_write ON user_season_progress;
CREATE POLICY season_prog_write ON user_season_progress FOR ALL USING (auth.uid() = user_id);
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
INSERT INTO season_missions (season_id, title, description, condition, reward) VALUES
  (1, 'Premier Éveil', 'Enregistrez votre premier relevé de la saison', '{"type":"recording_count","value":1}', '{"xp":50,"title":"Éveillé du Printemps"}'),
  (1, 'Grave Profond', 'Atteignez une note en dessous de Do3', '{"type":"note_below_midi","value":48}', '{"xp":75}'),
  (1, 'Botaniste Sonore', 'Enregistrez 10 relevés en plein air (lieu="extérieur")', '{"type":"outdoor_count","value":10}', '{"xp":100}'),
  (2, 'Plein Été', 'Atteignez -5 dB ou plus', '{"type":"db_max_above","value":-5}', '{"xp":80,"title":"Tonnerre d''Été"}'),
  (2, 'Séquence Estivale', 'Enregistrez 5 jours consécutifs', '{"type":"streak","value":5}', '{"xp":120}'),
  (3, 'Palette Automnale', 'Obtenez 5 timbres différents en une semaine', '{"type":"timbre_variety","value":5}', '{"xp":100,"title":"Timbrologue"}'),
  (4, 'Cristal Pur', 'Obtenez le timbre "Cristallin"', '{"type":"timbre_category","value":"Cristallin"}', '{"xp":90,"title":"Voix de Cristal"}');
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
DROP POLICY IF EXISTS feed_read ON activity_feed;
CREATE POLICY feed_read ON activity_feed FOR SELECT USING (true);
DROP POLICY IF EXISTS feed_insert ON activity_feed;
CREATE POLICY feed_insert ON activity_feed FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS feed_delete ON activity_feed;
CREATE POLICY feed_delete ON activity_feed FOR DELETE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS likes_read ON activity_likes;
CREATE POLICY likes_read ON activity_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS likes_write ON activity_likes;
CREATE POLICY likes_write ON activity_likes FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS comments_read ON activity_comments;
CREATE POLICY comments_read ON activity_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS comments_write ON activity_comments;
CREATE POLICY comments_write ON activity_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS comments_delete ON activity_comments;
CREATE POLICY comments_delete ON activity_comments FOR DELETE USING (auth.uid() = user_id);
CREATE TABLE IF NOT EXISTS artifacts (
  id serial PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  subtitle text,
  description text,
  rarity text NOT NULL CHECK (rarity IN ('common','uncommon','rare','legendary')),
  unlock_condition jsonb,
  drop_weight integer DEFAULT 100,
  illustration_hint text,
  lore text
);
CREATE TABLE IF NOT EXISTS user_artifacts (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  artifact_id integer REFERENCES artifacts(id) ON DELETE CASCADE,
  discovered_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, artifact_id)
);
ALTER TABLE user_artifacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS artifacts_read ON user_artifacts;
CREATE POLICY artifacts_read ON user_artifacts FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS artifacts_insert ON user_artifacts;
CREATE POLICY artifacts_insert ON user_artifacts FOR INSERT WITH CHECK (auth.uid() = user_id);
INSERT INTO artifacts (slug, name, subtitle, description, rarity, drop_weight, lore) VALUES
  ('barometre_flatulence', 'Le Baromètre à Flatulence', 'Sir Windsor, 1743',
   'Premier instrument de mesure dédié à la pression gazeuse corporelle.',
   'legendary', 10,
   'Fabriqué en laiton poli par Sir Reginald Windsor à l''issue de 40 années de recherche discrète.'),
  ('diapason_ambroise', 'Le Diapason d''Ambroise', 'Vienne, 1876',
   'Diapason accordé sur la fréquence fondamentale du pet moyen européen.',
   'rare', 30,
   'Ambroise Klatschmayer affirmait que tout homme cultive en lui un La naturel.'),
  ('oreillette_fartesius', 'L''Oreillette du Dr. Fartesius', 'Padoue, 1601',
   'Dispositif acoustique permettant d''isoler les fréquences sub-basales.',
   'legendary', 5,
   'Le Dr. Fartesius portait cet instrument lors de ses conférences à l''Académie Padouane des Sciences Occultes.'),
  ('sifflet_victorien', 'Le Sifflet Victorien', 'Londres, 1889',
   'Sifflet en argent calibré pour reproduire exactement un Mi bémol de troisième octave.',
   'uncommon', 80,
   'Distribué aux membres de la Société Royale d''Acoustique Ventrale lors du banquet annuel de 1889.'),
  ('registre_premier', 'Le Premier Registre', 'Paris, 1902',
   'Carnet d''origine contenant les 100 premiers relevés scientifiques documentés.',
   'rare', 25,
   'Initialement rédigé en latin, traduit en français par le Professeur Émile Tournevent.'),
  ('phono_cristal', 'Le Phonographe de Cristal', 'Prague, 1923',
   'Appareil d''enregistrement acoustique utilisant une membrane en cristal de Bohème.',
   'rare', 20,
   'Produit 12 exemplaires. 9 ont survécu à la Seconde Guerre Mondiale.'),
  ('medaille_premier', 'La Médaille du Premier Pet', 'Bruxelles, 1955',
   'Décernée par l''Institut International de Sonologie Humaine pour un premier relevé certifié.',
   'common', 150,
   'L''Institut en a décerné plus de 400 000 depuis sa fondation.'),
  ('cornette_acoustique', 'La Cornette Acoustique', 'Lyon, 1834',
   'Amplificateur acoustique en corne naturelle, optimisé pour les graves.',
   'uncommon', 60,
   'Fabriquée à partir de cornes de bovins sélectionnés pour leur résonance naturelle.'),
  ('montre_precision', 'La Montre de Précision', 'Genève, 1911',
   'Chronomètre mesurant la durée des émissions avec une précision au centième de seconde.',
   'uncommon', 70,
   'Ancêtre direct de nos algorithmes de mesure de durée.'),
  ('cloche_labo', 'La Cloche de Laboratoire', 'Berlin, 1897',
   'Utilisée pour isoler acoustiquement les échantillons lors des analyses.',
   'common', 120,
   'Standard dans tous les laboratoires de physiologie acoustique de l''époque wilhelminienne.'),
  ('parchemin_tonalite', 'Le Parchemin des Tonalités', 'Tolède, 1543',
   'Premier traité sur la classification musicale des émissions gazeuses humaines.',
   'legendary', 8,
   'Attribué au mystérieux Fra Petro Ventosus, dont l''identité reste débattue.'),
  ('loupe_spectrale', 'La Loupe Spectrale', 'Amsterdam, 1956',
   'Permet d''observer visuellement la décomposition spectrale d''un signal audio.',
   'rare', 35,
   'Ancêtre de nos analyseurs FFT modernes.'),
  ('encrier_analyse', 'L''Encrier d''Analyse', 'Florence, 1765',
   'Contient une encre spéciale qui change de couleur selon la note dominante du texte qui l''utilise.',
   'uncommon', 55,
   'Sa formule chimique exacte a été perdue lors de l''incendie de la bibliothèque Medicis de 1798.'),
  ('tuyau_orgue', 'Le Tuyau d''Orgue', 'Strasbourg, 1688',
   'Tuyau d''orgue accordé sur la note fondamentale humaine universelle.',
   'rare', 28,
   'Offert par le facteur d''orgues Andreas Silbermann à la Société des Amateurs de Physiologie Musicale.'),
  ('ballon_resonance', 'Le Ballon de Résonance', 'Tokyo, 1968',
   'Sphère en caoutchouc vulcanisé amplifiant sélectivement les fréquences entre 80 et 400 Hz.',
   'common', 100,
   'Développé lors des Jeux Olympiques de Tokyo pour les épreuves d''acoustique sportive.')
ON CONFLICT (slug) DO NOTHING;
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
DROP POLICY IF EXISTS logs_insert ON client_logs;
CREATE POLICY logs_insert ON client_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS logs_select ON client_logs;
CREATE POLICY logs_select ON client_logs FOR SELECT USING (false);
CREATE INDEX IF NOT EXISTS idx_logs_level ON client_logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_created ON client_logs(created_at DESC);

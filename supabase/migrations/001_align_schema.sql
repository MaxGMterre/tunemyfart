-- ============================================================
-- Migration 001 — Alignement schéma ↔ code + Storage + fonctions
-- À coller dans l'éditeur SQL de ton projet Supabase
-- ============================================================

-- ── 1. PROFILES — corriger le schéma existant ─────────────────

-- La colonne primaire s'appelle `id` dans le schéma mais le code utilise
-- `user_id`. On résout en ajoutant `user_id` comme alias généré.
-- username n'est plus utilisé (remplacé par pseudo) → on le rend nullable.

ALTER TABLE profiles ALTER COLUMN username DROP NOT NULL;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Colonnes manquantes
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pseudo    text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar    text DEFAULT '🦨';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age       integer;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS genre     text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS poids     numeric;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS taille    integer;

-- user_id = alias de id pour la compat code (generated stored)
-- Supabase (Postgres 15) supporte les colonnes générées
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

-- Mettre à jour la politique RLS pour accepter les utilisateurs anonymes
DROP POLICY IF EXISTS "Ecriture de son propre profil" ON profiles;
CREATE POLICY "Ecriture de son propre profil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Modification de son propre profil" ON profiles;
CREATE POLICY "Modification de son propre profil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ── 2. RECORDINGS — colonnes de stats dénormalisées ──────────────

-- On stocke freq_max, freq_min, notes_count directement pour
-- des leaderboards efficaces sans client-side sort.
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS freq_max     numeric;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS freq_min     numeric;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS notes_count  integer DEFAULT 0;
ALTER TABLE recordings ADD COLUMN IF NOT EXISTS pseudo       text;   -- dénormalisé depuis profiles

CREATE INDEX IF NOT EXISTS idx_recordings_freq_max    ON recordings(freq_max    DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_recordings_freq_min    ON recordings(freq_min    ASC  NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_recordings_notes_count ON recordings(notes_count DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_recordings_note        ON recordings(note_principale);

-- Trigger : calcule freq_max, freq_min, notes_count et remplit pseudo
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

-- Remettre à jour les enregistrements existants
UPDATE recordings SET notes_count = 0 WHERE notes_count IS NULL;

-- ── 3. STORAGE — bucket recordings ───────────────────────────────

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

-- Storage RLS
DROP POLICY IF EXISTS "Public read recordings storage"    ON storage.objects;
DROP POLICY IF EXISTS "Auth upload to own folder"         ON storage.objects;
DROP POLICY IF EXISTS "Auth delete own recordings"        ON storage.objects;

CREATE POLICY "Public read recordings storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'recordings');

CREATE POLICY "Auth upload to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'recordings'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Auth delete own recordings" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ── 4. COMPLETED_MISSIONS — persistance des missions accomplies ──

CREATE TABLE IF NOT EXISTS completed_missions (
  user_id      uuid        NOT NULL,
  mission_id   text        NOT NULL,
  completed_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, mission_id)
);

ALTER TABLE completed_missions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Read own completed missions"   ON completed_missions;
DROP POLICY IF EXISTS "Insert own completed missions" ON completed_missions;

CREATE POLICY "Read own completed missions" ON completed_missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Insert own completed missions" ON completed_missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ── 5. RANG MONDIAL — fonction RPC ───────────────────────────────

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

-- ── 6. VUE leaderboard unifiée ───────────────────────────────────

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

-- ── 7. ANONYMOUS AUTH — activer dans le Dashboard ───────────────
-- Authentication → Providers → Anonymous Sign-ins → Enable
-- (ne peut pas être activé par SQL, à faire manuellement)

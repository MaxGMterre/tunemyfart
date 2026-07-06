-- Add enriched metadata columns to recordings
ALTER TABLE recordings
  ADD COLUMN IF NOT EXISTS humeur       text,
  ADD COLUMN IF NOT EXISTS social       boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS chercheur_note text;

COMMENT ON COLUMN recordings.humeur IS 'Emoji humeur au moment de l''enregistrement (ex: 😊, 😴)';
COMMENT ON COLUMN recordings.social IS 'Enregistrement réalisé en présence de tiers';
COMMENT ON COLUMN recordings.chercheur_note IS 'Note libre du chercheur sur le spécimen';

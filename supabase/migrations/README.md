# Migrations Supabase — Ordre d'exécution

Exécuter dans cet ordre depuis le tableau de bord Supabase > SQL Editor, ou via la CLI :

```bash
supabase db push
```

| # | Fichier | Description |
|---|---------|-------------|
| 001 | `001_align_schema.sql` | Schéma de base : tables `recordings`, `profiles`, `leaderboard` + RLS |
| 002 | `002_recordings_extra.sql` | Champs supplémentaires sur `recordings` : `humeur`, `social`, `chercheur_note` |
| 003 | `003_compositions.sql` | Table `compositions` avec notes JSON et BPM |
| 004 | `004_daily_challenges.sql` | Tables `daily_challenges`, `user_daily_progress` + colonnes `xp`/`level` sur `profiles` |
| 005 | `005_friends.sql` | Tables `friend_codes` et `friendships` + RLS |
| 006 | `006_analytics.sql` | Table `analytics_events` avec index sur `event_type` et `session_id` |
| 007 | `007_feedback.sql` | Table `feedback` avec champs type/sévérité/description/device_info |

## Fonctions RPC requises

Créer manuellement dans Supabase > SQL Editor :

```sql
-- Incrémente les XP d'un utilisateur et met à jour son niveau
CREATE OR REPLACE FUNCTION increment_xp(p_user_id uuid, p_xp integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, xp, level)
  VALUES (p_user_id, p_xp, 1)
  ON CONFLICT (id) DO UPDATE
    SET xp    = profiles.xp + EXCLUDED.xp,
        level = CASE
          WHEN profiles.xp + EXCLUDED.xp < 100  THEN 1
          WHEN profiles.xp + EXCLUDED.xp < 250  THEN 2
          WHEN profiles.xp + EXCLUDED.xp < 500  THEN 3
          ELSE GREATEST(3, floor(power((profiles.xp + EXCLUDED.xp) / 100.0, 1.0/1.5))::int)
        END;
END;
$$;

-- Classement mondial par catégorie
CREATE OR REPLACE FUNCTION get_world_ranks(p_user_id uuid)
RETURNS TABLE(category text, rank bigint) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT 'db_max'::text, rank() OVER (ORDER BY db_max DESC) FROM recordings WHERE user_id = p_user_id LIMIT 1
  UNION ALL
  SELECT 'duree_ms', rank() OVER (ORDER BY duree_ms DESC) FROM recordings WHERE user_id = p_user_id LIMIT 1;
$$;
```

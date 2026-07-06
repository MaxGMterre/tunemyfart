import type { PersonalStats } from "./supabase";

export type MissionCondition =
  | { type: "recording_count"; value: number }
  | { type: "note_collected"; value: string }
  | { type: "notes_collected"; value: number }
  | { type: "db_max"; value: number }
  | { type: "db_below"; value: number; count: number }
  | { type: "duration_ms"; value: number }
  | { type: "melody_min_notes"; value: number; count: number }
  | { type: "streak_days"; value: number }
  | { type: "distinct_locations"; value: number }
  | { type: "distinct_alimentations"; value: number }
  | { type: "dominant_note_count"; value: number }
  | { type: "night_recordings"; value: number };

export interface Mission {
  id: string;
  titre: string;
  description: string;
  emoji: string;
  condition: MissionCondition;
  recompense: string;
}

export interface MissionProgress {
  mission: Mission;
  completed: boolean;
  progress: number; // 0-1
  current: number;
  target: number;
}

export const MISSIONS: Mission[] = [
  {
    id: "first_recording",
    titre: "Protocole inaugural",
    description: "Certifie ton premier relevé acoustique",
    emoji: "🥚",
    condition: { type: "recording_count", value: 1 },
    recompense: "Grade Novice du Laboratoire",
  },
  {
    id: "collector_do",
    titre: "Collecteur de Do",
    description: "Enregistre un spécimen sur la fréquence Do",
    emoji: "🎵",
    condition: { type: "note_collected", value: "Do" },
    recompense: "Touche Do de l'organum",
  },
  {
    id: "full_octave",
    titre: "Gamme chromatique complète",
    description: "Recenser les 12 notes de la gamme dans le corpus",
    emoji: "🎹",
    condition: { type: "notes_collected", value: 12 },
    recompense: "Organum complet débloqué",
  },
  {
    id: "thunder",
    titre: "Tonnerre de Zeus",
    description: "Franchir le seuil critique de -10 dB",
    emoji: "⚡",
    condition: { type: "db_max", value: -10 },
    recompense: "Titre de Légende Acoustique",
  },
  {
    id: "marathon",
    titre: "Protocole d'endurance",
    description: "Soumettre un spécimen de durée supérieure à 5 secondes",
    emoji: "⏱️",
    condition: { type: "duration_ms", value: 5000 },
    recompense: "Badge Endurance Certifiée",
  },
  {
    id: "composer",
    titre: "Richesse harmonique",
    description: "Cinq relevés présentant une séquence de 3 notes ou plus",
    emoji: "🎼",
    condition: { type: "melody_min_notes", value: 3, count: 5 },
    recompense: "Mode Compositeur débloqué",
  },
  {
    id: "streak_7",
    titre: "Assiduité scientifique",
    description: "Contribuer au corpus 7 jours consécutifs",
    emoji: "🔥",
    condition: { type: "streak_days", value: 7 },
    recompense: "Badge Régularité Exemplaire",
  },
  {
    id: "silence_radio",
    titre: "Silence Radio",
    description: "Soumettre 3 spécimens d'une discrétion exemplaire (< -45 dB)",
    emoji: "🤫",
    condition: { type: "db_below", value: -45, count: 3 },
    recompense: "Certificat de Discrétion Absolue",
  },
  {
    id: "explorateur",
    titre: "Explorateur",
    description: "Cataloguer des spécimens provenant de 5 lieux distincts",
    emoji: "🗺️",
    condition: { type: "distinct_locations", value: 5 },
    recompense: "Badge Terrain & Lieux Multiples",
  },
  {
    id: "gastronome",
    titre: "Gastronome",
    description: "Documenter l'influence de 4 régimes alimentaires différents",
    emoji: "🍽️",
    condition: { type: "distinct_alimentations", value: 4 },
    recompense: "Titre de Chercheur Nutritionnel",
  },
  {
    id: "signature_etablie",
    titre: "Signature Établie",
    description: "Produire 5 relevés sur la même note dominante",
    emoji: "✍️",
    condition: { type: "dominant_note_count", value: 5 },
    recompense: "Signature Acoustique Certifiée",
  },
  {
    id: "notturne",
    titre: "Notturne",
    description: "Soumettre 3 spécimens entre 22h et 6h du matin",
    emoji: "🌙",
    condition: { type: "night_recordings", value: 3 },
    recompense: "Badge Chercheur de Nuit",
  },
];

interface RecordingRow {
  note_principale: string | null;
  sequence_notes: { note: string; frequency: number; t: number }[] | null;
  db_max?: number | null;
  lieu?: string | null;
  alimentation?: string | null;
  created_at?: string | null;
}

export function checkMissions(
  stats: PersonalStats,
  recordings: RecordingRow[],
  previouslyCompleted: string[] = []
): { progress: MissionProgress[]; newlyCompleted: string[] } {
  const collectedNotes = new Set(
    recordings
      .map((r) => r.note_principale)
      .filter((n): n is string => Boolean(n))
  );

  const progress: MissionProgress[] = MISSIONS.map((mission) => {
    let current = 0;
    let target = 0;
    let completed = false;
    let prog = 0;

    switch (mission.condition.type) {
      case "recording_count":
        current = stats.total;
        target = mission.condition.value;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;

      case "note_collected":
        current = collectedNotes.has(mission.condition.value) ? 1 : 0;
        target = 1;
        completed = current >= 1;
        prog = current;
        break;

      case "notes_collected":
        current = collectedNotes.size;
        target = mission.condition.value;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;

      case "db_max": {
        const db = stats.db_max ?? -100;
        const dbTarget = mission.condition.value; // e.g. -10
        current = Math.round(db);
        target = dbTarget;
        completed = db >= dbTarget;
        // Progress along -60…target scale
        prog = Math.min(1, Math.max(0, (db - -60) / (dbTarget - -60)));
        break;
      }

      case "duration_ms":
        current = stats.duree_max_ms ?? 0;
        target = mission.condition.value;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;

      case "melody_min_notes": {
        const minNotes = mission.condition.value;
        current = recordings.filter(
          (r) =>
            Array.isArray(r.sequence_notes) &&
            r.sequence_notes.length >= minNotes
        ).length;
        target = mission.condition.count;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;
      }

      case "streak_days":
        current = stats.streak;
        target = mission.condition.value;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;

      case "db_below": {
        const belowThreshold = mission.condition.value;
        current = recordings.filter(
          (r) => r.db_max != null && r.db_max < belowThreshold
        ).length;
        target = mission.condition.count;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;
      }

      case "distinct_locations": {
        const lieux = new Set(
          recordings
            .map((r) => r.lieu)
            .filter((l): l is string => Boolean(l))
        );
        current = lieux.size;
        target = mission.condition.value;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;
      }

      case "distinct_alimentations": {
        const alims = new Set(
          recordings
            .map((r) => r.alimentation)
            .filter((a): a is string => Boolean(a))
        );
        current = alims.size;
        target = mission.condition.value;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;
      }

      case "dominant_note_count": {
        const noteMap: Record<string, number> = {};
        for (const r of recordings) {
          if (r.note_principale) {
            noteMap[r.note_principale] = (noteMap[r.note_principale] ?? 0) + 1;
          }
        }
        current = Math.max(0, ...Object.values(noteMap));
        target = mission.condition.value;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;
      }

      case "night_recordings": {
        current = recordings.filter((r) => {
          if (!r.created_at) return false;
          const h = new Date(r.created_at).getHours();
          return h >= 22 || h < 6;
        }).length;
        target = mission.condition.value;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;
      }
    }

    return { mission, completed, progress: prog, current, target };
  });

  const newlyCompleted = progress
    .filter((p) => p.completed && !previouslyCompleted.includes(p.mission.id))
    .map((p) => p.mission.id);

  return { progress, newlyCompleted };
}

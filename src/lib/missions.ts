import type { PersonalStats } from "./supabase";

export type MissionCondition =
  | { type: "recording_count"; value: number }
  | { type: "note_collected"; value: string }
  | { type: "notes_collected"; value: number }
  | { type: "db_max"; value: number }
  | { type: "duration_ms"; value: number }
  | { type: "melody_min_notes"; value: number; count: number }
  | { type: "streak_days"; value: number };

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
    titre: "Premier souffle",
    description: "Enregistre ton premier pet",
    emoji: "🥚",
    condition: { type: "recording_count", value: 1 },
    recompense: "Badge Novice débloqué",
  },
  {
    id: "collector_do",
    titre: "Collectionneur de Do",
    description: "Enregistre un pet sur la note Do",
    emoji: "🎵",
    condition: { type: "note_collected", value: "Do" },
    recompense: "Touche Do du clavier",
  },
  {
    id: "full_octave",
    titre: "Gamme complète",
    description: "Enregistre les 12 notes de la gamme chromatique",
    emoji: "🎹",
    condition: { type: "notes_collected", value: 12 },
    recompense: "Clavier des pets débloqué",
  },
  {
    id: "thunder",
    titre: "Tonnerre de Zeus",
    description: "Dépasse -10 dB",
    emoji: "⚡",
    condition: { type: "db_max", value: -10 },
    recompense: "Badge Légende du Son",
  },
  {
    id: "marathon",
    titre: "Le Marathonien",
    description: "Enregistre un pet de plus de 5 secondes",
    emoji: "⏱️",
    condition: { type: "duration_ms", value: 5000 },
    recompense: "Badge Endurance",
  },
  {
    id: "composer",
    titre: "Le Compositeur",
    description: "Enregistre 5 pets avec une séquence de 3 notes ou plus",
    emoji: "🎼",
    condition: { type: "melody_min_notes", value: 3, count: 5 },
    recompense: "Mode Compositeur débloqué",
  },
  {
    id: "streak_7",
    titre: "La Semaine Musicale",
    description: "Enregistre au moins un pet 7 jours de suite",
    emoji: "🔥",
    condition: { type: "streak_days", value: 7 },
    recompense: "Badge Régularité",
  },
];

interface RecordingRow {
  note_principale: string | null;
  sequence_notes: { note: string; frequency: number; t: number }[] | null;
}

export function checkMissions(
  stats: PersonalStats,
  recordings: RecordingRow[],
  previouslyCompleted: string[] = []
): { progress: MissionProgress[]; newlyCompleted: string[] } {
  const collectedNotes = new Set(
    recordings.map(r => r.note_principale).filter((n): n is string => Boolean(n))
  );

  const progress: MissionProgress[] = MISSIONS.map(mission => {
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
        prog = Math.min(1, Math.max(0, (db - (-60)) / (dbTarget - (-60))));
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
          r => Array.isArray(r.sequence_notes) && r.sequence_notes.length >= minNotes
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
    }

    return { mission, completed, progress: prog, current, target };
  });

  const newlyCompleted = progress
    .filter(p => p.completed && !previouslyCompleted.includes(p.mission.id))
    .map(p => p.mission.id);

  return { progress, newlyCompleted };
}

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
  | { type: "night_recordings"; value: number }
  | { type: "midnight_recording"; value: number }
  | { type: "morning_recording"; value: number }
  | { type: "chercheur_note_count"; value: number }
  | { type: "distinct_alimentations_exact"; value: number };

export interface Mission {
  id: string;
  titre: string;
  description: string;
  emoji: string;
  condition: MissionCondition;
  recompense: string;
  hidden?: boolean;  // succès secret — affiché seulement après déblocage
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

// ── Succès secrets (hidden achievements) ──────────────────────────────────────

export const ACHIEVEMENTS: Mission[] = [
  {
    id: "ach_ponctuel",
    titre: "Le Ponctuel",
    description: "Enregistrer un spécimen à minuit pile",
    emoji: "🕛",
    condition: { type: "midnight_recording", value: 1 },
    recompense: "Horloge à Gaz Certifiée",
    hidden: true,
  },
  {
    id: "ach_matinal",
    titre: "Le Matinal",
    description: "Premier relevé entre 5h et 7h du matin",
    emoji: "🌅",
    condition: { type: "morning_recording", value: 1 },
    recompense: "Brevet de l'Aurore Acoustique",
    hidden: true,
  },
  {
    id: "ach_nocturne",
    titre: "Le Nocturne",
    description: "10 relevés nocturnes entre 22h et 6h",
    emoji: "🦇",
    condition: { type: "night_recordings", value: 10 },
    recompense: "Titre de Chercheur de l'Obscurité",
    hidden: true,
  },
  {
    id: "ach_symphonie",
    titre: "La Symphonie",
    description: "3 mélodies avec 5 notes ou plus chacune",
    emoji: "🎻",
    condition: { type: "melody_min_notes", value: 5, count: 3 },
    recompense: "Baguette du Chef d'Orchestre Digestif",
    hidden: true,
  },
  {
    id: "ach_copieur",
    titre: "Le Copieur",
    description: "Enregistrer 5 fois la même note dominante",
    emoji: "🔁",
    condition: { type: "dominant_note_count", value: 5 },
    recompense: "Tampon de Reproductibilité",
    hidden: true,
  },
  {
    id: "ach_arc_en_ciel",
    titre: "L'Arc-en-ciel",
    description: "Avoir collecté chacune des 12 notes chromatiques",
    emoji: "🌈",
    condition: { type: "notes_collected", value: 12 },
    recompense: "Prisme Acoustique Complet",
    hidden: true,
  },
  {
    id: "ach_eclectique",
    titre: "L'Éclectique",
    description: "Renseigner 10 régimes alimentaires différents",
    emoji: "🥗",
    condition: { type: "distinct_alimentations_exact", value: 10 },
    recompense: "Diplôme de Gastronomie Acoustique",
    hidden: true,
  },
  {
    id: "ach_touriste",
    titre: "Le Touriste",
    description: "Contribuer depuis 5 lieux distincts",
    emoji: "🧳",
    condition: { type: "distinct_locations", value: 5 },
    recompense: "Passeport du Corpus Mondial",
    hidden: true,
  },
  {
    id: "ach_poete",
    titre: "Le Poète",
    description: "Ajouter une note personnelle sur 20 enregistrements",
    emoji: "✒️",
    condition: { type: "chercheur_note_count", value: 20 },
    recompense: "Plume du Rédacteur Scientifique",
    hidden: true,
  },
  {
    id: "ach_discret",
    titre: "Le Discret Absolu",
    description: "Un spécimen mesuré à moins de -50 dB",
    emoji: "🤫",
    condition: { type: "db_below", value: -50, count: 1 },
    recompense: "Badge du Silence Absolu",
    hidden: true,
  },
  {
    id: "ach_bombe_h",
    titre: "La Bombe H",
    description: "Un spécimen atteignant plus de -5 dB",
    emoji: "💣",
    condition: { type: "db_max", value: -5 },
    recompense: "Médaille du Dépassement Critique",
    hidden: true,
  },
  {
    id: "ach_marathonien",
    titre: "Le Marathonien",
    description: "Un spécimen de plus de 10 secondes",
    emoji: "🏃",
    condition: { type: "duration_ms", value: 10000 },
    recompense: "Chronomètre d'Or de l'Endurance",
    hidden: true,
  },
  {
    id: "ach_fidele",
    titre: "Le Fidèle",
    description: "30 jours consécutifs de contributions",
    emoji: "💍",
    condition: { type: "streak_days", value: 30 },
    recompense: "Chevalier de l'Assiduité Perpétuelle",
    hidden: true,
  },
  {
    id: "ach_legendaire",
    titre: "Le Légendaire",
    description: "100 enregistrements au corpus",
    emoji: "🏛️",
    condition: { type: "recording_count", value: 100 },
    recompense: "Statue de Marbre au Panthéon Acoustique",
    hidden: true,
  },
  {
    id: "ach_fantome",
    titre: "Le Fantôme",
    description: "Revenir après 30 jours d'absence",
    emoji: "👻",
    condition: { type: "midnight_recording", value: 0 }, // sentinel — checked differently
    recompense: "Titre de Revenant Acoustique",
    hidden: true,
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

      // Achievement-only condition types
      case "midnight_recording": {
        if (mission.condition.value === 0) { completed = false; prog = 0; break; } // sentinel (fantome)
        current = recordings.filter((r) => {
          if (!r.created_at) return false;
          const h = new Date(r.created_at).getHours();
          return h === 0;
        }).length;
        target = mission.condition.value;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;
      }

      case "morning_recording": {
        current = recordings.filter((r) => {
          if (!r.created_at) return false;
          const h = new Date(r.created_at).getHours();
          return h >= 5 && h < 7;
        }).length;
        target = mission.condition.value;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;
      }

      case "chercheur_note_count": {
        const withNote = (recordings as (RecordingRow & { chercheur_note?: string | null })[])
          .filter((r) => r.chercheur_note && r.chercheur_note.trim().length > 0).length;
        current = withNote;
        target = mission.condition.value;
        completed = current >= target;
        prog = Math.min(1, target > 0 ? current / target : 1);
        break;
      }

      case "distinct_alimentations_exact": {
        const alims = new Set(
          recordings.map((r) => r.alimentation).filter((a): a is string => Boolean(a))
        );
        current = alims.size;
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

export function checkAchievements(
  stats: PersonalStats,
  recordings: (RecordingRow & { chercheur_note?: string | null })[],
  previouslyCompleted: string[] = []
): { progress: MissionProgress[]; newlyCompleted: string[] } {
  // Reuse same logic — ACHIEVEMENTS use same condition types
  const allProgress = checkMissions(stats, recordings as RecordingRow[], previouslyCompleted);
  // But we evaluate against ACHIEVEMENTS list
  const achProgress: MissionProgress[] = ACHIEVEMENTS.map((mission) => {
    const found = allProgress.progress.find((p) => p.mission.id === mission.id);
    // For missions not in MISSIONS list, run the check inline
    if (found) return found;

    // Re-evaluate this specific achievement
    let current = 0, target = 1, completed = false, prog = 0;
    const cond = mission.condition;

    if (cond.type === "midnight_recording" && cond.value > 0) {
      current = recordings.filter((r) => { const h = r.created_at ? new Date(r.created_at).getHours() : -1; return h === 0; }).length;
      target = cond.value; completed = current >= target; prog = Math.min(1, current / target);
    } else if (cond.type === "morning_recording") {
      current = recordings.filter((r) => { const h = r.created_at ? new Date(r.created_at).getHours() : -1; return h >= 5 && h < 7; }).length;
      target = cond.value; completed = current >= target; prog = Math.min(1, current / target);
    } else if (cond.type === "night_recordings") {
      current = recordings.filter((r) => { const h = r.created_at ? new Date(r.created_at).getHours() : -1; return h >= 22 || h < 6; }).length;
      target = cond.value; completed = current >= target; prog = Math.min(1, current / target);
    } else if (cond.type === "recording_count") {
      current = stats.total; target = cond.value; completed = current >= target; prog = Math.min(1, current / target);
    } else if (cond.type === "streak_days") {
      current = stats.streak; target = cond.value; completed = current >= target; prog = Math.min(1, current / target);
    } else if (cond.type === "db_max") {
      const db = stats.db_max ?? -100; completed = db >= cond.value; prog = Math.min(1, Math.max(0, (db + 60) / (cond.value + 60))); current = Math.round(db); target = cond.value;
    } else if (cond.type === "duration_ms") {
      current = stats.duree_max_ms ?? 0; target = cond.value; completed = current >= target; prog = Math.min(1, current / target);
    } else if (cond.type === "db_below") {
      current = recordings.filter((r) => r.db_max != null && r.db_max < cond.value).length;
      target = cond.count; completed = current >= target; prog = Math.min(1, current / target);
    } else if (cond.type === "melody_min_notes") {
      current = recordings.filter((r) => Array.isArray(r.sequence_notes) && r.sequence_notes.length >= cond.value).length;
      target = cond.count; completed = current >= target; prog = Math.min(1, current / target);
    } else if (cond.type === "notes_collected") {
      const notes = new Set(recordings.map((r) => r.note_principale).filter(Boolean));
      current = notes.size; target = cond.value; completed = current >= target; prog = Math.min(1, current / target);
    } else if (cond.type === "dominant_note_count") {
      const nm: Record<string, number> = {};
      for (const r of recordings) if (r.note_principale) nm[r.note_principale] = (nm[r.note_principale] ?? 0) + 1;
      current = Math.max(0, ...Object.values(nm)); target = cond.value; completed = current >= target; prog = Math.min(1, current / target);
    } else if (cond.type === "distinct_locations") {
      current = new Set(recordings.map((r) => r.lieu).filter(Boolean)).size;
      target = cond.value; completed = current >= target; prog = Math.min(1, current / target);
    } else if (cond.type === "distinct_alimentations" || cond.type === "distinct_alimentations_exact") {
      current = new Set(recordings.map((r) => r.alimentation).filter(Boolean)).size;
      target = cond.value; completed = current >= target; prog = Math.min(1, current / target);
    } else if (cond.type === "chercheur_note_count") {
      current = recordings.filter((r) => r.chercheur_note?.trim()).length;
      target = cond.value; completed = current >= target; prog = Math.min(1, current / target);
    }

    return { mission, completed, progress: prog, current, target };
  });

  const newlyCompleted = achProgress
    .filter((p) => p.completed && !previouslyCompleted.includes(p.mission.id))
    .map((p) => p.mission.id);

  return { progress: achProgress, newlyCompleted };
}

import { supabase } from "./supabase";

export interface ChallengeTemplate {
  type: string;
  params: Record<string, unknown>;
  description: string;
  reward: string;
  xp: number;
}

export interface DailyChallenge {
  id: number;
  date: string;
  challenge_type: string;
  challenge_params: Record<string, unknown>;
  challenge_description: string;
  reward_type: string;
  reward_value: string | null;
}

export interface DailyChallengeProgress {
  challenge: DailyChallenge;
  completed: boolean;
  completed_at: string | null;
  progress: Record<string, unknown>;
}

export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  { type: "record_count",        params: { count: 1 },    description: "Enregistre 1 spécimen aujourd'hui",             reward: "+5 XP",  xp: 5 },
  { type: "record_count",        params: { count: 3 },    description: "Enregistre 3 spécimens aujourd'hui",            reward: "+15 XP", xp: 15 },
  { type: "record_count",        params: { count: 5 },    description: "Enregistre 5 spécimens en une journée",         reward: "+25 XP", xp: 25 },
  { type: "record_min_db",       params: { db: -30 },     description: "Dépasse le seuil de -30 dB",                    reward: "+8 XP",  xp: 8 },
  { type: "record_min_db",       params: { db: -20 },     description: "Dépasse le seuil critique de -20 dB",          reward: "+15 XP", xp: 15 },
  { type: "record_min_duration", params: { ms: 2000 },    description: "Un spécimen de plus de 2 secondes",             reward: "+8 XP",  xp: 8 },
  { type: "record_min_duration", params: { ms: 5000 },    description: "Un spécimen de plus de 5 secondes",             reward: "+20 XP", xp: 20 },
  { type: "record_specific_note",params: { note: "Do" }, description: "Enregistre un spécimen sur la note Do",          reward: "+10 XP", xp: 10 },
  { type: "record_specific_note",params: { note: "La" }, description: "Capture la note La (440 Hz) dans ton corpus",    reward: "+10 XP", xp: 10 },
  { type: "record_specific_note",params: { note: "Sol"},  description: "Enregistre un spécimen sur la note Sol",        reward: "+10 XP", xp: 10 },
  { type: "record_night",        params: {},              description: "Contribue entre 22h et 6h du matin",            reward: "+12 XP", xp: 12 },
  { type: "record_with_tag",     params: { field: "alimentation" }, description: "Renseigne l'alimentation sur un spécimen", reward: "+3 XP", xp: 3 },
  { type: "record_with_tag",     params: { field: "lieu" },         description: "Indique le lieu de collecte",                reward: "+3 XP", xp: 3 },
  { type: "record_min_notes",    params: { count: 3 },    description: "Capture une mélodie d'au moins 3 notes",        reward: "+15 XP", xp: 15 },
  { type: "record_min_notes",    params: { count: 5 },    description: "Capture une mélodie riche de 5 notes minimum", reward: "+25 XP", xp: 25 },
  { type: "share_recording",     params: {},              description: "Partage un spécimen avec la communauté",         reward: "+5 XP",  xp: 5 },
  { type: "record_with_note",    params: {},              description: "Ajoute une note personnelle du chercheur",       reward: "+5 XP",  xp: 5 },
  { type: "record_morning",      params: {},              description: "Contribue entre 6h et 10h du matin",            reward: "+8 XP",  xp: 8 },
  { type: "record_low_db",       params: { db: -45 },    description: "Enregistre un spécimen discret (< -45 dB)",     reward: "+10 XP", xp: 10 },
  { type: "record_count",        params: { count: 2 },    description: "2 spécimens dans la journée",                   reward: "+10 XP", xp: 10 },
  { type: "record_social",       params: {},              description: "Enregistre en présence de témoins",             reward: "+7 XP",  xp: 7 },
  { type: "record_specific_note",params: { note: "Mi" }, description: "Capture la note Mi dans ton corpus",             reward: "+10 XP", xp: 10 },
];

// Pick a deterministic challenge for a given date using its hash
function pickTemplateForDate(date: string): ChallengeTemplate {
  let hash = 0;
  for (const char of date) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return CHALLENGE_TEMPLATES[hash % CHALLENGE_TEMPLATES.length];
}

export async function getOrCreateTodaysChallenge(): Promise<DailyChallenge | null> {
  const today = new Date().toISOString().split("T")[0];

  // Check existing
  const { data: existing } = await supabase
    .from("daily_challenges")
    .select("*")
    .eq("date", today)
    .maybeSingle();

  if (existing) return existing as DailyChallenge;

  // Create from template
  const tpl = pickTemplateForDate(today);
  const { data, error } = await supabase
    .from("daily_challenges")
    .insert({
      date: today,
      challenge_type: tpl.type,
      challenge_params: tpl.params,
      challenge_description: tpl.description,
      reward_type: "xp",
      reward_value: tpl.reward,
    })
    .select()
    .single();

  if (error) {
    // Concurrent insert race — re-fetch
    const { data: retry } = await supabase
      .from("daily_challenges")
      .select("*")
      .eq("date", today)
      .maybeSingle();
    return (retry as DailyChallenge) ?? null;
  }
  return data as DailyChallenge;
}

export async function getTodaysProgress(
  userId: string,
  challengeId: number
): Promise<DailyChallengeProgress | null> {
  const challenge = await supabase
    .from("daily_challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (!challenge.data) return null;

  const { data: prog } = await supabase
    .from("user_daily_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .maybeSingle();

  return {
    challenge: challenge.data as DailyChallenge,
    completed: !!prog?.completed_at,
    completed_at: prog?.completed_at ?? null,
    progress: (prog?.progress ?? {}) as Record<string, unknown>,
  };
}

export async function claimDailyReward(
  userId: string,
  challengeId: number
): Promise<void> {
  await supabase
    .from("user_daily_progress")
    .upsert(
      { user_id: userId, challenge_id: challengeId, completed_at: new Date().toISOString() },
      { onConflict: "user_id,challenge_id" }
    );

  // Award XP from challenge reward_value
  const { data: ch } = await supabase
    .from("daily_challenges")
    .select("reward_value")
    .eq("id", challengeId)
    .single();

  if (ch?.reward_value) {
    const xp = parseInt(ch.reward_value.replace(/\D/g, "")) || 0;
    if (xp > 0) {
      try { await supabase.rpc("increment_xp", { p_user_id: userId, p_xp: xp }); } catch { /* rpc not deployed */ }
    }
  }
}

// ── XP / Level system ──────────────────────────────────────────────────────────

export function calculateLevel(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 250) return 2;
  if (xp < 500) return 3;
  // For levels 4+: level N requires 100 * (N-1)^1.5 total XP
  let level = 3;
  while (true) {
    const nextRequired = Math.floor(100 * Math.pow(level, 1.5));
    if (xp < nextRequired) return level;
    level++;
    if (level > 100) return 100;
  }
}

export function xpForNextLevel(currentLevel: number): number {
  if (currentLevel >= 100) return Infinity;
  if (currentLevel === 1) return 100;
  if (currentLevel === 2) return 250;
  if (currentLevel === 3) return 500;
  return Math.floor(100 * Math.pow(currentLevel, 1.5));
}

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level === 2) return 100;
  if (level === 3) return 250;
  return Math.floor(100 * Math.pow(level - 1, 1.5));
}

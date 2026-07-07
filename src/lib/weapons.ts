import { supabase } from "./supabase";

export type WeaponType = "canon" | "sirene" | "flechette" | "bardique" | "sniper" | "conventionnel";
export type WeaponRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface Weapon {
  id?: string;
  user_id?: string;
  recording_id?: string | null;
  name: string;
  weapon_type: WeaponType;
  power: number;
  range_stat: number;
  precision_stat: number;
  style_stat: number;
  overall_score: number;
  rarity: WeaponRarity;
  visual_seed: string;
  is_favorite?: boolean;
  battles_won?: number;
  battles_lost?: number;
  created_at?: string;
}

interface RecordingInput {
  id?: string;
  db_max?: number | null;
  duree_ms?: number | null;
  notes_count?: number | null;
  note_principale?: string | null;
}

function norm(val: number, min: number, max: number): number {
  return Math.round(Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100)));
}

function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(16).padStart(8, "0");
}

const WEAPON_NAMES: Record<WeaponType, { adjectives: string[]; nouns: string[] }> = {
  canon:         { adjectives: ["Tonitruant", "Foudroyant", "Grondant"],  nouns: ["Canon", "Boulet", "Tonnerre"] },
  sirene:        { adjectives: ["Strident", "Perçant", "Vibrant"],        nouns: ["Sirène", "Cri de Guerre", "Écho"] },
  flechette:     { adjectives: ["Précis", "Aigu", "Silencieux"],          nouns: ["Fléchette", "Dard", "Trait"] },
  bardique:      { adjectives: ["Mélodieux", "Harmonieux", "Inspiré"],    nouns: ["Ballade", "Mélodie", "Chant"] },
  sniper:        { adjectives: ["Chirurgical", "Calme", "Parfait"],       nouns: ["Sniper", "Visée Pure", "Piqûre"] },
  conventionnel: { adjectives: ["Honnête", "Robuste", "Fiable"],          nouns: ["Expulsion", "Souffle", "Prout Standard"] },
};

const RARITY_SUFFIXES: Record<WeaponRarity, string[]> = {
  common:    ["du Débutant", "du Dimanche", "Ordinaire"],
  uncommon:  ["du Chercheur", "de l'Apprenti", "Vaillant"],
  rare:      ["du Baron", "Distingué", "de Prestige"],
  epic:      ["des Enfers", "du Professeur", "Légendaire"],
  legendary: ["Mythique", "Primordial", "de l'Académie Suprême"],
};

export function generateWeaponFromRecording(rec: RecordingInput): Weapon {
  const power = norm(rec.db_max ?? -60, -60, 0);
  const range = norm(rec.duree_ms ?? 0, 0, 10000);
  const precision = rec.note_principale
    ? Math.min(100, Math.round(60 + Math.random() * 30))
    : Math.round(Math.random() * 50);
  const style = norm(rec.notes_count ?? 0, 0, 8);
  const overall = Math.round(power * 0.35 + range * 0.25 + precision * 0.2 + style * 0.2);

  let weapon_type: WeaponType;
  if (power > 80 && range < 30) weapon_type = "canon";
  else if (power > 60 && style > 60) weapon_type = "sirene";
  else if (range > 70) weapon_type = "flechette";
  else if (style > 80) weapon_type = "bardique";
  else if (precision > 85) weapon_type = "sniper";
  else weapon_type = "conventionnel";

  let rarity: WeaponRarity;
  if (overall >= 91) rarity = "legendary";
  else if (overall >= 76) rarity = "epic";
  else if (overall >= 61) rarity = "rare";
  else if (overall >= 41) rarity = "uncommon";
  else rarity = "common";

  const names = WEAPON_NAMES[weapon_type];
  const suffixes = RARITY_SUFFIXES[rarity];
  const adj = names.adjectives[Math.floor(Math.random() * names.adjectives.length)];
  const noun = names.nouns[Math.floor(Math.random() * names.nouns.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

  const visual_seed = simpleHash(`${weapon_type}-${power}-${range}-${overall}-${Date.now()}`);

  return {
    recording_id: rec.id ?? null,
    name: `${adj} ${noun} ${suffix}`,
    weapon_type,
    power,
    range_stat: range,
    precision_stat: precision,
    style_stat: style,
    overall_score: overall,
    rarity,
    visual_seed,
  };
}

export async function saveWeapon(userId: string, weapon: Weapon): Promise<Weapon | null> {
  const { data, error } = await supabase
    .from("weapons")
    .insert({ ...weapon, user_id: userId })
    .select()
    .single();
  if (error) return null;
  return data as Weapon;
}

export async function fetchUserWeapons(userId: string): Promise<Weapon[]> {
  const { data } = await supabase
    .from("weapons")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as Weapon[];
}

export async function toggleFavorite(weaponId: string, isFavorite: boolean): Promise<void> {
  await supabase.from("weapons").update({ is_favorite: isFavorite }).eq("id", weaponId);
}

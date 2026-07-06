import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "Variables Supabase manquantes. Copie .env.example en .env et renseigne VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Recording ──────────────────────────────────────────────────────────────

export interface RecordingPayload {
  audio_url: string | null;
  db_max: number;
  db_avg: number;
  note_principale: string | null;
  sequence_notes: { note: string; frequency: number; t: number }[];
  duree_ms: number;
  waveform_data: number[];
  alimentation?: string;
  lieu?: string;
  odeur?: string;
  user_id?: string;
  freq_max?: number | null;
  freq_min?: number | null;
  notes_count?: number;
  humeur?: string;
  social?: boolean;
  chercheur_note?: string;
}

export async function saveRecording(payload: RecordingPayload) {
  const { data, error } = await supabase
    .from("recordings")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Upload audio blob to Supabase Storage bucket "recordings"
// Returns the public URL, or throws on failure.
export async function uploadAudio(blob: Blob, userId: string): Promise<string> {
  const filename = `${userId}/${Date.now()}.webm`;
  const { error } = await supabase.storage
    .from("recordings")
    .upload(filename, blob, { contentType: "audio/webm", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("recordings").getPublicUrl(filename);
  return data.publicUrl;
}

// ── Leaderboard ────────────────────────────────────────────────────────────

export type LeaderboardCategory =
  | "db_max"
  | "duree_ms"
  | "freq_max"
  | "freq_min"
  | "notes_count";
export type LeaderboardPeriod = "day" | "week" | "month" | "year" | "all";
export type LeaderboardScope = "global" | "country" | "city" | "personal";

export interface LeaderboardRow {
  id: string;
  user_id?: string | null;
  pseudo?: string | null;
  db_max: number | null;
  duree_ms: number | null;
  note_principale: string | null;
  sequence_notes: { note: string; frequency: number; t: number }[] | null;
  created_at: string;
}

export async function fetchLeaderboard(
  category: "db_max" | "duree_ms",
  scope: "global" | "perso",
  userId?: string
) {
  let query = supabase
    .from("recordings")
    .select("*")
    .order(category, { ascending: false })
    .limit(50);
  if (scope === "perso" && userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchLeaderboardByPeriod(
  category: LeaderboardCategory,
  period: LeaderboardPeriod,
  scope: LeaderboardScope,
  filters: { country?: string; city?: string; userId?: string }
): Promise<LeaderboardRow[]> {
  // freq_max / freq_min / notes_count need client-side sort: fetch more rows with db_max ordering
  const needsClientSort =
    category === "freq_max" ||
    category === "freq_min" ||
    category === "notes_count";
  const dbColumn = needsClientSort ? "db_max" : category;

  let query = supabase
    .from("recordings")
    .select(
      "id, user_id, pseudo, db_max, duree_ms, note_principale, sequence_notes, created_at"
    )
    .order(dbColumn, { ascending: false, nullsFirst: false })
    .limit(needsClientSort ? 200 : 50);

  // Period filter
  if (period !== "all") {
    const now = new Date();
    let from: Date;
    if (period === "day") {
      from = new Date(now);
      from.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      from = new Date(now.getTime() - 7 * 86400000);
    } else if (period === "month") {
      from = new Date(now);
      from.setMonth(now.getMonth() - 1);
    } else {
      from = new Date(now);
      from.setFullYear(now.getFullYear() - 1);
    }
    query = query.gte("created_at", from.toISOString());
  }

  // Scope filter
  if (scope === "personal" && filters.userId) {
    query = query.eq("user_id", filters.userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  let rows = (data ?? []) as LeaderboardRow[];

  // Client-side sort for derived categories
  if (category === "freq_max") {
    rows = [...rows]
      .sort((a, b) => {
        const fA = Math.max(
          0,
          ...(a.sequence_notes ?? []).map((n) => n.frequency)
        );
        const fB = Math.max(
          0,
          ...(b.sequence_notes ?? []).map((n) => n.frequency)
        );
        return fB - fA;
      })
      .slice(0, 50);
  } else if (category === "freq_min") {
    rows = [...rows]
      .sort((a, b) => {
        const notesA = (a.sequence_notes ?? [])
          .map((n) => n.frequency)
          .filter((f) => isFinite(f));
        const notesB = (b.sequence_notes ?? [])
          .map((n) => n.frequency)
          .filter((f) => isFinite(f));
        const fA = notesA.length ? Math.min(...notesA) : Infinity;
        const fB = notesB.length ? Math.min(...notesB) : Infinity;
        return fA - fB;
      })
      .slice(0, 50);
  } else if (category === "notes_count") {
    rows = [...rows]
      .sort(
        (a, b) =>
          (b.sequence_notes?.length ?? 0) - (a.sequence_notes?.length ?? 0)
      )
      .slice(0, 50);
  }

  return rows;
}

export async function fetchLeaderboardCategories(
  userId?: string
): Promise<LeaderboardRow[]> {
  let query = supabase
    .from("recordings")
    .select(
      "id, pseudo, db_max, duree_ms, note_principale, sequence_notes, created_at"
    )
    .order("db_max", { ascending: false })
    .limit(100);
  if (userId) query = query.eq("user_id", userId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as LeaderboardRow[];
}

// ── Profile ────────────────────────────────────────────────────────────────

export interface ProfilePayload {
  id: string;
  pseudo: string | null;
  avatar: string;
  age: number | null;
  genre: string | null;
  pays: string | null;
  ville: string | null;
  poids: number | null;
  taille: number | null;
}

export interface PersonalStats {
  db_max: number | null;
  duree_max_ms: number | null;
  freq_max: number | null;
  freq_min: number | null;
  notes_max: number | null;
  total: number;
  note_frequente: string | null;
  streak: number;
}

export async function saveProfile(profile: ProfilePayload) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getProfile(
  userId: string
): Promise<ProfilePayload | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) return null;
  return data as ProfilePayload | null;
}

export interface WorldRank {
  category: string;
  rank: number;
}

export async function getWorldRanks(userId: string): Promise<WorldRank[]> {
  const { data, error } = await supabase.rpc("get_world_ranks", {
    p_user_id: userId,
  });
  if (error) throw error;
  return (data ?? []) as WorldRank[];
}

interface RecordingRow {
  db_max: number | null;
  duree_ms: number | null;
  note_principale: string | null;
  sequence_notes: { note: string; frequency: number; t: number }[] | null;
  created_at: string | null;
}

export async function getPersonalStats(userId: string): Promise<PersonalStats> {
  const empty: PersonalStats = {
    db_max: null,
    duree_max_ms: null,
    freq_max: null,
    freq_min: null,
    notes_max: null,
    total: 0,
    note_frequente: null,
    streak: 0,
  };
  try {
    const { data, error } = await supabase
      .from("recordings")
      .select("db_max, duree_ms, note_principale, sequence_notes, created_at")
      .eq("user_id", userId);
    if (error || !data || data.length === 0) return empty;

    const rows = data as RecordingRow[];
    const total = rows.length;

    const db_max = rows.reduce(
      (m, r) => Math.max(m, r.db_max ?? -Infinity),
      -Infinity
    );
    const duree_max_ms = rows.reduce((m, r) => Math.max(m, r.duree_ms ?? 0), 0);

    const allNotes = rows.flatMap((r) =>
      Array.isArray(r.sequence_notes) ? r.sequence_notes : []
    );
    const freq_max = allNotes.length
      ? allNotes.reduce((m, n) => Math.max(m, n.frequency), -Infinity)
      : null;
    const freq_min = allNotes.length
      ? allNotes.reduce((m, n) => Math.min(m, n.frequency), Infinity)
      : null;
    const notes_max = rows.reduce(
      (m, r) =>
        Math.max(
          m,
          Array.isArray(r.sequence_notes) ? r.sequence_notes.length : 0
        ),
      0
    );

    const noteCount: Record<string, number> = {};
    for (const n of allNotes) noteCount[n.note] = (noteCount[n.note] ?? 0) + 1;
    const note_frequente =
      Object.entries(noteCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const dateSet = new Set(
      rows
        .map((r) => r.created_at?.split("T")[0])
        .filter((d): d is string => Boolean(d))
    );
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];
    let streak = 0;
    if (dateSet.has(today) || dateSet.has(yesterday)) {
      let current = new Date(dateSet.has(today) ? today : yesterday);
      for (const date of [...dateSet].sort().reverse()) {
        const diff = Math.round(
          (current.getTime() - new Date(date).getTime()) / 86400000
        );
        if (diff <= 1) {
          streak++;
          current = new Date(date);
        } else break;
      }
    }

    return {
      db_max: isFinite(db_max) ? db_max : null,
      duree_max_ms: duree_max_ms > 0 ? duree_max_ms : null,
      freq_max: freq_max !== null && isFinite(freq_max) ? freq_max : null,
      freq_min: freq_min !== null && isFinite(freq_min) ? freq_min : null,
      notes_max: notes_max > 0 ? notes_max : null,
      total,
      note_frequente,
      streak,
    };
  } catch {
    return empty;
  }
}

// Fetch minimal recording data for mission checking
export async function fetchUserRecordings(
  userId: string
): Promise<
  Array<{
    note_principale: string | null;
    sequence_notes: { note: string; frequency: number; t: number }[] | null;
    db_max: number | null;
    lieu: string | null;
    alimentation: string | null;
    created_at: string | null;
  }>
> {
  const { data, error } = await supabase
    .from("recordings")
    .select("note_principale, sequence_notes, db_max, lieu, alimentation, created_at")
    .eq("user_id", userId);
  if (error) throw error;
  return data ?? [];
}

// ── Full recording for History ─────────────────────────────────────────────

export interface FullRecording {
  id: string;
  created_at: string;
  db_max: number | null;
  db_avg: number | null;
  note_principale: string | null;
  sequence_notes: { note: string; frequency: number; t: number }[] | null;
  duree_ms: number | null;
  audio_url: string | null;
  alimentation: string | null;
  lieu: string | null;
  odeur: string | null;
  freq_max: number | null;
  freq_min: number | null;
  notes_count: number | null;
  humeur: string | null;
  social: boolean | null;
  chercheur_note: string | null;
}

export async function fetchFullUserRecordings(
  userId: string
): Promise<FullRecording[]> {
  const { data, error } = await supabase
    .from("recordings")
    .select(
      "id, created_at, db_max, db_avg, note_principale, sequence_notes, duree_ms, audio_url, alimentation, lieu, odeur, freq_max, freq_min, notes_count, humeur, social, chercheur_note"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as FullRecording[];
}

export async function deleteRecording(id: string): Promise<void> {
  const { error } = await supabase.from("recordings").delete().eq("id", id);
  if (error) throw error;
}

// ── Compositions ───────────────────────────────────────────────────────────────

export interface CompositionNote {
  note: string;
  frequency: number;
  duration_ms: number;
  t: number;
}

export interface Composition {
  id: string;
  user_id: string | null;
  pseudo: string | null;
  title: string;
  notes: CompositionNote[];
  duration_ms: number;
  bpm: number | null;
  audio_url: string | null;
  created_at: string;
}

export interface CompositionPayload {
  user_id?: string;
  pseudo?: string;
  title: string;
  notes: CompositionNote[];
  duration_ms: number;
  bpm?: number;
  audio_url?: string | null;
}

export async function saveComposition(
  payload: CompositionPayload
): Promise<Composition> {
  const { data, error } = await supabase
    .from("compositions")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as Composition;
}

export async function fetchUserCompositions(
  userId: string
): Promise<Composition[]> {
  const { data, error } = await supabase
    .from("compositions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Composition[];
}

export async function deleteComposition(id: string): Promise<void> {
  const { error } = await supabase.from("compositions").delete().eq("id", id);
  if (error) throw error;
}

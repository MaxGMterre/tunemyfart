import { supabase } from "./supabase";

export type DuelCategory = "db_max" | "duree_ms" | "notes_count" | "freq_max";
export type DuelStatus = "pending" | "accepted" | "completed" | "expired" | "declined";

export interface Duel {
  id: string;
  challenger_id: string;
  challenged_id: string;
  category: DuelCategory;
  challenger_recording_id: string | null;
  challenged_recording_id: string | null;
  status: DuelStatus;
  winner_id: string | null;
  created_at: string;
  expires_at: string;
  challenger_profile?: { pseudo: string | null };
  challenged_profile?: { pseudo: string | null };
}

export const CATEGORY_LABELS: Record<DuelCategory, string> = {
  db_max: "Décibels maximaux",
  duree_ms: "Durée totale",
  notes_count: "Richesse mélodique",
  freq_max: "Fréquence maximale",
};

export async function createDuel(challengedId: string, category: DuelCategory): Promise<Duel> {
  const { data, error } = await supabase
    .from("duels")
    .insert({ challenged_id: challengedId, category })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyDuels(userId: string): Promise<Duel[]> {
  const { data, error } = await supabase
    .from("duels")
    .select("*")
    .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data ?? [];
}

export async function submitDuelRecording(
  duelId: string,
  userId: string,
  challengerId: string,
  recordingId: string,
): Promise<void> {
  const field = userId === challengerId ? "challenger_recording_id" : "challenged_recording_id";
  const { error } = await supabase.from("duels").update({ [field]: recordingId }).eq("id", duelId);
  if (error) throw error;
}

export async function resolveDuel(
  duel: Duel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _categoryValue: (r: { id: string }) => number,
): Promise<void> {
  // Resolution is done server-side in a real app. Client stub.
  const { error } = await supabase
    .from("duels")
    .update({ status: "completed" })
    .eq("id", duel.id);
  if (error) throw error;
}

export async function subscribeToMyDuels(userId: string, onEvent: (duel: Duel) => void) {
  return supabase
    .channel("duels-user")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "duels",
        filter: `challenged_id=eq.${userId}`,
      },
      (payload) => onEvent(payload.new as Duel),
    )
    .subscribe();
}

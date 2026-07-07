import { supabase } from "./supabase";
import { celebrate } from "./celebration";

export async function checkArtifactDrop(userId: string): Promise<string | null> {
  // 1% de chance
  if (Math.random() > 0.01) return null;

  // Récupère tous les artefacts et ceux possédés
  const [{ data: all }, { data: mine }] = await Promise.all([
    supabase.from("artifacts").select("id, name, slug"),
    supabase.from("user_artifacts").select("artifact_id").eq("user_id", userId),
  ]);

  if (!all || !mine) return null;
  const ownedIds = new Set(mine.map((r: { artifact_id: number }) => r.artifact_id));
  const available = all.filter((a: { id: number }) => !ownedIds.has(a.id));
  if (available.length === 0) return null;

  const artifact = available[Math.floor(Math.random() * available.length)] as {
    id: number;
    name: string;
    slug: string;
  };

  await supabase
    .from("user_artifacts")
    .insert({ user_id: userId, artifact_id: artifact.id });
  celebrate("stars");
  return artifact.name;
}

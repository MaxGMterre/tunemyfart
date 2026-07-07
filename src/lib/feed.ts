import { supabase } from "./supabase";

export interface FeedItem {
  id: number;
  user_id: string;
  action_type: string;
  target_type: string | null;
  target_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  like_count?: number;
  user_liked?: boolean;
  pseudo?: string | null;
}

export async function getFriendsFeed(userId: string, friendIds: string[]): Promise<FeedItem[]> {
  const allIds = [userId, ...friendIds];
  const { data, error } = await supabase
    .from("activity_feed")
    .select("*")
    .in("user_id", allIds)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

export async function getPublicFeed(): Promise<FeedItem[]> {
  const { data, error } = await supabase
    .from("activity_feed")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw error;
  return data ?? [];
}

export async function postFeedActivity(
  userId: string,
  actionType: string,
  targetType?: string,
  targetId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await supabase.from("activity_feed").insert({
    user_id: userId,
    action_type: actionType,
    target_type: targetType ?? null,
    target_id: targetId ?? null,
    metadata: metadata ?? {},
  });
}

export async function toggleLike(
  activityId: number,
  userId: string,
  currentlyLiked: boolean,
): Promise<void> {
  if (currentlyLiked) {
    await supabase
      .from("activity_likes")
      .delete()
      .eq("activity_id", activityId)
      .eq("user_id", userId);
  } else {
    await supabase.from("activity_likes").insert({ activity_id: activityId, user_id: userId });
  }
}

export async function getComments(activityId: number) {
  const { data } = await supabase
    .from("activity_comments")
    .select("*")
    .eq("activity_id", activityId)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function postComment(
  activityId: number,
  userId: string,
  content: string,
): Promise<void> {
  const sanitized = content.replace(/fuck|shit|bitch|ass(?!istant)/gi, "***");
  if (!sanitized.trim()) return;
  await supabase
    .from("activity_comments")
    .insert({ activity_id: activityId, user_id: userId, content: sanitized });
}

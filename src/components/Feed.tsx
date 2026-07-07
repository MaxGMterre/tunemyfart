import { useEffect, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabase";
import { useToast } from "./ui/Toast";
import { EmptyState } from "./EmptyState";

interface FeedItem {
  id: number;
  user_id: string;
  action_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
  pseudo?: string;
}

const ACTION_LABELS: Record<string, string> = {
  recording_saved: "a certifié un relevé",
  mission_completed: "a accompli une mission",
  duel_won: "a remporté un duel",
  composition_shared: "a partagé une composition",
  streak_milestone: "a atteint un nouveau record de streak",
  level_up: "a progressé au niveau",
};

const ACTION_ICONS: Record<string, string> = {
  recording_saved: "🎙",
  mission_completed: "🏆",
  duel_won: "⚔️",
  composition_shared: "🎹",
  streak_milestone: "🔥",
  level_up: "⬆️",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

export function Feed() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function loadFeed() {
      setLoading(true);
      try {
        const { data } = await supabase
          .from("activity_feed")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(30);
        setItems((data ?? []) as FeedItem[]);
      } catch {
        showToast("Erreur lors du chargement du fil", "error");
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
  }, [showToast]);

  async function toggleLike(itemId: number) {
    if (!user) {
      showToast("Connexion requise pour aimer une activité", "info");
      return;
    }

    const isLiked = likedIds.has(itemId);

    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(itemId);
      else next.add(itemId);
      return next;
    });

    try {
      if (isLiked) {
        await supabase
          .from("activity_likes")
          .delete()
          .eq("feed_id", itemId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("activity_likes")
          .insert({ feed_id: itemId, user_id: user.id });
      }
    } catch {
      // Revert optimistic update
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (isLiked) next.add(itemId);
        else next.delete(itemId);
        return next;
      });
      showToast("Erreur lors du like", "error");
    }
  }

  return (
    <div className="feed-panel">
      <div className="feed-header">
        <h2 className="feed-title">Communauté</h2>
        <p className="feed-subtitle">Activité du laboratoire</p>
      </div>

      {loading ? (
        <div className="feed-loading">Chargement du fil…</div>
      ) : items.length === 0 ? (
        <EmptyState variant="feed" />
      ) : (
        <div className="feed-list">
          {items.map((item, idx) => {
            const pseudo = item.pseudo ?? `Chercheur #${item.user_id.slice(0, 6)}`;
            const icon = ACTION_ICONS[item.action_type] ?? "📋";
            const label = ACTION_LABELS[item.action_type] ?? item.action_type;
            const liked = likedIds.has(item.id);

            return (
              <div key={item.id} className="feed-card" style={{ animationDelay: `${idx * 60}ms` }}>
                <span className="feed-icon">{icon}</span>
                <div className="feed-body">
                  <p className="feed-text">
                    <span className="feed-pseudo">{pseudo}</span> {label}
                  </p>
                  <p className="feed-time">{relativeTime(item.created_at)}</p>
                </div>
                <div className="feed-actions">
                  <button
                    className={`like-btn${liked ? " liked" : ""}`}
                    onClick={() => toggleLike(item.id)}
                    aria-label={liked ? "Retirer le like" : "Aimer"}
                  >
                    ❤️
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

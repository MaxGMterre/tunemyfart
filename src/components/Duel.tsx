import { useEffect, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabase";
import { useToast } from "./ui/Toast";

interface DuelItem {
  id: string;
  challenger_id: string;
  challenged_id: string;
  category: string;
  status: string;
  challenger_recording_id: string | null;
  challenged_recording_id: string | null;
  winner_id: string | null;
  created_at: string;
  expires_at: string | null;
}

type DuelCategory = "db_max" | "duree_ms" | "notes_count";

const CAT_LABELS: Record<DuelCategory, string> = {
  db_max: "Décibels maximaux",
  duree_ms: "Durée totale",
  notes_count: "Richesse mélodique",
};

const CAT_ICONS: Record<DuelCategory, string> = {
  db_max: "💥",
  duree_ms: "⏱",
  notes_count: "🎵",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  accepted: "En cours",
  completed: "Terminé",
  expired: "Expiré",
  declined: "Refusé",
};

function formatExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "";
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expiré";
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h restantes`;
  const days = Math.floor(diff / 86400000);
  return `${days}j restants`;
}

export function Duel() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [duels, setDuels] = useState<DuelItem[]>([]);
  const [friends, setFriends] = useState<{ id: string; pseudo: string; friend_code: string }[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DuelCategory>("db_max");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [view, setView] = useState<"list" | "create">("list");

  async function loadDuels() {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from("duels")
        .select("*")
        .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(20);
      setDuels((data ?? []) as DuelItem[]);
    } catch {
      showToast("Erreur lors du chargement des duels", "error");
    } finally {
      setLoading(false);
    }
  }

  async function loadFriends() {
    if (!user) return;
    try {
      const { data: friendsData } = await supabase
        .from("friendships")
        .select("friend_id, profiles!friendships_friend_id_fkey(pseudo, friend_code)")
        .eq("user_id", user.id);

      if (!friendsData) return;

      const mapped = friendsData
        .map((row) => {
          const profile = (row.profiles as unknown) as { pseudo: string; friend_code: string } | null;
          if (!profile || !row.friend_id) return null;
          return {
            id: row.friend_id as string,
            pseudo: profile.pseudo ?? `Chercheur #${(row.friend_id as string).slice(0, 6)}`,
            friend_code: profile.friend_code ?? "",
          };
        })
        .filter((f): f is { id: string; pseudo: string; friend_code: string } => f !== null);

      setFriends(mapped);
      if (mapped.length > 0 && !selectedFriend) {
        setSelectedFriend(mapped[0].id);
      }
    } catch {
      // friends not critical
    }
  }

  useEffect(() => {
    if (!user) return;
    loadDuels();
    loadFriends();

    const channel = supabase
      .channel("duels-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "duels",
          filter: `challenged_id=eq.${user.id}`,
        },
        () => {
          loadDuels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleCreateDuel() {
    if (!selectedFriend) return;
    setCreating(true);
    try {
      const { error } = await supabase.from("duels").insert({
        challenged_id: selectedFriend,
        category: selectedCategory,
      });
      if (error) throw error;
      showToast("Défi envoyé !", "success");
      setView("list");
      await loadDuels();
    } catch {
      showToast("Erreur lors de l'envoi du défi", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleAccept(duelId: string) {
    try {
      const { error } = await supabase
        .from("duels")
        .update({ status: "accepted" })
        .eq("id", duelId);
      if (error) throw error;
      showToast("Défi accepté !", "success");
      await loadDuels();
    } catch {
      showToast("Erreur lors de l'acceptation", "error");
    }
  }

  if (!user) {
    return (
      <div className="duel-panel">
        <div className="duel-empty">Connexion requise pour accéder aux duels.</div>
      </div>
    );
  }

  return (
    <div className="duel-panel">
      <div className="duel-header">
        <h2 className="duel-title">Salle des Duels</h2>
        <p className="duel-subtitle">Défis entre chercheurs</p>
      </div>

      <div className="duel-tabs">
        <button
          className={`duel-tab${view === "list" ? " active" : ""}`}
          onClick={() => setView("list")}
        >
          Mes duels
        </button>
        <button
          className={`duel-tab${view === "create" ? " active" : ""}`}
          onClick={() => setView("create")}
        >
          + Nouveau défi
        </button>
      </div>

      {view === "list" && (
        <div>
          {loading ? (
            <div className="duel-empty">Chargement…</div>
          ) : duels.length === 0 ? (
            <div className="duel-empty">
              Aucun défi en cours — provoquez un collègue !
            </div>
          ) : (
            <div className="duel-list">
              {duels.map((duel) => {
                const isChallenger = duel.challenger_id === user.id;
                const opponentId = isChallenger ? duel.challenged_id : duel.challenger_id;
                const cat = duel.category as DuelCategory;
                const statusKey = duel.status as keyof typeof STATUS_LABELS;
                const userHasPlayed = isChallenger
                  ? !!duel.challenger_recording_id
                  : !!duel.challenged_recording_id;

                return (
                  <div key={duel.id} className="duel-card">
                    <div className="duel-card-top">
                      <span className="duel-cat-icon">
                        {CAT_ICONS[cat] ?? "🎯"}
                      </span>
                      <span className="duel-cat-label">
                        {CAT_LABELS[cat] ?? cat}
                      </span>
                      <span className="duel-vs">
                        vs. Chercheur #{opponentId.slice(0, 6)}
                      </span>
                      <span className={`duel-status-badge duel-status-badge--${duel.status}`}>
                        {STATUS_LABELS[statusKey] ?? duel.status}
                      </span>
                    </div>

                    {duel.status === "completed" && duel.winner_id && (
                      <div style={{ fontSize: "0.7rem", fontFamily: "var(--font-mono)", color: "var(--color-violet)" }}>
                        {duel.winner_id === user.id ? "🏆 Victoire !" : "Défaite"}
                      </div>
                    )}

                    {duel.expires_at && duel.status !== "completed" && (
                      <div style={{ fontSize: "0.62rem", fontFamily: "var(--font-mono)", color: "var(--color-ink-soft)" }}>
                        {formatExpiry(duel.expires_at)}
                      </div>
                    )}

                    <div className="duel-card-actions">
                      {duel.status === "pending" && !isChallenger && (
                        <button
                          className="duel-action-btn"
                          onClick={() => handleAccept(duel.id)}
                        >
                          Accepter
                        </button>
                      )}
                      {duel.status === "accepted" && !userHasPlayed && (
                        <button className="duel-action-btn">
                          Jouer maintenant
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === "create" && (
        <div className="duel-create-form">
          <h3 className="duel-form-title">Lancer un défi</h3>

          {friends.length === 0 ? (
            <p className="duel-no-friends">
              Ajoutez des amis pour pouvoir les défier !
            </p>
          ) : (
            <>
              <div>
                <label className="duel-form-label">Adversaire</label>
                <select
                  className="duel-friend-select"
                  value={selectedFriend ?? ""}
                  onChange={(e) => setSelectedFriend(e.target.value)}
                >
                  {friends.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.pseudo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="duel-form-label">Catégorie</label>
                <div className="duel-category-row">
                  {(Object.keys(CAT_ICONS) as DuelCategory[]).map((cat) => (
                    <button
                      key={cat}
                      className={`duel-cat-btn${selectedCategory === cat ? " selected" : ""}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <span className="duel-cat-btn-icon">{CAT_ICONS[cat]}</span>
                      <span className="duel-cat-btn-name">{CAT_LABELS[cat]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="duel-send-btn"
                onClick={handleCreateDuel}
                disabled={creating || !selectedFriend}
              >
                {creating ? "Envoi…" : "Envoyer le défi"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

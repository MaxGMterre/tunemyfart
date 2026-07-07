import { useState, useEffect } from "react";
import {
  getOrCreateFriendCode,
  addFriendByCode,
  removeFriend,
  getFriends,
  type FriendInfo,
} from "../lib/supabase";
import { calculateLevel } from "../lib/daily-challenges";
import { useAuth } from "../lib/useAuth";
import { useToast } from "./ui/Toast";
import "./Friends.css";

export function Friends() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [myCode, setMyCode] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputCode, setInputCode] = useState("");
  const [adding, setAdding] = useState(false);
  const [copied, setCopied] = useState(false);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const [code, list] = await Promise.all([
          getOrCreateFriendCode(userId),
          getFriends(userId),
        ]);
        setMyCode(code);
        setFriends(list);
      } catch {
        // Supabase not configured
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleCopy = async () => {
    if (!myCode) return;
    try {
      await navigator.clipboard.writeText(myCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("Code copié !", "success");
    } catch {
      showToast(myCode, "info");
    }
  };

  const handleAdd = async () => {
    if (!userId || !inputCode.trim()) return;
    setAdding(true);
    try {
      await addFriendByCode(userId, inputCode.trim());
      const list = await getFriends(userId);
      setFriends(list);
      setInputCode("");
      showToast("Confrère ajouté au corpus social !", "success");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Code introuvable", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleRemove = async (friendId: string, pseudo: string | null) => {
    if (!userId) return;
    try {
      await removeFriend(userId, friendId);
      setFriends((prev) => prev.filter((f) => f.user_id !== friendId));
      showToast(`${pseudo ?? "Confrère"} retiré du corpus`, "info");
    } catch {
      showToast("Erreur lors de la suppression", "error");
    }
  };

  if (loading) {
    return <p className="status-text">Chargement du réseau social…</p>;
  }

  return (
    <div className="friends-panel">
      {/* My code */}
      <section className="friends-section">
        <div className="friends-section-title">Mon code de confrère</div>
        <div className="my-code-wrap">
          <span className="my-code">{myCode ?? "—"}</span>
          <button className="copy-code-btn" onClick={handleCopy} disabled={!myCode}>
            {copied ? "✓ Copié" : "Copier"}
          </button>
        </div>
        <p className="friends-hint">
          Partage ce code avec tes confrères pour comparer vos corpus.
        </p>
      </section>

      {/* Add friend */}
      <section className="friends-section">
        <div className="friends-section-title">Ajouter un confrère</div>
        <div className="add-friend-row">
          <input
            className="friend-code-input"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            placeholder="PROUT-XXXX"
            maxLength={10}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <button
            className="add-friend-btn"
            onClick={handleAdd}
            disabled={adding || !inputCode.trim()}
          >
            {adding ? "…" : "Ajouter"}
          </button>
        </div>
      </section>

      {/* Friends list */}
      <section className="friends-section">
        <div className="friends-section-title">
          Confrères ({friends.length})
        </div>
        {friends.length === 0 ? (
          <p className="friends-empty">
            Aucun confrère dans le réseau. Échange ton code pour collaborer !
          </p>
        ) : (
          <ul className="friends-list">
            {friends.map((f) => {
              const level = f.level ?? calculateLevel(f.xp ?? 0);
              return (
                <li key={f.user_id} className="friend-row">
                  <span className="friend-avatar">{f.avatar}</span>
                  <div className="friend-info">
                    <span className="friend-pseudo">
                      {f.pseudo ?? "Spécimen anonyme"}
                    </span>
                    <span className="friend-level">Niv. {level}</span>
                  </div>
                  {f.db_max != null && (
                    <span className="friend-score">
                      {f.db_max.toFixed(1)} dB
                    </span>
                  )}
                  <button
                    className="remove-friend-btn"
                    onClick={() => handleRemove(f.user_id, f.pseudo)}
                    aria-label={`Retirer ${f.pseudo ?? "ce confrère"}`}
                    title="Retirer du réseau"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

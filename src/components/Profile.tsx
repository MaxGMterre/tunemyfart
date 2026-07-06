import { useState, useEffect } from "react";
import { saveProfile, getProfile, getPersonalStats, getWorldRanks } from "../lib/supabase";
import type { ProfilePayload, PersonalStats } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

const AVATARS = ["💨", "🐛", "🦨", "🎵", "🔬", "💥"];

const BADGE_LEVELS = [
  { emoji: "🥚", label: "Novice",  min: 0,   max: 4   },
  { emoji: "💨", label: "Initié",  min: 5,   max: 19  },
  { emoji: "🌪️", label: "Vétéran", min: 20,  max: 49  },
  { emoji: "🏆", label: "Maître",  min: 50,  max: 99  },
  { emoji: "👑", label: "Légende", min: 100, max: Infinity },
];

function getBadge(count: number) {
  return BADGE_LEVELS.find(b => count >= b.min && count <= b.max) ?? BADGE_LEVELS[0];
}

function getUserId(): string {
  let id = localStorage.getItem("tmf_user_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("tmf_user_id", id);
  }
  return id;
}

interface FormState {
  pseudo: string;
  avatar: string;
  age: string;
  genre: string;
  pays: string;
  ville: string;
  poids: string;
  taille: string;
}

const WORLD_RANKS = [
  { emoji: "💥", label: "Niveau sonore", category: "db_max" },
  { emoji: "⏱️", label: "Endurance",     category: "duree_ms" },
  { emoji: "🎵", label: "Note aiguë",    category: "freq_max" },
  { emoji: "🎸", label: "Note grave",    category: "freq_min" },
  { emoji: "🎼", label: "Richesse",      category: "notes_count" },
  { emoji: "🔢", label: "Actif",         category: "total" },
];

export function Profile() {
  const { user, signOut, linkEmail } = useAuth();
  const userId = user?.id ?? getUserId();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState<PersonalStats | null>(null);
  const [worldRanks, setWorldRanks] = useState<Record<string, number>>({});
  const [form, setForm] = useState<FormState>({
    pseudo: "",
    avatar: "🦨",
    age: "",
    genre: "",
    pays: "",
    ville: "",
    poids: "",
    taille: "",
  });

  // Account linking state
  const [linkingAccount, setLinkingAccount] = useState(false);
  const [linkEmailVal, setLinkEmailVal] = useState("");
  const [linkPassword, setLinkPassword] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [profile, personalStats] = await Promise.all([
          getProfile(userId),
          getPersonalStats(userId),
        ]);
        if (profile) {
          setForm({
            pseudo: profile.pseudo ?? "",
            avatar: profile.avatar ?? "🦨",
            age: profile.age?.toString() ?? "",
            genre: profile.genre ?? "",
            pays: profile.pays ?? "",
            ville: profile.ville ?? "",
            poids: profile.poids?.toString() ?? "",
            taille: profile.taille?.toString() ?? "",
          });
        } else {
          setEditing(true);
        }
        setStats(personalStats);
      } catch {
        setEditing(true);
        setStats({ db_max: null, duree_max_ms: null, freq_max: null, freq_min: null, notes_max: null, total: 0, note_frequente: null, streak: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  useEffect(() => {
    if (!user) return;
    getWorldRanks(userId).then(ranks => {
      const map: Record<string, number> = {};
      for (const r of ranks) map[r.category] = r.rank;
      setWorldRanks(map);
    }).catch(() => {/* RPC not yet deployed */});
  }, [userId, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: ProfilePayload = {
        id: userId,
        pseudo: form.pseudo || null,
        avatar: form.avatar,
        age: form.age ? parseInt(form.age) : null,
        genre: form.genre || null,
        pays: form.pays || null,
        ville: form.ville || null,
        poids: form.poids ? parseFloat(form.poids) : null,
        taille: form.taille ? parseInt(form.taille) : null,
      };
      await saveProfile(payload);
      setEditing(false);
    } catch {
      // Supabase not configured yet
    } finally {
      setSaving(false);
    }
  };

  const handleLinkAccount = async () => {
    setLinkError(null);
    setLinking(true);
    try {
      await linkEmail(linkEmailVal, linkPassword);
      setLinkingAccount(false);
      setLinkEmailVal("");
      setLinkPassword("");
    } catch (e: unknown) {
      setLinkError(e instanceof Error ? e.message : "Erreur de liaison");
    } finally {
      setLinking(false);
    }
  };

  const badge = getBadge(stats?.total ?? 0);
  const nextBadge = BADGE_LEVELS.find(b => b.min > (stats?.total ?? 0));

  if (loading) {
    return <p className="status-text">Chargement du profil…</p>;
  }

  return (
    <div className="profile-panel">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">{form.avatar || "🦨"}</div>
        <div className="profile-identity">
          <div className="profile-pseudo">{form.pseudo || "Anonyme"}</div>
          <div className="profile-badge">
            <span className="badge-emoji">{badge.emoji}</span>
            <span className="badge-label">{badge.label}</span>
          </div>
          {stats && stats.streak > 0 && (
            <div className="profile-streak">
              🔥 {stats.streak} jour{stats.streak > 1 ? "s" : ""} consécutif{stats.streak > 1 ? "s" : ""}
            </div>
          )}
          {nextBadge && stats && (
            <div className="badge-progress-hint">
              {nextBadge.emoji} {nextBadge.label} dans {nextBadge.min - stats.total} analyse{nextBadge.min - stats.total > 1 ? "s" : ""}
            </div>
          )}
        </div>
        <button className="edit-btn" onClick={() => setEditing(e => !e)} aria-label="Modifier le profil">
          {editing ? "✕" : "✎"}
        </button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="profile-form">
          <div className="form-section-title">Modifier le profil</div>

          <div className="avatar-picker">
            {AVATARS.map(a => (
              <button
                key={a}
                className={`avatar-option${form.avatar === a ? " selected" : ""}`}
                onClick={() => setForm(f => ({ ...f, avatar: a }))}
              >
                {a}
              </button>
            ))}
          </div>

          <label className="form-field">
            Pseudo
            <input
              value={form.pseudo}
              onChange={e => setForm(f => ({ ...f, pseudo: e.target.value }))}
              placeholder="ex: SilentButDeadly"
            />
          </label>

          <div className="form-row">
            <label className="form-field">
              Âge
              <input
                type="number"
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                placeholder="ex: 28"
              />
            </label>
            <label className="form-field">
              Genre
              <select
                value={form.genre}
                onChange={e => setForm(f => ({ ...f, genre: e.target.value }))}
              >
                <option value="">—</option>
                <option value="homme">Homme</option>
                <option value="femme">Femme</option>
                <option value="autre">Autre</option>
                <option value="nsp">Préfère ne pas dire</option>
              </select>
            </label>
          </div>

          <div className="form-row">
            <label className="form-field">
              Pays
              <input
                value={form.pays}
                onChange={e => setForm(f => ({ ...f, pays: e.target.value }))}
                placeholder="ex: France"
              />
            </label>
            <label className="form-field">
              Ville
              <input
                value={form.ville}
                onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}
                placeholder="ex: Paris"
              />
            </label>
          </div>

          <div className="form-row">
            <label className="form-field">
              Poids (kg)
              <input
                type="number"
                value={form.poids}
                onChange={e => setForm(f => ({ ...f, poids: e.target.value }))}
                placeholder="ex: 75"
              />
            </label>
            <label className="form-field">
              Taille (cm)
              <input
                type="number"
                value={form.taille}
                onChange={e => setForm(f => ({ ...f, taille: e.target.value }))}
                placeholder="ex: 178"
              />
            </label>
          </div>

          <button className="save-profile-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Sauvegarde…" : "Sauvegarder"}
          </button>
        </div>
      )}

      {/* Signature sonore */}
      {stats?.note_frequente && (
        <div className="profile-section">
          <div className="section-title">Ma signature sonore</div>
          <div className="signature-note">
            <span className="signature-note-value">{stats.note_frequente}</span>
            <span className="signature-note-label">note la plus fréquente</span>
          </div>
        </div>
      )}

      {/* Records personnels */}
      <div className="profile-section">
        <div className="section-title">Mes records personnels</div>
        <div className="records-grid">
          <div className="record-card">
            <span className="record-emoji">💥</span>
            <span className="record-value">{stats?.db_max != null ? stats.db_max.toFixed(1) : "—"}</span>
            <span className="record-label">Plus fort (dB)</span>
          </div>
          <div className="record-card">
            <span className="record-emoji">⏱️</span>
            <span className="record-value">{stats?.duree_max_ms != null ? (stats.duree_max_ms / 1000).toFixed(2) : "—"}</span>
            <span className="record-label">Plus long (s)</span>
          </div>
          <div className="record-card">
            <span className="record-emoji">🎵</span>
            <span className="record-value">{stats?.freq_max != null ? `${stats.freq_max.toFixed(0)}` : "—"}</span>
            <span className="record-label">Plus aigu (Hz)</span>
          </div>
          <div className="record-card">
            <span className="record-emoji">🎸</span>
            <span className="record-value">{stats?.freq_min != null ? `${stats.freq_min.toFixed(0)}` : "—"}</span>
            <span className="record-label">Plus grave (Hz)</span>
          </div>
          <div className="record-card">
            <span className="record-emoji">🎼</span>
            <span className="record-value">{stats?.notes_max ?? "—"}</span>
            <span className="record-label">Mélodie + riche</span>
          </div>
          <div className="record-card">
            <span className="record-emoji">🔢</span>
            <span className="record-value">{stats?.total ?? 0}</span>
            <span className="record-label">Total analyses</span>
          </div>
        </div>
      </div>

      {/* Rang mondial */}
      <div className="profile-section">
        <div className="section-title">Mon rang mondial</div>
        <div className="world-ranks">
          {WORLD_RANKS.map(r => (
            <div key={r.label} className="world-rank-row">
              <span className="world-rank-emoji">{r.emoji}</span>
              <span className="world-rank-label">{r.label}</span>
              <span className="world-rank-pos">
                {worldRanks[r.category] != null ? `#${worldRanks[r.category]}` : "—"}
              </span>
            </div>
          ))}
        </div>
        {Object.keys(worldRanks).length === 0 && (
          <p className="world-rank-hint">Enregistre au moins une analyse pour voir ton rang.</p>
        )}
      </div>

      {/* Compte */}
      <div className="profile-section">
        <div className="section-title">Mon compte</div>
        {user?.is_anonymous ? (
          <div className="account-link-wrap">
            <p className="account-hint">Compte anonyme — lie une adresse e-mail pour ne pas perdre tes données.</p>
            {linkingAccount ? (
              <div className="account-link-form">
                <label className="form-field">
                  E-mail
                  <input
                    type="email"
                    value={linkEmailVal}
                    onChange={e => setLinkEmailVal(e.target.value)}
                    placeholder="ton@email.com"
                  />
                </label>
                <label className="form-field">
                  Mot de passe
                  <input
                    type="password"
                    value={linkPassword}
                    onChange={e => setLinkPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </label>
                {linkError && <p className="error-text">{linkError}</p>}
                <div className="account-link-actions">
                  <button className="save-profile-btn" onClick={handleLinkAccount} disabled={linking}>
                    {linking ? "Liaison…" : "Lier mon compte"}
                  </button>
                  <button className="edit-btn" onClick={() => setLinkingAccount(false)}>Annuler</button>
                </div>
              </div>
            ) : (
              <button className="link-account-btn" onClick={() => setLinkingAccount(true)}>
                Lier une adresse e-mail
              </button>
            )}
          </div>
        ) : (
          <p className="account-email">{user?.email}</p>
        )}
        <button className="signout-btn" onClick={signOut}>Se déconnecter</button>
      </div>
    </div>
  );
}

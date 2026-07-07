import { useState, useEffect } from "react";
import {
  saveProfile,
  getProfile,
  getPersonalStats,
  getWorldRanks,
} from "../lib/supabase";
import type { ProfilePayload, PersonalStats } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";
import { Settings } from "./Settings";
import { Friends } from "./Friends";
import { DailyChallenge, XpLevelBar } from "./DailyChallenge";
import { ACHIEVEMENTS } from "../lib/missions";
import "./DailyChallenge.css";
import "./Friends.css";

const AVATARS = ["💨", "🐛", "🦨", "🎵", "🔬", "💥"];

const BADGE_LEVELS = [
  { emoji: "🥚", label: "Novice", min: 0, max: 4 },
  { emoji: "💨", label: "Initié", min: 5, max: 19 },
  { emoji: "🌪️", label: "Vétéran", min: 20, max: 49 },
  { emoji: "🏆", label: "Maître", min: 50, max: 99 },
  { emoji: "👑", label: "Légende", min: 100, max: Infinity },
];

function getBadge(count: number) {
  return (
    BADGE_LEVELS.find((b) => count >= b.min && count <= b.max) ??
    BADGE_LEVELS[0]
  );
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
  { emoji: "⏱️", label: "Endurance", category: "duree_ms" },
  { emoji: "🎵", label: "Note aiguë", category: "freq_max" },
  { emoji: "🎸", label: "Note grave", category: "freq_min" },
  { emoji: "🎼", label: "Richesse", category: "notes_count" },
  { emoji: "🔢", label: "Actif", category: "total" },
];

const STREAK_MILESTONES = [
  { days: 3,   label: "Assidu",                    reward: "+XP bonus" },
  { days: 7,   label: "Chercheur régulier",         reward: "Titre" },
  { days: 14,  label: "Laborantin confirmé",        reward: "Thème" },
  { days: 30,  label: "Chercheur émérite",          reward: "Titre rare" },
  { days: 100, label: "Immortel du laboratoire",    reward: "Avatar exclusif" },
  { days: 365, label: "Patriarche de la sonoflatulogie", reward: "Titre légendaire" },
];

function StreakCalendar({ dates }: { dates: string[] }) {
  const dateSet = new Set(dates);
  const today = new Date();
  const DAYS = 91;
  const cells: { date: string; active: boolean }[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    cells.push({ date: iso, active: dateSet.has(iso) });
  }
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  return (
    <div className="streak-calendar">
      {weeks.map((week, wi) => (
        <div key={wi} className="streak-week">
          {week.map((c) => (
            <div
              key={c.date}
              className={`streak-day${c.active ? " streak-day--active" : ""}`}
              title={c.date}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface ProfileProps {
  onTabChange?: (tab: string) => void;
}

export function Profile({ onTabChange: _onTabChange }: ProfileProps = {}) {
  const { user, signOut, linkEmail } = useAuth();
  const userId = user?.id ?? getUserId();
  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [showStreakCalendar, setShowStreakCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileXp, setProfileXp] = useState(0);
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
          const anyProfile = profile as unknown as Record<string, unknown>;
          if (anyProfile.xp != null) {
            setProfileXp(Number(anyProfile.xp) || 0);
          }
        } else {
          setEditing(true);
        }
        setStats(personalStats);
      } catch {
        setEditing(true);
        setStats({
          db_max: null,
          duree_max_ms: null,
          freq_max: null,
          freq_min: null,
          notes_max: null,
          total: 0,
          note_frequente: null,
          streak: 0,
          recordingDates: [],
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  useEffect(() => {
    if (!user) return;
    getWorldRanks(userId)
      .then((ranks) => {
        const map: Record<string, number> = {};
        for (const r of ranks) map[r.category] = r.rank;
        setWorldRanks(map);
      })
      .catch(() => {
        /* RPC not yet deployed */
      });
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
      setLinkError(e instanceof Error ? e.message : "Liaison du dossier impossible — contactez le secrétariat du laboratoire.");
    } finally {
      setLinking(false);
    }
  };

  const badge = getBadge(stats?.total ?? 0);
  const nextBadge = BADGE_LEVELS.find((b) => b.min > (stats?.total ?? 0));

  // Read completed achievements from localStorage
  const completedMissionIds = JSON.parse(localStorage.getItem("tmf_completed_missions") ?? "[]") as string[];
  const unlockedAchievements = ACHIEVEMENTS.filter((a) => completedMissionIds.includes(a.id));

  if (loading) {
    return <p className="status-text">Consultation du registre en cours…</p>;
  }

  if (showFriends) {
    return (
      <div className="profile-panel">
        <button className="edit-btn" onClick={() => setShowFriends(false)} style={{ marginBottom: "1rem" }}>
          ← Retour
        </button>
        <Friends />
      </div>
    );
  }

  return (
    <div className="profile-panel">
      {/* Daily challenge banner */}
      <DailyChallenge onXpUpdated={() => {
        // Reload XP from profile
        getProfile(userId).then((p) => {
          const anyP = p as unknown as Record<string, unknown> | null;
          if (anyP?.xp != null) {
            setProfileXp(Number(anyP.xp) || 0);
          }
        }).catch(() => {});
      }} />

      {/* XP / Level bar */}
      {profileXp > 0 && (
        <div className="profile-section">
          <XpLevelBar xp={profileXp} />
        </div>
      )}

      {/* Header */}
      <div className="profile-header">
        <div className="profile-avatar">{form.avatar || "🦨"}</div>
        <div className="profile-identity">
          <div className="profile-pseudo">
            {form.pseudo || "Spécimen anonyme"}
          </div>
          <div className="profile-badge">
            <span className="badge-emoji">{badge.emoji}</span>
            <span className="badge-label">{badge.label}</span>
          </div>
          {stats && stats.streak > 0 && (
            <button
              className={`profile-streak${stats.streak >= 7 ? " profile-streak--big" : ""}`}
              onClick={() => setShowStreakCalendar((v) => !v)}
              aria-expanded={showStreakCalendar}
            >
              <span className={`streak-flame${stats.streak >= 7 ? " streak-flame--pulse" : ""}`}>🔥</span>
              <span className="streak-count">{stats.streak}</span>
              <span className="streak-label">jour{stats.streak > 1 ? "s" : ""}</span>
            </button>
          )}
          {nextBadge && stats && (
            <div className="badge-progress-hint">
              {nextBadge.emoji} {nextBadge.label} dans{" "}
              {nextBadge.min - stats.total} relevé
              {nextBadge.min - stats.total > 1 ? "s" : ""}
            </div>
          )}
        </div>
        <div className="profile-header-actions">
          <button
            className="edit-btn"
            onClick={() => setShowSettings(true)}
            aria-label="Paramètres"
          >
            ⚙️
          </button>
          <button
            className="edit-btn"
            onClick={() => setEditing((e) => !e)}
            aria-label="Modifier la fiche spécimen"
          >
            {editing ? "✕" : "✎"}
          </button>
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="profile-form">
          <div className="form-section-title">Éditer la fiche spécimen</div>

          <div className="avatar-picker">
            {AVATARS.map((a) => (
              <button
                key={a}
                className={`avatar-option${
                  form.avatar === a ? " selected" : ""
                }`}
                onClick={() => setForm((f) => ({ ...f, avatar: a }))}
              >
                {a}
              </button>
            ))}
          </div>

          <label className="form-field">
            Pseudo
            <input
              value={form.pseudo}
              onChange={(e) =>
                setForm((f) => ({ ...f, pseudo: e.target.value }))
              }
              placeholder="ex: SilentButDeadly"
            />
          </label>

          <div className="form-row">
            <label className="form-field">
              Âge
              <input
                type="number"
                value={form.age}
                onChange={(e) =>
                  setForm((f) => ({ ...f, age: e.target.value }))
                }
                placeholder="ex: 28"
              />
            </label>
            <label className="form-field">
              Genre
              <select
                value={form.genre}
                onChange={(e) =>
                  setForm((f) => ({ ...f, genre: e.target.value }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, pays: e.target.value }))
                }
                placeholder="ex: France"
              />
            </label>
            <label className="form-field">
              Ville
              <input
                value={form.ville}
                onChange={(e) =>
                  setForm((f) => ({ ...f, ville: e.target.value }))
                }
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, poids: e.target.value }))
                }
                placeholder="ex: 75"
              />
            </label>
            <label className="form-field">
              Taille (cm)
              <input
                type="number"
                value={form.taille}
                onChange={(e) =>
                  setForm((f) => ({ ...f, taille: e.target.value }))
                }
                placeholder="ex: 178"
              />
            </label>
          </div>

          <button
            className="save-profile-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Certification…" : "Certifier le profil"}
          </button>
        </div>
      )}

      {/* Signature acoustique */}
      {stats?.note_frequente && (
        <div className="profile-section">
          <div className="section-title">Signature acoustique</div>
          <div className="signature-note">
            <span className="signature-note-value">{stats.note_frequente}</span>
            <span className="signature-note-label">
              note dominante du corpus
            </span>
          </div>
        </div>
      )}

      {/* Records personnels */}
      <div className="profile-section">
        <div className="section-title">Relevés d'exception</div>
        <div className="records-grid">
          <div className="record-card">
            <span className="record-emoji">💥</span>
            <span className="record-value">
              {stats?.db_max != null ? stats.db_max.toFixed(1) : "—"}
            </span>
            <span className="record-label">Pic sonore (dB)</span>
          </div>
          <div className="record-card">
            <span className="record-emoji">⏱️</span>
            <span className="record-value">
              {stats?.duree_max_ms != null
                ? (stats.duree_max_ms / 1000).toFixed(2)
                : "—"}
            </span>
            <span className="record-label">Endurance (s)</span>
          </div>
          <div className="record-card">
            <span className="record-emoji">🎵</span>
            <span className="record-value">
              {stats?.freq_max != null ? `${stats.freq_max.toFixed(0)}` : "—"}
            </span>
            <span className="record-label">Registre aigu (Hz)</span>
          </div>
          <div className="record-card">
            <span className="record-emoji">🎸</span>
            <span className="record-value">
              {stats?.freq_min != null ? `${stats.freq_min.toFixed(0)}` : "—"}
            </span>
            <span className="record-label">Registre grave (Hz)</span>
          </div>
          <div className="record-card">
            <span className="record-emoji">🎼</span>
            <span className="record-value">{stats?.notes_max ?? "—"}</span>
            <span className="record-label">Complexité max</span>
          </div>
          <div className="record-card">
            <span className="record-emoji">🔬</span>
            <span className="record-value">{stats?.total ?? 0}</span>
            <span className="record-label">Corpus total</span>
          </div>
        </div>
      </div>

      {/* Succès secrets */}
      <div className="profile-section">
        <button
          className="section-title section-title--toggle"
          onClick={() => setAchievementsOpen((o) => !o)}
          aria-expanded={achievementsOpen}
        >
          <span>Succès secrets</span>
          <span className="achievements-count">
            {unlockedAchievements.length}/{ACHIEVEMENTS.length} {achievementsOpen ? "▲" : "▼"}
          </span>
        </button>
        {achievementsOpen && (
          <div className="achievements-grid">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = completedMissionIds.includes(a.id);
              return (
                <div
                  key={a.id}
                  className={`achievement-chip${unlocked ? " achievement-chip--unlocked" : ""}`}
                  title={unlocked ? `${a.titre}: ${a.description}` : "???"}
                >
                  <span className="achievement-emoji">{unlocked ? a.emoji : "🔒"}</span>
                  <span className="achievement-name">{unlocked ? a.titre : "???"}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Streak calendar + milestones */}
      {stats && stats.streak > 0 && showStreakCalendar && (
        <div className="profile-section">
          <div className="section-title">Calendrier d'activité — 13 semaines</div>
          <StreakCalendar dates={stats.recordingDates} />
          <div className="streak-milestones">
            {STREAK_MILESTONES.map((m) => {
              const reached = stats.streak >= m.days;
              return (
                <div key={m.days} className={`streak-milestone${reached ? " reached" : ""}`}>
                  <span className="sm-days">{m.days}j</span>
                  <span className="sm-label">{m.label}</span>
                  <span className="sm-reward">{reached ? "✓" : m.reward}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confrères */}
      <div className="profile-section">
        <div className="section-title">Réseau social du laboratoire</div>
        <button className="settings-link-btn" onClick={() => setShowFriends(true)}>
          Gérer mes confrères →
        </button>
      </div>

      {/* Rang mondial */}
      <div className="profile-section">
        <div className="section-title">Position dans les registres</div>
        <div className="world-ranks">
          {WORLD_RANKS.map((r) => (
            <div key={r.label} className="world-rank-row">
              <span className="world-rank-emoji">{r.emoji}</span>
              <span className="world-rank-label">{r.label}</span>
              <span className="world-rank-pos">
                {worldRanks[r.category] != null
                  ? `#${worldRanks[r.category]}`
                  : "—"}
              </span>
            </div>
          ))}
        </div>
        {Object.keys(worldRanks).length === 0 && (
          <p className="world-rank-hint">
            Certifie un premier relevé pour apparaître dans les registres des
            confrères.
          </p>
        )}
      </div>

      {/* Compte */}
      <div className="profile-section">
        <div className="section-title">Identification du spécimen</div>
        {user?.is_anonymous ? (
          <div className="account-link-wrap">
            <p className="account-hint">
              Spécimen anonyme — associe une adresse e-mail pour préserver ton
              corpus.
            </p>
            {linkingAccount ? (
              <div className="account-link-form">
                <label className="form-field">
                  E-mail
                  <input
                    type="email"
                    value={linkEmailVal}
                    onChange={(e) => setLinkEmailVal(e.target.value)}
                    placeholder="ton@email.com"
                  />
                </label>
                <label className="form-field">
                  Mot de passe
                  <input
                    type="password"
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </label>
                {linkError && <p className="error-text">{linkError}</p>}
                <div className="account-link-actions">
                  <button
                    className="save-profile-btn"
                    onClick={handleLinkAccount}
                    disabled={linking}
                  >
                    {linking ? "Liaison…" : "Associer le compte"}
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => setLinkingAccount(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="link-account-btn"
                onClick={() => setLinkingAccount(true)}
              >
                Associer une adresse e-mail
              </button>
            )}
          </div>
        ) : (
          <p className="account-email">{user?.email}</p>
        )}
        <button className="signout-btn" onClick={signOut}>
          Quitter le laboratoire
        </button>
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

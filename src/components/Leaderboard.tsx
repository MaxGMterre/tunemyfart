import { useEffect, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { fetchLeaderboardByPeriod, getProfile } from "../lib/supabase";
import type {
  LeaderboardCategory,
  LeaderboardPeriod,
  LeaderboardScope,
  LeaderboardRow,
} from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

const CATEGORIES: {
  id: LeaderboardCategory;
  label: string;
  emoji: string;
  format: (row: LeaderboardRow) => string;
}[] = [
  {
    id: "db_max",
    label: "Intensité",
    emoji: "💥",
    format: (r) => `${(r.db_max ?? 0).toFixed(1)} dB`,
  },
  {
    id: "duree_ms",
    label: "Endurance",
    emoji: "⏱️",
    format: (r) => `${((r.duree_ms ?? 0) / 1000).toFixed(2)} s`,
  },
  {
    id: "freq_max",
    label: "Registre aigu",
    emoji: "🎵",
    format: (r) => {
      const f = Math.max(
        0,
        ...(r.sequence_notes ?? []).map((n) => n.frequency)
      );
      return f > 0 ? `${f.toFixed(0)} Hz` : "— Hz";
    },
  },
  {
    id: "freq_min",
    label: "Registre grave",
    emoji: "🎸",
    format: (r) => {
      const freqs = (r.sequence_notes ?? [])
        .map((n) => n.frequency)
        .filter((f) => isFinite(f));
      const f = freqs.length ? Math.min(...freqs) : 0;
      return f > 0 ? `${f.toFixed(0)} Hz` : "— Hz";
    },
  },
  {
    id: "notes_count",
    label: "Complexité",
    emoji: "🎼",
    format: (r) => `${r.sequence_notes?.length ?? 0} notes`,
  },
];

const PERIODS: { id: LeaderboardPeriod; label: string }[] = [
  { id: "day", label: "Jour" },
  { id: "week", label: "Semaine" },
  { id: "month", label: "Mois" },
  { id: "year", label: "Année" },
  { id: "all", label: "Tout" },
];

const SCOPES: { id: LeaderboardScope; label: string }[] = [
  { id: "global", label: "Mondial" },
  { id: "friends", label: "Amis" },
  { id: "country", label: "Pays" },
  { id: "city", label: "Région" },
  { id: "personal", label: "Personnel" },
];

export function Leaderboard() {
  const { user } = useAuth();
  const [category, setCategory] = useState<LeaderboardCategory>("db_max");
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const [scope, setScope] = useState<LeaderboardScope>("global");
  const [hasLocation, setHasLocation] = useState(false);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [seasonFilter, setSeasonFilter] = useState(false);
  const [listParent] = useAutoAnimate();

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then((p) => setHasLocation(Boolean(p?.pays)));
  }, [user]);

  useEffect(() => {
    setLoading(true);
    setLoadError(null);
    const effectiveScope =
      (scope === "country" || scope === "city") && !hasLocation
        ? "global"
        : scope;

    fetchLeaderboardByPeriod(category, period, effectiveScope, {
      userId: user?.id,
    })
      .then((data) => setRows(data))
      .catch(() =>
        setLoadError(
          "Registres indisponibles — vérification de la configuration Supabase requise."
        )
      )
      .finally(() => setLoading(false));
  }, [category, period, scope, user, hasLocation]);

  const activeCat = CATEGORIES.find((c) => c.id === category)!;

  const seasonCutoff = new Date();
  seasonCutoff.setDate(seasonCutoff.getDate() - 30);
  const filteredRows = seasonFilter
    ? rows.filter((r) => r.created_at && new Date(r.created_at) >= seasonCutoff)
    : rows;

  const top3 = filteredRows.slice(0, 3);
  const rest = filteredRows.slice(3);

  return (
    <div className="leaderboard-panel">
      {/* Period selector */}
      <div className="leaderboard-periods">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            className={period === p.id ? "active" : ""}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Category tabs */}
      <div className="leaderboard-categories">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={category === c.id ? "active" : ""}
            onClick={() => setCategory(c.id)}
          >
            <span className="cat-emoji">{c.emoji}</span>
            <span className="cat-label">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Scope selector */}
      <div className="leaderboard-scopes">
        {SCOPES.map((s) => {
          const needsLocation =
            (s.id === "country" || s.id === "city") && !hasLocation;
          const needsAuth = s.id === "friends" && !user;
          return (
            <button
              key={s.id}
              className={[
                scope === s.id ? "active" : "",
                needsLocation || needsAuth ? "coming-soon" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => {
                if (!needsLocation && !needsAuth) setScope(s.id);
              }}
              title={
                needsLocation
                  ? "Renseigne ta localisation dans ta fiche spécimen pour activer ce filtre"
                  : needsAuth
                  ? "Connecte-toi pour voir le classement de tes confrères"
                  : undefined
              }
            >
              {s.label}
              {(needsLocation || needsAuth) && <span className="soon-badge">{needsAuth ? "login" : "bientôt"}</span>}
            </button>
          );
        })}
      </div>

      {/* Season filter */}
      <div className="leaderboard-season-row">
        <button
          className={`leaderboard-season-btn${seasonFilter ? " active" : ""}`}
          onClick={() => setSeasonFilter(!seasonFilter)}
        >
          🏆 Saison
        </button>
      </div>

      {loading && (
        <p className="status-text" role="status">
          Interrogation des registres…
        </p>
      )}
      {loadError && (
        <p className="error-text" role="alert">
          {loadError}
        </p>
      )}

      {!loading && !loadError && rows.length === 0 && (
        <div className="lb-empty">
          <span className="lb-empty-skunk">🦨</span>
          <p className="lb-empty-text">
            Le laboratoire est vide —<br />
            sois le premier à contribuer à la science.
          </p>
        </div>
      )}

      {/* Podium — top 3 */}
      {!loading && rows.length > 0 && (
        <div className="lb-podium">
          {/* 2nd place */}
          {top3[1] ? (
            <div
              className={`podium-slot podium-slot--2nd${
                top3[1].user_id === user?.id ? " podium-slot--own" : ""
              }`}
            >
              <div className="podium-info">
                <div className="podium-pseudo">
                  {top3[1].pseudo ?? "Spécimen anonyme"}
                </div>
                <div className="podium-score">{activeCat.format(top3[1])}</div>
              </div>
              <div className="podium-bar podium-bar--2nd">🥈</div>
            </div>
          ) : (
            <div className="podium-slot podium-slot--2nd podium-slot--empty">
              <div className="podium-bar podium-bar--2nd" />
            </div>
          )}

          {/* 1st place */}
          <div
            className={`podium-slot podium-slot--1st${
              top3[0].user_id === user?.id ? " podium-slot--own" : ""
            }`}
          >
            <div className="podium-info">
              <div className="podium-pseudo">
                {top3[0].pseudo ?? "Spécimen anonyme"}
              </div>
              <div className="podium-score">{activeCat.format(top3[0])}</div>
            </div>
            <div className="podium-bar podium-bar--1st">🥇</div>
          </div>

          {/* 3rd place */}
          {top3[2] ? (
            <div
              className={`podium-slot podium-slot--3rd${
                top3[2].user_id === user?.id ? " podium-slot--own" : ""
              }`}
            >
              <div className="podium-info">
                <div className="podium-pseudo">
                  {top3[2].pseudo ?? "Spécimen anonyme"}
                </div>
                <div className="podium-score">{activeCat.format(top3[2])}</div>
              </div>
              <div className="podium-bar podium-bar--3rd">🥉</div>
            </div>
          ) : (
            <div className="podium-slot podium-slot--3rd podium-slot--empty">
              <div className="podium-bar podium-bar--3rd" />
            </div>
          )}
        </div>
      )}

      {/* Rows 4+ */}
      {rest.length > 0 && (
        <ol className="leaderboard-list" start={4} ref={listParent}>
          {rest.map((row, i) => (
            <li
              key={row.id}
              className={`leaderboard-row${
                row.user_id === user?.id ? " leaderboard-row--own" : ""
              }`}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <span className="rank">{i + 4}</span>
              <span className="who">{row.pseudo ?? "Spécimen anonyme"}</span>
              <span className="score">{activeCat.format(row)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

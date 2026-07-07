import { useCallback, useEffect, useRef, useState } from "react";
import { fetchFullUserRecordings, deleteRecording } from "../lib/supabase";
import type { FullRecording } from "../lib/supabase";
import type { RecordingResult } from "../lib/useRecorder";
import { useAuth } from "../lib/useAuth";
import { useToast } from "./ui/Toast";
import { Loading } from "./ui/Loading";
import { EmptyState as EmptyStateSimple } from "./ui/EmptyState";
import { EmptyState } from "./EmptyState";
import { ShareCard } from "./ShareCard";

// ── Helpers ────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDuration(ms: number | null) {
  if (!ms) return "—";
  return `${(ms / 1000).toFixed(2)} s`;
}

// ── 30-day chart ──────────────────────────────────────────

function Chart30({ recordings }: { recordings: FullRecording[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Build 30-day buckets
    const days: Record<string, number> = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      days[d.toISOString().split("T")[0]] = 0;
    }
    for (const r of recordings) {
      const key = r.created_at.split("T")[0];
      if (key in days) days[key]++;
    }

    const values = Object.values(days);
    const maxVal = Math.max(1, ...values);
    const barW = W / 30;
    const padY = 4;

    values.forEach((v, i) => {
      const barH = (v / maxVal) * (H - padY * 2) || 2;
      const x = i * barW + 1;
      const y = H - barH - padY;
      ctx.fillStyle = v > 0 ? "#C99A3D" : "rgba(27,42,65,0.1)";
      ctx.beginPath();
      ctx.roundRect(x, y, barW - 2, barH, 1);
      ctx.fill();
    });
  }, [recordings]);

  return (
    <canvas
      ref={canvasRef}
      className="history-chart"
      width={600}
      height={60}
      aria-label="Activité sur 30 jours"
    />
  );
}

// ── Filters ───────────────────────────────────────────────

type Period = "all" | "today" | "week" | "month";

function filterByPeriod(
  recordings: FullRecording[],
  period: Period
): FullRecording[] {
  if (period === "all") return recordings;
  const now = Date.now();
  const cutoffs: Record<Period, number> = {
    today: new Date().setHours(0, 0, 0, 0),
    week: now - 7 * 86400000,
    month: now - 30 * 86400000,
    all: 0,
  };
  const cutoff = cutoffs[period];
  return recordings.filter((r) => new Date(r.created_at).getTime() >= cutoff);
}

// ── Main component ────────────────────────────────────────

export function History({
  onTabChange,
}: {
  onTabChange?: (tab: string) => void;
}) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [recordings, setRecordings] = useState<FullRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("all");
  const [noteFilter, setNoteFilter] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<FullRecording | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await fetchFullUserRecordings(user.id);
      setRecordings(data);
    } catch {
      showToast("Le laboratoire ne répond plus — vérification du réseau en cours.", "error");
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (id: string) => {
    try {
      await deleteRecording(id);
      setRecordings((prev) => prev.filter((r) => r.id !== id));
      setDeleteConfirm(null);
      showToast("Relevé retiré du corpus.", "success");
    } catch {
      showToast("Suppression impossible.", "error");
    }
  };

  const togglePlay = (rec: FullRecording) => {
    if (!rec.audio_url) return;
    if (playingId === rec.id) {
      audioRef.current?.pause();
      setPlayingId(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(rec.audio_url);
    audioRef.current = audio;
    audio.play().catch(() => showToast("Lecture impossible.", "error"));
    setPlayingId(rec.id);
    audio.onended = () => setPlayingId(null);
  };

  // Derived data
  const allNotes = Array.from(
    new Set(
      recordings.map((r) => r.note_principale).filter(Boolean) as string[]
    )
  ).sort();
  const filtered = filterByPeriod(recordings, period).filter(
    (r) => noteFilter === "all" || r.note_principale === noteFilter
  );

  // Stats for header
  const avgDb = recordings.length
    ? (
        recordings.reduce((s, r) => s + (r.db_max ?? 0), 0) / recordings.length
      ).toFixed(1)
    : null;
  const freqNote = (() => {
    const count: Record<string, number> = {};
    for (const r of recordings)
      if (r.note_principale)
        count[r.note_principale] = (count[r.note_principale] ?? 0) + 1;
    return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  })();

  if (loading) return <Loading label="Récupération du corpus…" />;

  if (!user) {
    return (
      <EmptyStateSimple
        message="Connecte-toi pour accéder à ton corpus."
        ctaLabel="Créer un compte"
        onCta={() => onTabChange?.("profil")}
      />
    );
  }

  // Fake ShareCard result shape for sharing a FullRecording
  const toShareResult = (r: FullRecording): RecordingResult => ({
    url: r.audio_url ?? "",
    blob: new Blob(),
    dbMax: r.db_max ?? -60,
    dbAvg: r.db_avg ?? -60,
    durationMs: r.duree_ms ?? 0,
    notePrincipale: r.note_principale ?? null,
    sequenceNotes: (r.sequence_notes ?? []).map((n) => ({
      ...n,
      octave: 4,
      midi: 60,
      cents: 0,
    })),
    waveform: [],
    timbre: null,
    emotion: null,
    musicalityScore: 0,
    zcr: 0,
  });

  return (
    <div className="history-panel">
      {/* Stats header */}
      {recordings.length > 0 && (
        <div className="history-stats-header">
          <Chart30 recordings={recordings} />
          <div className="history-stats-row">
            <div className="history-stat">
              <span className="history-stat-value">{recordings.length}</span>
              <span className="history-stat-label">relevés total</span>
            </div>
            {avgDb && (
              <div className="history-stat">
                <span className="history-stat-value">{avgDb} dB</span>
                <span className="history-stat-label">moyenne</span>
              </div>
            )}
            {freqNote && (
              <div className="history-stat">
                <span className="history-stat-value">{freqNote}</span>
                <span className="history-stat-label">note dominante</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="history-filters">
        <div className="history-filter-group">
          {(["all", "today", "week", "month"] as Period[]).map((p) => (
            <button
              key={p}
              className={period === p ? "active" : ""}
              onClick={() => setPeriod(p)}
            >
              {{ all: "Tout", today: "Auj.", week: "7 j", month: "30 j" }[p]}
            </button>
          ))}
        </div>
        {allNotes.length > 0 && (
          <select
            className="history-note-filter"
            value={noteFilter}
            onChange={(e) => setNoteFilter(e.target.value)}
            aria-label="Filtrer par note"
          >
            <option value="all">Toutes les notes</option>
            {allNotes.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          variant="history"
          action={() => onTabChange?.("analyser")}
          actionLabel="Débuter l'analyse"
        />
      ) : (
        <ol className="history-list">
          {filtered.map((rec, idx) => (
            <li
              key={rec.id}
              className="history-entry"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div className="history-entry-meta">
                <span className="history-entry-date">
                  {formatDate(rec.created_at)}
                </span>
                <span className="history-entry-time">
                  {formatTime(rec.created_at)}
                </span>
              </div>

              <div className="history-entry-stats">
                <span className="history-badge history-badge--note">
                  {rec.note_principale ?? "—"}
                </span>
                <span className="history-badge">
                  {rec.db_max != null ? `${rec.db_max.toFixed(1)} dB` : "—"}
                </span>
                <span className="history-badge">
                  {formatDuration(rec.duree_ms)}
                </span>
                {rec.alimentation && (
                  <span
                    className="history-badge history-badge--tag"
                    title="Alimentation"
                  >
                    🍽 {rec.alimentation}
                  </span>
                )}
              </div>

              <div className="history-entry-actions">
                {rec.audio_url && (
                  <button
                    className={`history-action-btn${
                      playingId === rec.id ? " active" : ""
                    }`}
                    onClick={() => togglePlay(rec)}
                    aria-label={
                      playingId === rec.id
                        ? "Arrêter la lecture"
                        : "Réécouter ce relevé"
                    }
                  >
                    {playingId === rec.id ? "⏹" : "▶"}
                  </button>
                )}
                <button
                  className="history-action-btn"
                  onClick={() => setShareTarget(rec)}
                  aria-label="Partager ce relevé"
                >
                  🦨
                </button>
                {deleteConfirm === rec.id ? (
                  <>
                    <button
                      className="history-action-btn history-action-btn--danger"
                      onClick={() => handleDelete(rec.id)}
                      aria-label="Confirmer la suppression"
                    >
                      ✓
                    </button>
                    <button
                      className="history-action-btn"
                      onClick={() => setDeleteConfirm(null)}
                      aria-label="Annuler la suppression"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <button
                    className="history-action-btn history-action-btn--delete"
                    onClick={() => setDeleteConfirm(rec.id)}
                    aria-label="Supprimer ce relevé"
                  >
                    🗑
                  </button>
                )}
              </div>

              {deleteConfirm === rec.id && (
                <p className="history-delete-confirm">
                  Supprimer ce relevé du corpus ?
                </p>
              )}
            </li>
          ))}
        </ol>
      )}

      {shareTarget && (
        <ShareCard
          result={toShareResult(shareTarget)}
          onClose={() => setShareTarget(null)}
        />
      )}
    </div>
  );
}

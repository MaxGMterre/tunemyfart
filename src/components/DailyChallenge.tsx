import { useState, useEffect, useMemo } from "react";
import {
  getOrCreateTodaysChallenge,
  getTodaysProgress,
  claimDailyReward,
  calculateLevel,
  xpForLevel,
  xpForNextLevel,
  type DailyChallengeProgress,
} from "../lib/daily-challenges";
import { useAuth } from "../lib/useAuth";
import "./DailyChallenge.css";

const CONFETTI_COLORS = ["#C99A3D", "#E06840", "#39FF14", "#6A4E9F", "#F2ECE0", "#1B4FD8", "#E03A7A"];

interface Props {
  onXpUpdated?: () => void;
}

export function DailyChallenge({ onXpUpdated }: Props = {}) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<DailyChallengeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const confetti = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.6}s`,
        duration: `${0.8 + Math.random() * 0.6}s`,
        size: `${6 + Math.random() * 6}px`,
        rotate: `${Math.random() * 360}deg`,
      })),
    []
  );

  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const challenge = await getOrCreateTodaysChallenge();
        if (!challenge) return;
        const prog = await getTodaysProgress(userId, challenge.id);
        setProgress(prog);
      } catch {
        // Supabase not configured
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleClaim = async () => {
    if (!userId || !progress || claiming) return;
    setClaiming(true);
    try {
      await claimDailyReward(userId, progress.challenge.id);
      setProgress((p) => p ? { ...p, completed: true, completed_at: new Date().toISOString() } : p);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
      onXpUpdated?.();
    } catch {
      // ignore
    } finally {
      setClaiming(false);
    }
  };

  if (loading || !progress) return null;

  const { challenge, completed } = progress;

  // Parse XP from reward_value e.g. "+15 XP"
  const xpReward = parseInt((challenge.reward_value ?? "").replace(/\D/g, "")) || 0;

  // Progress value for bar — rough estimate from challenge type
  const progressPct = completed ? 100 : 0;

  return (
    <div className={`daily-challenge-banner${completed ? " daily-challenge-banner--done" : ""}`}>
      {showConfetti && (
        <div className="dc-confetti" aria-hidden="true">
          {confetti.map((c) => (
            <span
              key={c.id}
              className="dc-confetti-piece"
              style={{
                left: c.left,
                background: c.color,
                width: c.size,
                height: c.size,
                animationDelay: c.delay,
                animationDuration: c.duration,
                transform: `rotate(${c.rotate})`,
              }}
            />
          ))}
        </div>
      )}

      <div className="dc-header">
        <span className="dc-label">Défi du jour</span>
        {xpReward > 0 && (
          <span className="dc-xp-badge">+{xpReward} XP</span>
        )}
      </div>

      <p className="dc-description">{challenge.challenge_description}</p>

      {!completed && (
        <div className="dc-progress-wrap">
          <div className="dc-progress-bar">
            <div className="dc-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      {completed ? (
        <div className="dc-done">
          <span className="dc-done-check">✓</span>
          <span className="dc-done-label">Défi relevé !</span>
        </div>
      ) : (
        <button
          className="dc-claim-btn"
          onClick={handleClaim}
          disabled={claiming || progressPct < 100}
          title={progressPct < 100 ? "Complète le défi pour réclamer ta récompense" : undefined}
        >
          {claiming ? "Validation…" : progressPct >= 100 ? "Réclamer la récompense" : "En cours…"}
        </button>
      )}
    </div>
  );
}

// Standalone XP / level bar used by Profile
export function XpLevelBar({ xp, size = "normal" }: { xp: number; size?: "normal" | "compact" }) {
  const level = calculateLevel(xp);
  const levelStart = xpForLevel(level);
  const levelEnd = xpForNextLevel(level);
  const pct = levelEnd === Infinity ? 100 : Math.round(((xp - levelStart) / (levelEnd - levelStart)) * 100);

  return (
    <div className={`xp-level-bar xp-level-bar--${size}`}>
      <div className="xp-level-label">
        <span className="xp-level-num">Niv. {level}</span>
        <span className="xp-amount">{xp} XP</span>
      </div>
      <div className="xp-bar-track">
        <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      {levelEnd !== Infinity && (
        <div className="xp-next-label">{levelEnd - xp} XP → Niv. {level + 1}</div>
      )}
    </div>
  );
}

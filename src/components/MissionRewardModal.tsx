import { useMemo } from "react";
import { MrProutExcited } from "../assets/characters";
import { SFX } from "../lib/soundEffects";
import "./MissionRewardModal.css";

interface MissionRewardModalProps {
  missionTitle: string;
  missionDescription: string;
  badge: string;
  onClose: () => void;
}

const CONFETTI_COLORS = [
  "#C99A3D",
  "#D9603B",
  "#1B2A41",
  "#2ecc71",
  "#9b59b6",
  "#3498db",
  "#F5EDD6",
];

const CONFETTI_COUNT = 28;

interface ConfettiPiece {
  left: number;
  color: string;
  duration: number;
  delay: number;
  size: number;
}

function useConfetti(): ConfettiPiece[] {
  return useMemo(
    () =>
      Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
        left: (i / CONFETTI_COUNT) * 100 + (Math.random() * 6 - 3),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        duration: 1.2 + Math.random() * 1.0,
        delay: Math.random() * 0.6,
        size: 6 + Math.floor(Math.random() * 5),
      })),
    []
  );
}

export function MissionRewardModal({
  missionTitle,
  missionDescription,
  badge,
  onClose,
}: MissionRewardModalProps) {
  const confetti = useConfetti();

  const handleClose = () => {
    SFX.click();
    onClose();
  };

  return (
    <div className="mission-reward-overlay" role="dialog" aria-modal="true" aria-label="Mission accomplie">
      <div className="mission-reward-card">
        <div className="mission-reward-confetti" aria-hidden="true">
          {confetti.map((c, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${c.left}%`,
                background: c.color,
                width: c.size,
                height: c.size,
                animationDuration: `${c.duration}s`,
                animationDelay: `${c.delay}s`,
              }}
            />
          ))}
        </div>

        <div className="mission-reward-badge" aria-label={`Badge : ${badge}`}>
          {badge}
        </div>
        <p className="mission-reward-label">Certification obtenue</p>
        <h2 className="mission-reward-title">{missionTitle}</h2>
        <p className="mission-reward-desc">{missionDescription}</p>

        <div className="mission-reward-prout">
          <MrProutExcited size={90} />
        </div>

        <button className="mission-reward-btn" onClick={handleClose}>
          Consigner au corpus
        </button>
      </div>
    </div>
  );
}

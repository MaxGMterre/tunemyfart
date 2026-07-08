import { useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import "./VuMeterVintage.css";

interface Props {
  db: number;
}

export function VuMeterVintage({ db }: Props) {
  const clampedDb = Math.max(-60, Math.min(0, db ?? -60));
  const normalised = (clampedDb + 60) / 60;
  const targetAngle = -70 + normalised * 140;

  const springAngle = useSpring(targetAngle, { stiffness: 200, damping: 18, mass: 0.8 });

  useEffect(() => {
    springAngle.set(targetAngle);
  }, [targetAngle, springAngle]);

  return (
    <div className="vu-meter-wrapper">
      <svg viewBox="0 0 120 80" width="100" height="67">
        {/* Fond crème */}
        <path d="M 10 70 A 55 55 0 0 1 110 70" fill="#F0E4C7" stroke="#2C1810" strokeWidth="2" />
        {/* Zone verte */}
        <path d="M 10 70 A 55 55 0 0 1 38 22" fill="none" stroke="#00AA55" strokeWidth="10" opacity="0.4" />
        {/* Zone jaune */}
        <path d="M 38 22 A 55 55 0 0 1 82 22" fill="none" stroke="#FFE500" strokeWidth="10" opacity="0.4" />
        {/* Zone rouge */}
        <path d="M 82 22 A 55 55 0 0 1 110 70" fill="none" stroke="#A02020" strokeWidth="10" opacity="0.4" />
        {/* Graduations */}
        {[-60, -50, -40, -30, -20, -10, -5, 0].map((v) => {
          const norm = (v + 60) / 60;
          const angle = (-70 + norm * 140) * (Math.PI / 180);
          const cx = 60 + Math.sin(angle) * 50;
          const cy = 70 - Math.cos(angle) * 50;
          const cx2 = 60 + Math.sin(angle) * 44;
          const cy2 = 70 - Math.cos(angle) * 44;
          return (
            <line
              key={v}
              x1={cx}
              y1={cy}
              x2={cx2}
              y2={cy2}
              stroke="#2C1810"
              strokeWidth="1.5"
            />
          );
        })}
        {/* Aiguille */}
        <motion.line
          x1="60"
          y1="70"
          x2="60"
          y2="20"
          stroke="#A02020"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            rotate: springAngle,
            transformOrigin: "60px 70px",
          }}
        />
        {/* Pivot */}
        <circle cx="60" cy="70" r="3" fill="#C99A3D" stroke="#9B7328" strokeWidth="1" />
        {/* Reflet verre */}
        <path
          d="M 10 70 A 55 55 0 0 1 110 70"
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Cadre */}
        <path
          d="M 8 72 A 57 57 0 0 1 112 72"
          fill="none"
          stroke="#C99A3D"
          strokeWidth="2.5"
        />
      </svg>
      <div className="vu-meter-label">dB SPL</div>
    </div>
  );
}

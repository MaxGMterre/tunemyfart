import { motion } from "framer-motion";
import "./AmpouleVintage.css";

interface Props {
  on: boolean;
  color: string;
  label: string;
  pulse?: boolean;
}

export function AmpouleVintage({ on, color, label, pulse }: Props) {
  return (
    <div className="ampoule-wrapper">
      <motion.div
        className="ampoule-body"
        animate={
          on
            ? { filter: `drop-shadow(0 0 8px ${color}) drop-shadow(0 0 16px ${color}80)` }
            : { filter: "none" }
        }
        transition={{ duration: 0.3 }}
      >
        <svg viewBox="0 0 40 60" width="32" height="48" overflow="visible">
          {/* Verre */}
          <ellipse
            cx="20"
            cy="22"
            rx="14"
            ry="18"
            fill={on ? `${color}33` : "rgba(180,160,120,0.15)"}
            stroke={on ? color : "#8B7355"}
            strokeWidth="1.5"
          />
          {/* Highlight verre */}
          <ellipse cx="14" cy="14" rx="4" ry="6" fill="rgba(255,255,255,0.25)" />
          {/* Filament */}
          <motion.path
            d="M 16 30 Q 18 26 20 30 Q 22 26 24 30"
            fill="none"
            stroke={on ? (color === "#00FF88" ? "#FFE500" : color) : "#554433"}
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={
              on
                ? { opacity: [1, 0.7, 1], scaleY: [1, 0.97, 1] }
                : { opacity: 0.4 }
            }
            transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
            style={{ transformOrigin: "20px 28px" }}
          />
          {/* Culot brass */}
          <rect x="14" y="38" width="12" height="10" rx="1" fill="#C99A3D" stroke="#9B7328" strokeWidth="1" />
          <rect x="16" y="37" width="2" height="3" rx="0.5" fill="#9B7328" />
          <rect x="22" y="37" width="2" height="3" rx="0.5" fill="#9B7328" />
          {/* Vis culot */}
          <circle cx="17" cy="41" r="1.5" fill="#9B7328" stroke="#6B4523" strokeWidth="0.5" />
          <circle cx="23" cy="41" r="1.5" fill="#9B7328" stroke="#6B4523" strokeWidth="0.5" />
          <line x1="16" y1="41" x2="18" y2="41" stroke="#6B4523" strokeWidth="0.5" />
          <line x1="22" y1="41" x2="24" y2="41" stroke="#6B4523" strokeWidth="0.5" />
          {/* Broche */}
          <rect x="18" y="48" width="4" height="6" rx="1" fill="#A67B4B" />
        </svg>
        {on && pulse && (
          <motion.div
            className="ampoule-pulse-ring"
            style={{ borderColor: color, boxShadow: `0 0 0 0 ${color}80` }}
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 1, ease: "easeOut" }}
          />
        )}
      </motion.div>
      <div
        className="ampoule-label"
        style={on ? { color, textShadow: `0 0 4px ${color}` } : {}}
      >
        {label}
      </div>
    </div>
  );
}

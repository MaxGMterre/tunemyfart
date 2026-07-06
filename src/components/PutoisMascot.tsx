import "./PutoisMascot.css";

export type PutoisState = "idle" | "listening" | "surprised" | "sleeping";

interface PutoisMascotProps {
  state?: PutoisState;
  size?: number;
}

export function PutoisMascot({ state = "idle", size = 72 }: PutoisMascotProps) {
  return (
    <div className={`putois-mascot putois-mascot--${state}`}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 80 80"
        width={size}
        height={size}
        aria-label="Putois mascotte"
        role="img"
      >
        {/* Body */}
        <ellipse cx="40" cy="55" rx="22" ry="18" fill="#1B2A41" />
        {/* White stripe on back */}
        <path d="M 30 44 Q 40 38 50 44 L 50 72 Q 40 76 30 72 Z" fill="white" opacity="0.15" />
        {/* Head */}
        <ellipse cx="40" cy="34" rx="18" ry="18" fill="#1B2A41" />
        {/* White face marking */}
        <ellipse cx="40" cy="34" rx="11" ry="11" fill="white" />
        {/* Ears */}
        <ellipse cx="24" cy="22" rx="7" ry="8" fill="#1B2A41" />
        <ellipse cx="56" cy="22" rx="7" ry="8" fill="#1B2A41" />
        <ellipse cx="24" cy="22" rx="4" ry="5" fill="#8B4A6B" opacity="0.4" />
        <ellipse cx="56" cy="22" rx="4" ry="5" fill="#8B4A6B" opacity="0.4" />
        {/* Eyes */}
        {state === "sleeping" ? (
          <>
            <path d="M 34 33 Q 37 31 40 33" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M 40 33 Q 43 31 46 33" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx="35" cy="33" r={state === "surprised" ? 4.5 : 3.5} fill="#1B2A41" />
            <circle cx="45" cy="33" r={state === "surprised" ? 4.5 : 3.5} fill="#1B2A41" />
            <circle cx="36" cy="32" r="1" fill="white" opacity="0.8" />
            <circle cx="46" cy="32" r="1" fill="white" opacity="0.8" />
          </>
        )}
        {/* Nose */}
        <ellipse cx="40" cy="38" rx="3.5" ry="2.5" fill="#8B4A6B" />
        <ellipse cx="40" cy="37" rx="2" ry="1.2" fill="#1B2A41" opacity="0.3" />
        {/* Mouth */}
        {state === "surprised" ? (
          <ellipse cx="40" cy="42" rx="3" ry="2.5" fill="#1B2A41" />
        ) : (
          <path d="M 37 42 Q 40 44 43 42" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
        )}
        {/* Whiskers */}
        <line x1="20" y1="37" x2="34" y2="39" stroke="#1B2A41" strokeWidth="0.8" opacity="0.5" />
        <line x1="20" y1="40" x2="34" y2="40" stroke="#1B2A41" strokeWidth="0.8" opacity="0.5" />
        <line x1="46" y1="39" x2="60" y2="37" stroke="#1B2A41" strokeWidth="0.8" opacity="0.5" />
        <line x1="46" y1="40" x2="60" y2="40" stroke="#1B2A41" strokeWidth="0.8" opacity="0.5" />
        {/* Tail */}
        {state === "sleeping" ? (
          <path d="M 58 62 Q 72 58 70 46 Q 68 38 62 40" fill="none" stroke="#1B2A41" strokeWidth="8" strokeLinecap="round" />
        ) : (
          <path d="M 58 58 Q 76 48 74 34 Q 72 24 64 28" fill="none" stroke="#1B2A41" strokeWidth="8" strokeLinecap="round" />
        )}
        {/* White tail stripe */}
        {state === "sleeping" ? (
          <path d="M 58 62 Q 72 58 70 46 Q 68 38 62 40" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
        ) : (
          <path d="M 58 58 Q 76 48 74 34 Q 72 24 64 28" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" />
        )}
        {/* Listening — perked ear detail */}
        {state === "listening" && (
          <path d="M 26 16 Q 24 10 22 14" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
        )}
        {/* Sleeping Zzz */}
        {state === "sleeping" && (
          <>
            <text x="54" y="28" fontSize="7" fill="#1B2A41" opacity="0.5" fontFamily="serif">z</text>
            <text x="60" y="20" fontSize="9" fill="#1B2A41" opacity="0.6" fontFamily="serif">Z</text>
          </>
        )}
        {/* Paws */}
        <ellipse cx="22" cy="70" rx="8" ry="5" fill="#1B2A41" />
        <ellipse cx="58" cy="70" rx="8" ry="5" fill="#1B2A41" />
      </svg>
    </div>
  );
}

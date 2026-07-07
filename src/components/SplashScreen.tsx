import { useEffect, useRef, useState } from "react";
import "./SplashScreen.css";

const SPLASH_KEY = "tmf_splash_shown";

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [letterCount, setLetterCount] = useState(0);
  const doneRef = useRef(false);

  const title = "TUNEMYFART";

  useEffect(() => {
    // Skip if already shown this session
    if (sessionStorage.getItem(SPLASH_KEY)) {
      onDone();
      return;
    }
    sessionStorage.setItem(SPLASH_KEY, "1");

    // Séquence de timers
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1 : lettres
    for (let i = 0; i <= title.length; i++) {
      timers.push(setTimeout(() => setLetterCount(i), i * 80));
    }

    // Phase 2 : sous-titre
    timers.push(setTimeout(() => setPhase(2), 1200));
    // Phase 3 : reveal
    timers.push(setTimeout(() => setPhase(3), 1600));
    // Phase 4 : mascotte
    timers.push(setTimeout(() => setPhase(4), 2400));
    // Phase 5 : fondu
    timers.push(setTimeout(() => setPhase(5), 3200));
    // Done
    timers.push(setTimeout(() => { if (!doneRef.current) { doneRef.current = true; onDone(); } }, 3500));

    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  const handleSkip = () => {
    if (!doneRef.current) { doneRef.current = true; onDone(); }
  };

  return (
    <div className={`splash-cinematic${phase >= 5 ? " splash-fade-out" : ""}`} onClick={handleSkip}>
      <div className="splash-grain" aria-hidden />

      <div className="splash-title">
        {title.split("").map((ch, i) => (
          <span key={i} className={`splash-letter${i < letterCount ? " visible" : ""}`}>{ch}</span>
        ))}
      </div>

      {phase >= 2 && (
        <div className="splash-subtitle">L'Anal-yser Mk.II — Laboratoire du Pr. Prout</div>
      )}

      {phase >= 3 && <div className="splash-reveal-circle" />}

      {phase >= 4 && (
        <div className="splash-mascot">
          {/* Mr.Prout simplifié qui fait signe */}
          <svg viewBox="0 0 80 100" width="80" height="100" fill="none">
            <ellipse cx="40" cy="72" rx="20" ry="25" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5"/>
            <circle cx="40" cy="40" r="18" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5"/>
            <circle cx="34" cy="37" r="2.5" fill="#1B2A41"/>
            <circle cx="46" cy="37" r="2.5" fill="#1B2A41"/>
            <path d="M36 46 Q40 49 44 46" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            {/* Bras qui fait signe */}
            <path className="splash-mascot-arm" d="M55 65 Q65 55 68 45 Q70 38 65 35" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
      )}

      <div className="splash-skip-hint">Toucher pour passer</div>
    </div>
  );
}

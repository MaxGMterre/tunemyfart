import { useEffect, useState } from "react";
import { MrProut } from "../assets/characters";
import "./SplashScreen.css";

const TITLE = "TuneMyFart";
const SUBTITLE = "Laboratoire d'acoustique intestinale";
const LETTER_DELAY_MS = 60;
const CHAR_IN_DELAY_MS = 200;

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone();
    }, 2650);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="splash" aria-label="Chargement" role="status">
      <div className="splash-character" style={{ animationDelay: "0ms" }}>
        <MrProut size={110} />
      </div>
      <div>
        <h1 className="splash-title" aria-label={TITLE}>
          {TITLE.split("").map((char, i) => (
            <span
              key={i}
              className="splash-title-letter"
              style={{
                animationDelay: `${CHAR_IN_DELAY_MS + i * LETTER_DELAY_MS}ms`,
              }}
            >
              {char}
            </span>
          ))}
        </h1>
      </div>
      <div className="splash-divider" />
      <p className="splash-subtitle">{SUBTITLE}</p>
    </div>
  );
}

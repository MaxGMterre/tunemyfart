import { useEffect, useRef, useState } from "react";
import "./ProutDialogue.css";

export type DialogueAlign = "center" | "left" | "right";

interface ProutDialogueProps {
  message: string;
  align?: DialogueAlign;
  durationMs?: number;
  onDismiss?: () => void;
}

export function ProutDialogue({
  message,
  align = "center",
  durationMs = 4000,
  onDismiss,
}: ProutDialogueProps) {
  const [dismissing, setDismissing] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDismissing(true);
    }, durationMs - 220);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [durationMs]);

  const handleAnimationEnd = () => {
    if (dismissing) onDismiss?.();
  };

  const classes = [
    "prout-dialogue",
    align !== "center" ? `prout-dialogue--${align}` : "",
    dismissing ? "prout-dialogue--dismissing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} onAnimationEnd={handleAnimationEnd} role="status" aria-live="polite">
      {message}
    </div>
  );
}

// ── Hook to manage dialogue state ─────────────────────────────────────────────

interface DialogueState {
  message: string;
  align: DialogueAlign;
  key: number;
}

export function useProutDialogue() {
  const [dialogue, setDialogue] = useState<DialogueState | null>(null);
  const counterRef = useRef(0);

  const speak = (message: string, align: DialogueAlign = "center") => {
    counterRef.current += 1;
    setDialogue({ message, align, key: counterRef.current });
  };

  const dismiss = () => setDialogue(null);

  return { dialogue, speak, dismiss };
}

// ── Contextual message pools ───────────────────────────────────────────────────

export const DIALOGUE_IDLE = [
  "Hmm… prêt pour la science ?",
  "Le laboratoire est silencieux.",
  "Putois attend, lui aussi.",
  "Votre spécimen m'intéresse.",
  "La mesure ne ment pas.",
];

export const DIALOGUE_RECORDING = [
  "Analyse en cours…",
  "Fréquences captées !",
  "Remarquable cohérence tonale.",
  "Les données affluent.",
  "Protocole respecté, je note.",
];

export const DIALOGUE_RESULT = [
  "Résultat consigné au corpus.",
  "Spécimen classifié avec succès.",
  "La science avance, un prout à la fois.",
  "Voilà qui enrichit nos archives.",
  "Excellent coefficient de résonance.",
];

export const DIALOGUE_ERROR = [
  "Hm. Un parasite dans les données.",
  "Résultat non conforme. On réessaie ?",
  "L'appareil est capricieux ce soir.",
  "Putois est déçu. Moi aussi.",
];

export const DIALOGUE_MISSION_COMPLETE = [
  "Mission accomplie ! Quelle rigueur !",
  "Certification méritée, cher confrère.",
  "Putois applaudit. Discrètement.",
  "Je l'inscris dans les annales.",
];

export function pickRandom(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

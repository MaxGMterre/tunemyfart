import type { ReactNode } from "react";
import "./EmptyState.css";

type EmptyVariant =
  | "history"
  | "missions"
  | "friends"
  | "feed"
  | "search"
  | "error"
  | "loading";

interface EmptyStateProps {
  variant: EmptyVariant;
  title?: string;
  subtitle?: string;
  action?: () => void;
  actionLabel?: string;
}

const ILLUSTRATIONS: Record<EmptyVariant, ReactNode> = {
  history: (
    <svg viewBox="0 0 160 160" width="140" height="140" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="80" cy="110" rx="30" ry="38" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5"/>
      {/* Head */}
      <circle cx="80" cy="62" r="24" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5"/>
      {/* Eyes — sad downward arcs */}
      <path d="M 72 57 Q 74 60 76 57" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M 84 57 Q 86 60 88 57" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Open empty book */}
      <path d="M 30 125 L 80 118 L 130 125 L 130 145 L 80 138 L 30 145 Z" fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1.2"/>
      <line x1="80" y1="118" x2="80" y2="138" stroke="#1B2A41" strokeWidth="1" opacity="0.5"/>
      {/* Dotted lines = empty pages */}
      <line x1="40" y1="130" x2="75" y2="128" stroke="#C99A3D" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5"/>
      <line x1="40" y1="136" x2="75" y2="134" stroke="#C99A3D" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5"/>
      <line x1="85" y1="128" x2="120" y2="130" stroke="#C99A3D" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5"/>
      <line x1="85" y1="134" x2="120" y2="136" stroke="#C99A3D" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5"/>
      {/* Tail */}
      <path d="M 80 148 Q 62 135 65 118 Q 70 105 80 148" fill="#1B2A41"/>
      <path d="M 80 148 Q 65 138 67 122 Q 71 112 80 148" fill="white" opacity="0.5"/>
    </svg>
  ),

  missions: (
    <svg viewBox="0 0 160 160" width="140" height="140" xmlns="http://www.w3.org/2000/svg">
      {/* Shelf */}
      <rect x="20" y="100" width="120" height="8" fill="#8B6B4E" stroke="#1B2A41" strokeWidth="1.2"/>
      <rect x="20" y="108" width="10" height="40" fill="#8B6B4E" stroke="#1B2A41" strokeWidth="1"/>
      <rect x="130" y="108" width="10" height="40" fill="#8B6B4E" stroke="#1B2A41" strokeWidth="1"/>
      {/* Three empty trophy outlines (dashed) */}
      <path d="M 42 100 Q 42 75 55 75 Q 68 75 68 100" fill="none" stroke="#C99A3D" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
      <path d="M 72 100 Q 72 70 85 70 Q 98 70 98 100" fill="none" stroke="#C99A3D" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
      <path d="M 100 100 Q 100 75 113 75 Q 126 75 126 100" fill="none" stroke="#C99A3D" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5"/>
      {/* Question marks above each spot */}
      <text x="55" y="92" textAnchor="middle" fontSize="12" fill="#C99A3D" opacity="0.4" fontFamily="serif">?</text>
      <text x="85" y="88" textAnchor="middle" fontSize="14" fill="#C99A3D" opacity="0.4" fontFamily="serif">?</text>
      <text x="113" y="92" textAnchor="middle" fontSize="12" fill="#C99A3D" opacity="0.4" fontFamily="serif">?</text>
      {/* Cobweb top left */}
      <path d="M 20 20 L 45 20 M 20 20 L 20 45 M 20 20 L 38 38" stroke="#1B2A41" strokeWidth="0.5" opacity="0.2"/>
    </svg>
  ),

  friends: (
    <svg viewBox="0 0 160 160" width="140" height="140" xmlns="http://www.w3.org/2000/svg">
      {/* Body */}
      <ellipse cx="80" cy="110" rx="28" ry="35" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5"/>
      {/* Head */}
      <circle cx="80" cy="65" r="22" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5"/>
      {/* Eyes hopeful */}
      <circle cx="73" cy="61" r="3" fill="#1B2A41"/>
      <circle cx="87" cy="61" r="3" fill="#1B2A41"/>
      <circle cx="74" cy="60" r="1" fill="white"/>
      <circle cx="88" cy="60" r="1" fill="white"/>
      {/* Smile */}
      <path d="M 74 70 Q 80 75 86 70" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Old telephone */}
      <rect x="55" y="118" width="50" height="28" rx="4" fill="#2A4260" stroke="#1B2A41" strokeWidth="1.5"/>
      <path d="M 55 124 Q 80 118 105 124" fill="none" stroke="#1B2A41" strokeWidth="1.2"/>
      {/* Dots = dial */}
      <circle cx="70" cy="130" r="2" fill="#C99A3D" opacity="0.8"/>
      <circle cx="80" cy="130" r="2" fill="#C99A3D" opacity="0.8"/>
      <circle cx="90" cy="130" r="2" fill="#C99A3D" opacity="0.8"/>
      {/* Wavy cord */}
      <path d="M 55 132 Q 45 135 42 145 Q 40 150 45 152" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Tail */}
      <path d="M 80 145 Q 65 130 68 115 Q 73 103 80 145" fill="#1B2A41"/>
    </svg>
  ),

  feed: (
    <svg viewBox="0 0 160 160" width="140" height="140" xmlns="http://www.w3.org/2000/svg">
      {/* Floor */}
      <rect x="0" y="130" width="160" height="30" fill="#8B6B4E" opacity="0.3"/>
      {/* Big window (dark, night) */}
      <rect x="20" y="20" width="55" height="70" rx="4" fill="#0A0F1A" stroke="#1B2A41" strokeWidth="1.5"/>
      <line x1="47" y1="20" x2="47" y2="90" stroke="#1B2A41" strokeWidth="1"/>
      <line x1="20" y1="55" x2="75" y2="55" stroke="#1B2A41" strokeWidth="1"/>
      {/* Moon in window */}
      <path d="M 35 38 Q 44 34 44 44 Q 44 52 36 52 Q 30 46 35 38" fill="#E8A857" opacity="0.6"/>
      {/* Small window */}
      <rect x="90" y="30" width="50" height="45" rx="3" fill="#0A0F1A" stroke="#1B2A41" strokeWidth="1.5"/>
      <line x1="115" y1="30" x2="115" y2="75" stroke="#1B2A41" strokeWidth="1"/>
      {/* Desktop with nothing */}
      <rect x="30" y="110" width="100" height="22" rx="2" fill="#C99A3D" opacity="0.3" stroke="#1B2A41" strokeWidth="1.2"/>
      {/* Lone candle */}
      <rect x="140" y="95" width="8" height="18" rx="2" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1"/>
      <path d="M 144 88 Q 144 83 144 88" stroke="#1B2A41" strokeWidth="1"/>
      {/* Tiny flame */}
      <path d="M 142 90 Q 144 86 146 90 Q 144 93 142 90" fill="#E8A857" opacity="0.8"/>
    </svg>
  ),

  search: (
    <svg viewBox="0 0 160 160" width="140" height="140" xmlns="http://www.w3.org/2000/svg">
      {/* Magnifying glass */}
      <circle cx="70" cy="72" r="38" fill="rgba(245,237,214,0.4)" stroke="#C99A3D" strokeWidth="2.5"/>
      <circle cx="70" cy="72" r="30" fill="rgba(212,234,240,0.3)" stroke="#C99A3D" strokeWidth="1"/>
      <line x1="100" y1="100" x2="130" y2="130" stroke="#C99A3D" strokeWidth="5" strokeLinecap="round"/>
      {/* Empty dotted lines inside glass (= no results) */}
      <line x1="52" y1="62" x2="88" y2="62" stroke="#1B2A41" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.3"/>
      <line x1="52" y1="72" x2="88" y2="72" stroke="#1B2A41" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.3"/>
      <line x1="52" y1="82" x2="75" y2="82" stroke="#1B2A41" strokeWidth="1.5" strokeDasharray="5 4" opacity="0.3"/>
      {/* Shrug arms on glass */}
      <path d="M 48 55 Q 42 48 38 52" fill="none" stroke="#C99A3D" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M 92 55 Q 98 48 102 52" fill="none" stroke="#C99A3D" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),

  error: (
    <svg viewBox="0 0 160 160" width="140" height="140" xmlns="http://www.w3.org/2000/svg">
      {/* Wall */}
      <rect x="110" y="30" width="35" height="100" fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1.5"/>
      {/* Socket */}
      <rect x="118" y="70" width="19" height="24" rx="3" fill="white" stroke="#1B2A41" strokeWidth="1.5"/>
      <circle cx="124" cy="78" r="2.5" fill="#1B2A41"/>
      <circle cx="131" cy="78" r="2.5" fill="#1B2A41"/>
      <path d="M 122 86 Q 127 89 132 86" fill="none" stroke="#1B2A41" strokeWidth="1" strokeLinecap="round"/>
      {/* Plug pulled out */}
      <rect x="68" y="78" width="38" height="12" rx="3" fill="#2A4260" stroke="#1B2A41" strokeWidth="1.5"/>
      <line x1="75" y1="78" x2="75" y2="72" stroke="#1B2A41" strokeWidth="2"/>
      <line x1="99" y1="78" x2="99" y2="72" stroke="#1B2A41" strokeWidth="2"/>
      {/* Wavy cord going to putois */}
      <path d="M 68 84 Q 55 84 48 90 Q 42 95 38 88" fill="none" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round"/>
      {/* Mini putois body pulling cord */}
      <ellipse cx="25" cy="88" rx="16" ry="12" fill="#1B2A41"/>
      <circle cx="25" cy="74" r="10" fill="#1B2A41"/>
      <circle cx="22" cy="72" r="2" fill="white"/>
      <circle cx="28" cy="72" r="2" fill="white"/>
      {/* White stripe */}
      <path d="M 22 62 Q 25 60 28 62 Q 27 70 25 74 Q 23 70 22 62" fill="white" opacity="0.7"/>
      {/* Sparks near socket */}
      <path d="M 112 75 L 108 71 M 112 80 L 106 80" stroke="#E8A857" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
    </svg>
  ),

  loading: (
    <svg viewBox="0 0 160 160" width="140" height="140" xmlns="http://www.w3.org/2000/svg">
      <g className="gear-big">
        <circle cx="70" cy="85" r="28" fill="none" stroke="#C99A3D" strokeWidth="3"/>
        <circle cx="70" cy="85" r="12" fill="none" stroke="#C99A3D" strokeWidth="2"/>
        {[0,45,90,135,180,225,270,315].map((a) => {
          const r = a * Math.PI / 180;
          return (
            <line
              key={a}
              x1={70 + 28 * Math.cos(r)}
              y1={85 + 28 * Math.sin(r)}
              x2={70 + 36 * Math.cos(r)}
              y2={85 + 36 * Math.sin(r)}
              stroke="#C99A3D"
              strokeWidth="6"
              strokeLinecap="square"
            />
          );
        })}
      </g>
      <g className="gear-small">
        <circle cx="112" cy="58" r="16" fill="none" stroke="#D9603B" strokeWidth="2.5"/>
        <circle cx="112" cy="58" r="7" fill="none" stroke="#D9603B" strokeWidth="1.5"/>
        {[0,60,120,180,240,300].map((a) => {
          const r = a * Math.PI / 180;
          return (
            <line
              key={a}
              x1={112 + 16 * Math.cos(r)}
              y1={58 + 16 * Math.sin(r)}
              x2={112 + 21 * Math.cos(r)}
              y2={58 + 21 * Math.sin(r)}
              stroke="#D9603B"
              strokeWidth="5"
              strokeLinecap="square"
            />
          );
        })}
      </g>
      <style>{"@keyframes spinCW{from{transform-origin:70px 85px;transform:rotate(0deg)}to{transform-origin:70px 85px;transform:rotate(360deg)}} @keyframes spinCCW{from{transform-origin:112px 58px;transform:rotate(0deg)}to{transform-origin:112px 58px;transform:rotate(-360deg)}} .gear-big{animation:spinCW 3s linear infinite} .gear-small{animation:spinCCW 2s linear infinite}"}</style>
    </svg>
  ),
};

const DEFAULTS: Record<EmptyVariant, { title: string; subtitle: string }> = {
  history:  { title: "Le corpus est vide",           subtitle: "Vos relevés certifiés apparaîtront ici." },
  missions: { title: "Cabinet des trophées vide",    subtitle: "Accomplissez des missions pour décrocher vos premiers lauriers." },
  friends:  { title: "Aucun confrère enregistré",    subtitle: "Partagez votre code pour inviter vos collègues chercheurs." },
  feed:     { title: "Silence dans le laboratoire",  subtitle: "L'activité de vos confrères apparaîtra ici." },
  search:   { title: "Aucun résultat",               subtitle: "Essayez d'autres termes de recherche." },
  error:    { title: "Connexion interrompue",        subtitle: "Vérifiez votre réseau et réessayez." },
  loading:  { title: "Chargement en cours",          subtitle: "Le laboratoire s'éveille…" },
};

export function EmptyState({ variant, title, subtitle, action, actionLabel }: EmptyStateProps) {
  const defaults = DEFAULTS[variant];
  return (
    <div className="empty-state">
      <div className="empty-state-illo" aria-hidden="true">
        {ILLUSTRATIONS[variant]}
      </div>
      <h3 className="empty-state-title">{title ?? defaults.title}</h3>
      <p className="empty-state-subtitle">{subtitle ?? defaults.subtitle}</p>
      {action && actionLabel && (
        <button className="empty-state-action" onClick={action}>{actionLabel}</button>
      )}
    </div>
  );
}

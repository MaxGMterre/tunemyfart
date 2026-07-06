interface LabTableDecorProps {
  width?: number;
  height?: number;
}

export function LabTableDecor({ width = 480, height = 120 }: LabTableDecorProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      aria-hidden="true"
      role="presentation"
    >
      {/* Table surface */}
      <rect x="0" y="80" width={width} height="40" fill="#8B6B4E" />
      <rect x="0" y="80" width={width} height="6" fill="#A07850" />
      <rect x="0" y="86" width={width} height="2" fill="#7A5C40" opacity="0.5" />

      {/* Wood grain lines */}
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1="0"
          y1={88 + i * 8}
          x2={width}
          y2={88 + i * 8}
          stroke="#7A5C40"
          strokeWidth="0.5"
          opacity="0.3"
        />
      ))}

      {/* === Left side objects === */}

      {/* Erlenmeyer flask */}
      <path d="M 48 78 L 40 54 L 30 54 L 22 78 Z" fill="#d4eaf0" stroke="#1B2A41" strokeWidth="1.5" opacity="0.85" />
      <rect x="32" y="48" width="10" height="8" rx="2" fill="#d4eaf0" stroke="#1B2A41" strokeWidth="1.5" />
      <path d="M 24 72 Q 35 68 48 72" fill="#3498db" opacity="0.35" />
      <ellipse cx="35" cy="72" rx="12" ry="4" fill="#3498db" opacity="0.25" />

      {/* Bubbles in flask */}
      <circle cx="30" cy="66" r="1.5" fill="white" opacity="0.5" />
      <circle cx="36" cy="62" r="1" fill="white" opacity="0.4" />
      <circle cx="40" cy="68" r="1.2" fill="white" opacity="0.45" />

      {/* Book stack */}
      <rect x="68" y="54" width="34" height="26" rx="2" fill="#D9603B" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="68" y="62" width="34" height="18" rx="2" fill="#C99A3D" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="68" y="70" width="34" height="10" rx="2" fill="#9b59b6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Book spines */}
      <line x1="70" y1="54" x2="70" y2="80" stroke="#1B2A41" strokeWidth="1.5" />
      <line x1="70" y1="62" x2="70" y2="80" stroke="#1B2A41" strokeWidth="1" />
      <line x1="70" y1="70" x2="70" y2="80" stroke="#1B2A41" strokeWidth="1" />

      {/* === Right side objects === */}

      {/* Magnifying glass */}
      <circle cx={width - 60} cy="62" r="16" fill="rgba(245,237,214,0.4)" stroke="#C99A3D" strokeWidth="2" />
      <circle cx={width - 60} cy="62" r="13" fill="rgba(212,234,240,0.3)" stroke="#C99A3D" strokeWidth="1" />
      <line x1={width - 48} y1="74" x2={width - 38} y2="80" stroke="#C99A3D" strokeWidth="3" strokeLinecap="round" />
      {/* Reflection */}
      <path d={`M ${width - 68} 54 Q ${width - 64} 52 ${width - 60} 54`} fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />

      {/* Candle */}
      <rect x={width - 108} y="56" width="10" height="24" rx="2" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx={width - 103} cy="56" rx="5" ry="2" fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1" />
      <line x1={width - 103} y1="48" x2={width - 103} y2="56" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Flame */}
      <path d={`M ${width - 106} 50 Q ${width - 103} 42 ${width - 100} 50 Q ${width - 103} 54 ${width - 106} 50`} fill="#D9603B" />
      <path d={`M ${width - 105} 50 Q ${width - 103} 45 ${width - 101} 50`} fill="#C99A3D" opacity="0.7" />
      {/* Wax drip */}
      <path d={`M ${width - 106} 64 Q ${width - 108} 70 ${width - 106} 74`} fill="none" stroke="#F5EDD6" strokeWidth="2.5" strokeLinecap="round" />

      {/* Small stoppered vial */}
      <rect x={width - 130} y="62" width="8" height="18" rx="3" fill="#d4eaf0" stroke="#1B2A41" strokeWidth="1.5" opacity="0.9" />
      <rect x={width - 131} y="60" width="10" height="4" rx="1" fill="#8B6B4E" stroke="#1B2A41" strokeWidth="1" />
      <ellipse cx={width - 126} cy="72" rx="3" ry="5" fill="#9b59b6" opacity="0.3" />
    </svg>
  );
}

import "./CadranRotatif.css";

interface Props {
  label: string;
  angle?: number;
}

export function CadranRotatif({ label, angle = 135 }: Props) {
  return (
    <div className="cadran-wrapper">
      <svg viewBox="0 0 36 36" width="29" height="29">
        <defs>
          <radialGradient id="brassGrad" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#E4B94A" />
            <stop offset="100%" stopColor="#9B7328" />
          </radialGradient>
        </defs>
        <circle cx="18" cy="18" r="16" fill="url(#brassGrad)" stroke="#9B7328" strokeWidth="2" />
        {/* Fentes */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r1 = 11;
          const r2 = 14;
          return (
            <line
              key={i}
              x1={18 + Math.sin(a) * r1}
              y1={18 - Math.cos(a) * r1}
              x2={18 + Math.sin(a) * r2}
              y2={18 - Math.cos(a) * r2}
              stroke="#6B4523"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          );
        })}
        {/* Indicator dot */}
        <circle
          cx={18 + Math.sin((angle * Math.PI) / 180) * 10}
          cy={18 - Math.cos((angle * Math.PI) / 180) * 10}
          r="2"
          fill="#2C1810"
        />
      </svg>
      <span className="cadran-label">{label}</span>
    </div>
  );
}

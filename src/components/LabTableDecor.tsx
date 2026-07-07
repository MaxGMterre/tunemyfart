import { useMemo } from "react";

interface LabTableDecorProps {
  width?: number;
  height?: number;
}

// 10 decorative objects, we pick 7 pseudo-randomly but stably
const ALL_OBJECTS = [
  "flask", "books", "candle", "vial", "magnifying",
  "hourglass", "tuning_fork", "stethoscope", "glass_amber",
  "stamp", "skull",
] as const;
type ObjKey = typeof ALL_OBJECTS[number];

function pickObjects(seed: number): Set<ObjKey> {
  const shuffled = [...ALL_OBJECTS].sort((a, b) => {
    const ha = (seed * a.charCodeAt(0) * 31) % 100;
    const hb = (seed * b.charCodeAt(0) * 31) % 100;
    return ha - hb;
  });
  return new Set(shuffled.slice(0, 8) as ObjKey[]);
}

// Stable seed per session
const SESSION_SEED = parseInt(sessionStorage.getItem("tmf_decor_seed") || (() => {
  const s = String(Math.floor(Math.random() * 9999) + 1);
  sessionStorage.setItem("tmf_decor_seed", s);
  return s;
})());

export function LabTableDecor({ width = 480, height = 120 }: LabTableDecorProps) {
  const visible = useMemo(() => pickObjects(SESSION_SEED), []);
  const W = width;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${W} ${height}`}
      width={W}
      height={height}
      aria-hidden="true"
      role="presentation"
      style={{ overflow: "visible" }}
    >
      <defs>
        <style>{`
          @keyframes flicker {
            0%,100% { opacity:1; transform:scaleX(1) scaleY(1); }
            25%      { opacity:.85; transform:scaleX(.9) scaleY(1.05); }
            50%      { opacity:.95; transform:scaleX(1.05) scaleY(.95); }
            75%      { opacity:.9; transform:scaleX(.95) scaleY(1.1); }
          }
          .lab-flame { animation: flicker 1.8s ease-in-out infinite; transform-origin: center bottom; }
          @keyframes dust {
            0%   { opacity:0; transform:translateY(0); }
            20%  { opacity:.35; }
            80%  { opacity:.2; }
            100% { opacity:0; transform:translateY(-18px); }
          }
          .dust-p { animation: dust linear infinite; }
        `}</style>
        {/* Warm light radial behind analyser centre */}
        <radialGradient id="warmLight" cx="50%" cy="0%" r="60%">
          <stop offset="0%" stopColor="#F5DFA0" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#F5DFA0" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Warm light halo */}
      <rect x="0" y="0" width={W} height={height} fill="url(#warmLight)"/>

      {/* Table surface */}
      <rect x="0" y="82" width={W} height="38" fill="var(--theme-table-bg, #8B6B4E)"/>
      <rect x="0" y="82" width={W} height="6"  fill="#A07850"/>
      <rect x="0" y="88" width={W} height="2"  fill="#7A5C40" opacity="0.5"/>
      {/* Grain lines */}
      {[0,1,2,3].map(i => (
        <line key={i} x1="0" y1={90+i*7} x2={W} y2={90+i*7}
          stroke="#7A5C40" strokeWidth="0.5" opacity="0.25"/>
      ))}
      {/* Subtle shadow under objects */}
      <ellipse cx={W/2} cy="83" rx={W*0.42} ry="4" fill="rgba(0,0,0,0.07)"/>

      {/* === LEFT CLUSTER === */}

      {/* Erlenmeyer flask */}
      {visible.has("flask") && <>
        <path d="M 48 80 L 40 56 L 30 56 L 22 80 Z"
          fill="#d4eaf0" stroke="#1B2A41" strokeWidth="1.5" opacity="0.9"/>
        <rect x="32" y="49" width="10" height="8" rx="2"
          fill="#d4eaf0" stroke="#1B2A41" strokeWidth="1.5"/>
        <ellipse cx="35" cy="74" rx="11" ry="4" fill="#3498db" opacity="0.28"/>
        <circle cx="30" cy="68" r="1.5" fill="white" opacity="0.55"/>
        <circle cx="36" cy="63" r="1"   fill="white" opacity="0.45"/>
        <circle cx="41" cy="70" r="1.2" fill="white" opacity="0.4"/>
      </>}

      {/* Book stack */}
      {visible.has("books") && <>
        <rect x="68" y="56" width="34" height="26" rx="2"
          fill="#D9603B" stroke="#1B2A41" strokeWidth="1.5"/>
        <rect x="68" y="64" width="34" height="18" rx="2"
          fill="#C99A3D" stroke="#1B2A41" strokeWidth="1.5"/>
        <rect x="68" y="72" width="34" height="10" rx="2"
          fill="#9b59b6" stroke="#1B2A41" strokeWidth="1.5"/>
        <line x1="70" y1="56" x2="70" y2="82" stroke="#1B2A41" strokeWidth="1.5"/>
        {/* Quill next to books */}
        <path d="M 60 55 Q 58 70 62 82" fill="none" stroke="#C99A3D" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M 60 55 Q 55 58 58 65 Q 62 62 60 55" fill="#F5EDD6" stroke="#C99A3D" strokeWidth="1"/>
      </>}

      {/* Hourglass */}
      {visible.has("hourglass") && <>
        <line x1="118" y1="55" x2="140" y2="55" stroke="#C99A3D" strokeWidth="2" strokeLinecap="round"/>
        <line x1="118" y1="82" x2="140" y2="82" stroke="#C99A3D" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 120 55 Q 129 60 129 68.5 Q 129 77 120 82"
          fill="none" stroke="#1B2A41" strokeWidth="1.5"/>
        <path d="M 138 55 Q 129 60 129 68.5 Q 129 77 138 82"
          fill="none" stroke="#1B2A41" strokeWidth="1.5"/>
        {/* Sand top */}
        <path d="M 122 55 Q 129 60 136 55" fill="#C99A3D" opacity="0.5"/>
        {/* Sand bottom */}
        <ellipse cx="129" cy="80" rx="7" ry="2" fill="#C99A3D" opacity="0.5"/>
        {/* Sand trickle */}
        <line x1="129" y1="63" x2="129" y2="75" stroke="#C99A3D" strokeWidth="1" opacity="0.4" strokeDasharray="1 2"/>
      </>}

      {/* === CENTRE-RIGHT === */}

      {/* Tuning fork */}
      {visible.has("tuning_fork") && <>
        <line x1={W/2-10} y1="82" x2={W/2-10} y2="60" stroke="#888" strokeWidth="2.5" strokeLinecap="round"/>
        <path d={`M ${W/2-10} 60 Q ${W/2-10} 52 ${W/2-6} 52 Q ${W/2-6} 58 ${W/2-10} 60`}
          fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
        <path d={`M ${W/2-10} 60 Q ${W/2-10} 52 ${W/2-14} 52 Q ${W/2-14} 58 ${W/2-10} 60`}
          fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
      </>}

      {/* Glass of amber liquid */}
      {visible.has("glass_amber") && <>
        <path d={`M ${W/2+8} 58 L ${W/2+6} 82 L ${W/2+22} 82 L ${W/2+20} 58 Z`}
          fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" opacity="0.9"/>
        <path d={`M ${W/2+8} 70 L ${W/2+6} 82 L ${W/2+22} 82 L ${W/2+20} 70 Z`}
          fill="#C99A3D" opacity="0.5"/>
        {/* Reflection */}
        <line x1={W/2+11} y1="62" x2={W/2+11} y2="79"
          stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      </>}

      {/* Stamp */}
      {visible.has("stamp") && <>
        <rect x={W/2+32} y="68" width="24" height="14" rx="2"
          fill="#C99A3D" stroke="#1B2A41" strokeWidth="1.5"/>
        <rect x={W/2+35} y="63" width="18" height="6" rx="1"
          fill="#8B6B4E" stroke="#1B2A41" strokeWidth="1"/>
        <rect x={W/2+34} y="69" width="16" height="4" rx="1"
          fill="#D9603B" opacity="0.6"/>
        <text x={W/2+44} y="79"
          textAnchor="middle" fill="#1B2A41" fontSize="5" fontFamily="serif" opacity="0.7">
          CERTIFIÉ
        </text>
      </>}

      {/* Skull memento mori */}
      {visible.has("skull") && <>
        <ellipse cx={W/2+70} cy="66" rx="10" ry="11"
          fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5"/>
        <ellipse cx={W/2+66} cy="68" rx="3" ry="3.5"
          fill="#1B2A41" opacity="0.7"/>
        <ellipse cx={W/2+74} cy="68" rx="3" ry="3.5"
          fill="#1B2A41" opacity="0.7"/>
        <path d={`M ${W/2+63} 74 Q ${W/2+70} 73 ${W/2+77} 74`}
          fill="none" stroke="#1B2A41" strokeWidth="1.2"/>
        <line x1={W/2+67} y1="74" x2={W/2+67} y2="78" stroke="#1B2A41" strokeWidth="1"/>
        <line x1={W/2+70} y1="74" x2={W/2+70} y2="78" stroke="#1B2A41" strokeWidth="1"/>
        <line x1={W/2+73} y1="74" x2={W/2+73} y2="78" stroke="#1B2A41" strokeWidth="1"/>
        <path d={`M ${W/2+63} 78 L ${W/2+60} 82 L ${W/2+80} 82 L ${W/2+77} 78 Z`}
          fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.2"/>
      </>}

      {/* === RIGHT CLUSTER === */}

      {/* Magnifying glass */}
      {visible.has("magnifying") && <>
        <circle cx={W-60} cy="62" r="16"
          fill="rgba(245,237,214,0.4)" stroke="#C99A3D" strokeWidth="2"/>
        <circle cx={W-60} cy="62" r="13"
          fill="rgba(212,234,240,0.3)" stroke="#C99A3D" strokeWidth="1"/>
        <line x1={W-48} y1="74" x2={W-38} y2="81"
          stroke="#C99A3D" strokeWidth="3.5" strokeLinecap="round"/>
        <path d={`M ${W-68} 54 Q ${W-64} 52 ${W-60} 54`}
          fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
      </>}

      {/* Stethoscope */}
      {visible.has("stethoscope") && <>
        <circle cx={W-108} cy="70" r="8"
          fill="rgba(212,234,240,0.35)" stroke="#1B2A41" strokeWidth="1.5"/>
        <path d={`M ${W-108} 62 Q ${W-108} 52 ${W-100} 52 Q ${W-95} 52 ${W-95} 58`}
          fill="none" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round"/>
        <path d={`M ${W-108} 62 Q ${W-108} 52 ${W-116} 52 Q ${W-121} 52 ${W-121} 58`}
          fill="none" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round"/>
        <circle cx={W-100} cy="58" r="2.5"
          fill="#C99A3D" stroke="#1B2A41" strokeWidth="1"/>
        <circle cx={W-121} cy="58" r="2.5"
          fill="#C99A3D" stroke="#1B2A41" strokeWidth="1"/>
      </>}

      {/* Candle with animated flame */}
      {visible.has("candle") && <>
        <rect x={W-140} y="58" width="12" height="24" rx="2"
          fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5"/>
        <ellipse cx={W-134} cy="58" rx="6" ry="2"
          fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1"/>
        <line x1={W-134} y1="50" x2={W-134} y2="58"
          stroke="#1B2A41" strokeWidth="1.5"/>
        <g className="lab-flame">
          <path d={`M ${W-137} 52 Q ${W-134} 44 ${W-131} 52 Q ${W-134} 56 ${W-137} 52`}
            fill="#D9603B"/>
          <path d={`M ${W-136} 52 Q ${W-134} 47 ${W-132} 52`}
            fill="#C99A3D" opacity="0.75"/>
          <circle cx={W-134} cy="53" r="1.5" fill="#F5DFA0" opacity="0.8"/>
        </g>
        {/* Wax drip */}
        <path d={`M ${W-140} 66 Q ${W-143} 72 ${W-141} 76`}
          fill="none" stroke="#F5EDD6" strokeWidth="3" strokeLinecap="round"/>
        {/* Glow on table */}
        <ellipse cx={W-134} cy="82" rx="18" ry="3"
          fill="#F5DFA0" opacity="0.2"/>
      </>}

      {/* Stoppered vial */}
      {visible.has("vial") && <>
        <rect x={W-158} y="64" width="10" height="18" rx="4"
          fill="#d4eaf0" stroke="#1B2A41" strokeWidth="1.5" opacity="0.9"/>
        <rect x={W-159} y="62" width="12" height="4" rx="1"
          fill="#8B6B4E" stroke="#1B2A41" strokeWidth="1"/>
        <ellipse cx={W-153} cy="74" rx="3.5" ry="5"
          fill="#9b59b6" opacity="0.3"/>
      </>}

      {/* Floating dust particles */}
      {[0,1,2,3,4,5].map(i => (
        <circle
          key={i}
          className="dust-p"
          cx={40 + i * (W/6)}
          cy={50 + (i % 3) * 12}
          r="1.2"
          fill="white"
          opacity="0"
          style={{
            animationDuration: `${4 + i * 1.3}s`,
            animationDelay: `${i * 0.9}s`,
          }}
        />
      ))}
    </svg>
  );
}

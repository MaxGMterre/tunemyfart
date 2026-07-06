export function MrProutSleeping({ size = 140 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 140 200"
      width={size}
      height={(size * 200) / 140}
      aria-label="Professeur Prout endormi"
      role="img"
    >
      {/* Armchair back */}
      <rect x="10" y="110" width="120" height="80" rx="8" fill="#8B6B4E" stroke="#1B2A41" strokeWidth="2" />
      <rect x="16" y="116" width="108" height="68" rx="5" fill="#A07850" />
      {/* Armrests */}
      <rect x="8" y="148" width="22" height="40" rx="6" fill="#8B6B4E" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="110" y="148" width="22" height="40" rx="6" fill="#8B6B4E" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Hair — slightly droopy */}
      <ellipse cx="45" cy="52" rx="20" ry="16" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="70" cy="45" rx="24" ry="18" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="95" cy="52" rx="20" ry="16" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Head — tilted forward/down slightly */}
      <ellipse cx="70" cy="76" rx="27" ry="29" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="2" />
      {/* Glasses — slipped down nose */}
      <circle cx="57" cy="77" r="9" fill="rgba(245,237,214,0.5)" stroke="#C99A3D" strokeWidth="2" />
      <line x1="66" y1="77" x2="72" y2="77" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="37" y1="78" x2="48" y2="77" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="72" y1="77" x2="96" y2="76" stroke="#C99A3D" strokeWidth="1.5" />
      <circle cx="82" cy="76" r="7" fill="none" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="85" y1="72" x2="89" y2="67" stroke="#C99A3D" strokeWidth="1" />
      {/* Eyes — closed, sleeping */}
      <path d="M 52 74 Q 57 72 62 74" fill="none" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round" />
      <path d="M 77 73 Q 82 71 87 73" fill="none" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round" />
      {/* Eyebrows — relaxed */}
      <path d="M 51 69 Q 57 67 63 69" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M 76 68 Q 82 67 88 68" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="70" cy="84" rx="3" ry="2" fill="#C99A3D" opacity="0.45" />
      {/* Mustache */}
      <path d="M 60 89 Q 65 93 70 90 Q 75 93 80 89" fill="none" stroke="#1B2A41" strokeWidth="2.5" strokeLinecap="round" />
      {/* Sleeping mouth — slightly open */}
      <path d="M 65 96 Q 70 100 75 96" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      {/* Zzz bubbles */}
      <text x="100" y="62" fontSize="9" fill="#1B2A41" opacity="0.6" fontFamily="serif">z</text>
      <text x="108" y="52" fontSize="12" fill="#1B2A41" opacity="0.7" fontFamily="serif">z</text>
      <text x="118" y="40" fontSize="15" fill="#1B2A41" opacity="0.8" fontFamily="serif">Z</text>
      {/* Neck */}
      <rect x="62" y="103" width="16" height="11" rx="3" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Lab coat over chair */}
      <path d="M 22 114 L 24 188 L 116 188 L 118 114 Q 102 106 86 108 L 70 116 L 54 108 Q 38 106 22 114 Z" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <path d="M 54 108 L 65 127 L 70 116" fill="#EEE" stroke="#1B2A41" strokeWidth="1.5" />
      <path d="M 86 108 L 75 127 L 70 116" fill="#EEE" stroke="#1B2A41" strokeWidth="1.5" />
      <path d="M 70 116 L 67 126 L 70 135 L 73 126 Z" fill="#D9603B" />
      {/* Left arm — resting on armrest */}
      <path d="M 24 128 Q 18 140 16 156 Q 16 162 20 162" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <ellipse cx="18" cy="164" rx="9" ry="8" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Right arm — resting on armrest */}
      <path d="M 116 128 Q 122 140 124 156 Q 124 162 120 162" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <ellipse cx="122" cy="164" rx="9" ry="8" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Pocket */}
      <rect x="32" y="140" width="18" height="22" rx="3" fill="none" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="36" y="138" width="4" height="16" rx="2" fill="#C99A3D" />
      <ellipse cx="90" cy="136" rx="9" ry="5" fill="#C99A3D" opacity="0.2" />
      {/* Buttons */}
      <circle cx="70" cy="152" r="2.5" fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1" />
      <circle cx="70" cy="164" r="2.5" fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1" />
      {/* Pants visible below coat */}
      <rect x="50" y="186" width="18" height="12" rx="2" fill="#2A3548" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="72" y="186" width="18" height="12" rx="2" fill="#2A3548" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Shoes */}
      <ellipse cx="59" cy="198" rx="13" ry="5" fill="#1B2A41" />
      <ellipse cx="81" cy="198" rx="13" ry="5" fill="#1B2A41" />
      {/* Putois — also sleeping, curled up near armchair */}
      <ellipse cx="118" cy="194" rx="16" ry="7" fill="#1B2A41" />
      <ellipse cx="122" cy="186" rx="8" ry="8" fill="#1B2A41" />
      <ellipse cx="122" cy="186" rx="5" ry="5" fill="white" />
      <path d="M 104 192 Q 118 188 130 192" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 130 190 Q 136 184 132 178" fill="none" stroke="#1B2A41" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 130 191 Q 135 185 131 179" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Putois sleeping eye */}
      <path d="M 120 184 Q 123 182 126 184" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      <text x="130" y="176" fontSize="7" fill="#1B2A41" opacity="0.5" fontFamily="serif">z</text>
    </svg>
  );
}

export function MrProutWriting({ size = 140 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 140 200"
      width={size}
      height={(size * 200) / 140}
      aria-label="Professeur Prout écrivant"
      role="img"
    >
      {/* Hair */}
      <ellipse cx="45" cy="36" rx="20" ry="16" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="70" cy="29" rx="24" ry="18" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="95" cy="36" rx="20" ry="16" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Head — tilted slightly down toward notebook */}
      <ellipse cx="68" cy="62" rx="27" ry="28" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="2" />
      {/* Glasses — looking down */}
      <circle cx="55" cy="62" r="9" fill="rgba(245,237,214,0.5)" stroke="#C99A3D" strokeWidth="2" />
      <line x1="64" y1="63" x2="70" y2="63" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="35" y1="63" x2="46" y2="63" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="70" y1="63" x2="94" y2="62" stroke="#C99A3D" strokeWidth="1.5" />
      <circle cx="80" cy="62" r="7" fill="none" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="83" y1="58" x2="87" y2="53" stroke="#C99A3D" strokeWidth="1" />
      {/* Eyes — looking down at notebook */}
      <circle cx="55" cy="64" r="3.5" fill="#1B2A41" />
      <circle cx="80" cy="64" r="3" fill="#1B2A41" />
      {/* Eyebrows — focused/concentrated */}
      <path d="M 49 56 Q 56 54 63 56" fill="none" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round" />
      <path d="M 73 55 Q 80 53 87 55" fill="none" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round" />
      {/* Slight frown of concentration */}
      <path d="M 49 57 Q 53 55 56 57" fill="none" stroke="#1B2A41" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      {/* Nose */}
      <ellipse cx="68" cy="70" rx="3" ry="2" fill="#C99A3D" opacity="0.45" />
      {/* Mustache */}
      <path d="M 57 75 Q 63 79 68 76 Q 73 79 79 75" fill="none" stroke="#1B2A41" strokeWidth="2.5" strokeLinecap="round" />
      {/* Focused expression — slight pursed lips */}
      <path d="M 62 82 Q 68 83 74 82" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      {/* Neck */}
      <rect x="60" y="88" width="16" height="11" rx="3" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Lab coat */}
      <path d="M 22 100 L 25 184 L 110 184 L 113 100 Q 98 92 83 94 L 68 102 L 53 94 Q 37 92 22 100 Z" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <path d="M 53 94 L 63 113 L 68 102" fill="#EEE" stroke="#1B2A41" strokeWidth="1.5" />
      <path d="M 83 94 L 73 113 L 68 102" fill="#EEE" stroke="#1B2A41" strokeWidth="1.5" />
      <path d="M 68 102 L 65 112 L 68 121 L 71 112 Z" fill="#D9603B" />
      {/* Desk/table surface */}
      <rect x="0" y="158" width="140" height="12" rx="3" fill="#8B6B4E" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="0" y="164" width="140" height="6" rx="0" fill="#7A5C40" />
      {/* Notebook on table */}
      <rect x="40" y="140" width="68" height="50" rx="3" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="40" y="140" width="8" height="50" rx="3" fill="#C99A3D" stroke="#1B2A41" strokeWidth="1" />
      {/* Notebook lines */}
      <line x1="52" y1="152" x2="104" y2="152" stroke="#1B2A41" strokeWidth="0.5" opacity="0.4" />
      <line x1="52" y1="158" x2="104" y2="158" stroke="#1B2A41" strokeWidth="0.5" opacity="0.4" />
      <line x1="52" y1="164" x2="104" y2="164" stroke="#1B2A41" strokeWidth="0.5" opacity="0.4" />
      <line x1="52" y1="170" x2="104" y2="170" stroke="#1B2A41" strokeWidth="0.5" opacity="0.4" />
      {/* Handwriting squiggles */}
      <path d="M 54 152 Q 62 150 70 152 Q 76 150 82 152" fill="none" stroke="#1B2A41" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      <path d="M 54 158 Q 65 156 75 158" fill="none" stroke="#1B2A41" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      <path d="M 54 164 Q 68 162 80 164 Q 86 162 92 164" fill="none" stroke="#1B2A41" strokeWidth="0.8" strokeLinecap="round" opacity="0.6" />
      {/* Left arm — bent over notebook */}
      <path d="M 24 116 Q 16 128 20 144 Q 22 152 30 154 L 48 156" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <ellipse cx="46" cy="157" rx="10" ry="7" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Right arm — writing with pen */}
      <path d="M 110 114 Q 122 128 118 148 Q 116 156 108 158 L 96 158" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <ellipse cx="98" cy="157" rx="8" ry="6" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Pen in right hand */}
      <rect x="101" y="150" width="3" height="14" rx="1.5" fill="#C99A3D" stroke="#1B2A41" strokeWidth="0.8" transform="rotate(-25 101 150)" />
      <polygon points="103,163 105,163 104,168" fill="#1B2A41" transform="rotate(-25 103 163)" />
      {/* Pocket */}
      <rect x="30" y="128" width="18" height="22" rx="3" fill="none" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="34" y="126" width="4" height="16" rx="2" fill="#C99A3D" />
      <ellipse cx="88" cy="120" rx="9" ry="5" fill="#C99A3D" opacity="0.2" />
      {/* Buttons */}
      <circle cx="68" cy="138" r="2.5" fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1" />
      {/* Pants visible */}
      <rect x="45" y="182" width="18" height="12" rx="2" fill="#2A3548" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="68" y="182" width="18" height="12" rx="2" fill="#2A3548" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Shoes */}
      <ellipse cx="54" cy="197" rx="13" ry="5" fill="#1B2A41" />
      <ellipse cx="77" cy="197" rx="13" ry="5" fill="#1B2A41" />
      {/* Putois — watching curiously from corner */}
      <ellipse cx="116" cy="193" rx="18" ry="8" fill="#1B2A41" />
      <ellipse cx="121" cy="184" rx="9" ry="9" fill="#1B2A41" />
      <ellipse cx="121" cy="184" rx="5.5" ry="5.5" fill="white" />
      <path d="M 100 191 Q 116 186 131 191" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 131 189 Q 140 180 137 172" fill="none" stroke="#1B2A41" strokeWidth="4" strokeLinecap="round" />
      <path d="M 131 190 Q 138 182 135 174" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="124" cy="182" r="1.5" fill="#1B2A41" stroke="white" strokeWidth="0.5" />
    </svg>
  );
}

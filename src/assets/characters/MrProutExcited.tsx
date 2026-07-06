export function MrProutExcited({ size = 140 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 140 200"
      width={size}
      height={(size * 200) / 140}
      aria-label="Professeur Prout enthousiaste"
      role="img"
    >
      {/* Hair — slightly lifted from excitement */}
      <ellipse cx="43" cy="37" rx="22" ry="17" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="70" cy="29" rx="25" ry="18" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="97" cy="37" rx="22" ry="17" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Excited hair wisps */}
      <path d="M 45 28 Q 48 20 52 18" fill="none" stroke="#F8F8F8" strokeWidth="3" strokeLinecap="round" />
      <path d="M 70 22 Q 73 14 70 10" fill="none" stroke="#F8F8F8" strokeWidth="3" strokeLinecap="round" />
      <path d="M 95 28 Q 92 20 88 18" fill="none" stroke="#F8F8F8" strokeWidth="3" strokeLinecap="round" />
      {/* Head */}
      <ellipse cx="70" cy="65" rx="27" ry="29" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="2" />
      {/* Glasses — slightly raised/askew */}
      <circle cx="57" cy="61" r="9" fill="rgba(245,237,214,0.5)" stroke="#C99A3D" strokeWidth="2" />
      <line x1="66" y1="61" x2="72" y2="61" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="37" y1="60" x2="48" y2="61" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="72" y1="61" x2="96" y2="60" stroke="#C99A3D" strokeWidth="1.5" />
      <circle cx="82" cy="60" r="7" fill="none" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="85" y1="56" x2="89" y2="51" stroke="#C99A3D" strokeWidth="1" />
      {/* Eyes — wide open with excitement */}
      <circle cx="57" cy="61" r="4.5" fill="#1B2A41" />
      <circle cx="82" cy="60" r="4" fill="#1B2A41" />
      <circle cx="58" cy="60" r="1.2" fill="white" opacity="0.9" />
      <circle cx="83" cy="59" r="1" fill="white" opacity="0.9" />
      {/* Eyebrows raised high */}
      <path d="M 50 52 Q 57 48 64 51" fill="none" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round" />
      <path d="M 76 51 Q 82 48 88 51" fill="none" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="70" cy="72" rx="3" ry="2" fill="#C99A3D" opacity="0.45" />
      {/* Mustache */}
      <path d="M 59 77 Q 65 81 70 78 Q 75 81 81 77" fill="none" stroke="#1B2A41" strokeWidth="2.5" strokeLinecap="round" />
      {/* Big excited smile */}
      <path d="M 60 84 Q 70 93 80 84" fill="none" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round" />
      {/* Neck */}
      <rect x="62" y="92" width="16" height="11" rx="3" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Lab coat */}
      <path d="M 25 103 L 28 188 L 112 188 L 115 103 Q 100 95 85 97 L 70 105 L 55 97 Q 40 95 25 103 Z" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <path d="M 55 97 L 66 116 L 70 105" fill="#EEE" stroke="#1B2A41" strokeWidth="1.5" />
      <path d="M 85 97 L 74 116 L 70 105" fill="#EEE" stroke="#1B2A41" strokeWidth="1.5" />
      <path d="M 70 105 L 67 115 L 70 124 L 73 115 Z" fill="#D9603B" />
      {/* Left arm — raised up high */}
      <path d="M 28 118 Q 14 100 8 78 Q 6 66 14 62 Q 22 58 26 68" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <ellipse cx="10" cy="59" rx="9" ry="11" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      <line x1="4" y1="50" x2="2" y2="43" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="8" y1="49" x2="7" y2="42" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="50" x2="12" y2="43" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right arm — also raised */}
      <path d="M 112 118 Q 128 98 132 76 Q 134 64 126 60 Q 118 56 114 66" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <ellipse cx="130" cy="57" rx="9" ry="11" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      <line x1="124" y1="48" x2="122" y2="41" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="128" y1="47" x2="128" y2="40" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="132" y1="48" x2="134" y2="41" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      {/* Pocket */}
      <rect x="32" y="132" width="20" height="24" rx="3" fill="none" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="36" y="130" width="4" height="18" rx="2" fill="#C99A3D" />
      <ellipse cx="90" cy="125" rx="10" ry="6" fill="#C99A3D" opacity="0.2" />
      {/* Buttons */}
      <circle cx="70" cy="145" r="2.5" fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1" />
      <circle cx="70" cy="158" r="2.5" fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1" />
      <circle cx="70" cy="171" r="2.5" fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1" />
      {/* Pants */}
      <rect x="47" y="186" width="20" height="12" rx="2" fill="#2A3548" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="73" y="186" width="20" height="12" rx="2" fill="#2A3548" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Shoes */}
      <ellipse cx="57" cy="198" rx="14" ry="5" fill="#1B2A41" />
      <ellipse cx="83" cy="198" rx="14" ry="5" fill="#1B2A41" />
      {/* Putois — also excited */}
      <ellipse cx="116" cy="193" rx="18" ry="8" fill="#1B2A41" />
      <ellipse cx="121" cy="184" rx="9" ry="9" fill="#1B2A41" />
      <ellipse cx="121" cy="184" rx="5.5" ry="5.5" fill="white" />
      <path d="M 100 191 Q 116 186 131 191" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 131 189 Q 142 176 136 164" fill="none" stroke="#1B2A41" strokeWidth="4" strokeLinecap="round" />
      <path d="M 131 190 Q 140 178 134 166" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="124" cy="182" r="1.5" fill="#1B2A41" stroke="white" strokeWidth="0.5" />
    </svg>
  );
}

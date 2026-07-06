export function MrProut({ size = 140 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 140 200"
      width={size}
      height={(size * 200) / 140}
      aria-label="Professeur Prout"
      role="img"
    >
      {/* Hair */}
      <ellipse cx="45" cy="40" rx="20" ry="16" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="70" cy="33" rx="24" ry="18" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="95" cy="40" rx="20" ry="16" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Head */}
      <ellipse cx="70" cy="65" rx="27" ry="29" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="2" />
      {/* Glasses */}
      <circle cx="58" cy="63" r="9" fill="rgba(245,237,214,0.5)" stroke="#C99A3D" strokeWidth="2" />
      <line x1="67" y1="63" x2="73" y2="63" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="38" y1="62" x2="49" y2="63" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="73" y1="63" x2="97" y2="61" stroke="#C99A3D" strokeWidth="1.5" />
      {/* Monocle right */}
      <circle cx="83" cy="61" r="7" fill="none" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="86" y1="57" x2="90" y2="52" stroke="#C99A3D" strokeWidth="1" />
      {/* Eyes */}
      <circle cx="58" cy="63" r="4" fill="#1B2A41" />
      <circle cx="83" cy="61" r="3.5" fill="#1B2A41" />
      <circle cx="60" cy="62" r="1" fill="white" opacity="0.7" />
      {/* Nose */}
      <ellipse cx="70" cy="72" rx="3" ry="2" fill="#C99A3D" opacity="0.45" />
      {/* Mustache */}
      <path d="M 60 77 Q 65 80 70 77 Q 75 80 80 77" fill="none" stroke="#1B2A41" strokeWidth="2.5" strokeLinecap="round" />
      {/* Smile */}
      <path d="M 62 83 Q 70 88 78 83" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      {/* Neck */}
      <rect x="62" y="92" width="16" height="11" rx="3" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Lab coat */}
      <path d="M 25 103 L 28 188 L 112 188 L 115 103 Q 100 95 85 97 L 70 105 L 55 97 Q 40 95 25 103 Z" fill="white" stroke="#1B2A41" strokeWidth="2" />
      {/* Lapels */}
      <path d="M 55 97 L 66 116 L 70 105" fill="#EEE" stroke="#1B2A41" strokeWidth="1.5" />
      <path d="M 85 97 L 74 116 L 70 105" fill="#EEE" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Tie */}
      <path d="M 70 105 L 67 115 L 70 124 L 73 115 Z" fill="#D9603B" />
      {/* Left arm — waving up */}
      <path d="M 28 120 Q 12 100 10 78 Q 10 70 18 70 Q 26 70 27 80" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <ellipse cx="14" cy="67" rx="9" ry="11" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      <line x1="8" y1="58" x2="7" y2="51" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="57" x2="12" y2="50" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="58" x2="17" y2="51" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right arm — hanging */}
      <path d="M 112 118 Q 126 140 124 162 Q 123 168 118 166 Q 114 162 116 152 Q 116 135 106 120" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <ellipse cx="121" cy="167" rx="8" ry="10" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Pocket */}
      <rect x="32" y="132" width="20" height="24" rx="3" fill="none" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="36" y="130" width="4" height="18" rx="2" fill="#C99A3D" />
      <polygon points="36,148 40,148 38,153" fill="#1B2A41" />
      {/* Coat stain */}
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
      {/* Putois */}
      <ellipse cx="116" cy="193" rx="18" ry="8" fill="#1B2A41" />
      <ellipse cx="121" cy="184" rx="9" ry="9" fill="#1B2A41" />
      <ellipse cx="121" cy="184" rx="5.5" ry="5.5" fill="white" />
      <path d="M 100 191 Q 116 186 131 191" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 130 189 Q 140 180 137 172" fill="none" stroke="#1B2A41" strokeWidth="4" strokeLinecap="round" />
      <path d="M 130 190 Q 138 182 135 174" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="124" cy="182" r="1.5" fill="#1B2A41" stroke="white" strokeWidth="0.5" />
    </svg>
  );
}

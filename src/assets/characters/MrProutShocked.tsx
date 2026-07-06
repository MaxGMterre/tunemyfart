export function MrProutShocked({ size = 140 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 140 200"
      width={size}
      height={(size * 200) / 140}
      aria-label="Professeur Prout sous le choc"
      role="img"
    >
      {/* Hair — very disheveled from shock */}
      <ellipse cx="43" cy="38" rx="23" ry="18" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="70" cy="30" rx="26" ry="19" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="97" cy="38" rx="23" ry="18" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Wild shock wisps in all directions */}
      <path d="M 40 25 Q 36 14 38 8" fill="none" stroke="#F8F8F8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 55 22 Q 53 12 58 7" fill="none" stroke="#F8F8F8" strokeWidth="3" strokeLinecap="round" />
      <path d="M 70 21 Q 70 10 65 5" fill="none" stroke="#F8F8F8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 84 22 Q 87 12 82 7" fill="none" stroke="#F8F8F8" strokeWidth="3" strokeLinecap="round" />
      <path d="M 98 25 Q 103 14 100 8" fill="none" stroke="#F8F8F8" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M 110 35 Q 118 27 116 20" fill="none" stroke="#F8F8F8" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 30 35 Q 22 27 24 20" fill="none" stroke="#F8F8F8" strokeWidth="2.5" strokeLinecap="round" />
      {/* Head */}
      <ellipse cx="70" cy="66" rx="27" ry="29" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="2" />
      {/* Glasses — askew from shock */}
      <circle cx="57" cy="63" r="9" fill="rgba(245,237,214,0.5)" stroke="#C99A3D" strokeWidth="2" />
      <line x1="66" y1="64" x2="72" y2="62" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="37" y1="65" x2="48" y2="64" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="72" y1="62" x2="96" y2="60" stroke="#C99A3D" strokeWidth="1.5" />
      <circle cx="82" cy="61" r="7" fill="none" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="85" y1="57" x2="89" y2="52" stroke="#C99A3D" strokeWidth="1" />
      {/* Eyes — very wide open, shocked */}
      <circle cx="57" cy="63" r="6" fill="white" stroke="#1B2A41" strokeWidth="0.5" />
      <circle cx="82" cy="61" r="5" fill="white" stroke="#1B2A41" strokeWidth="0.5" />
      <circle cx="57" cy="63" r="3.5" fill="#1B2A41" />
      <circle cx="82" cy="61" r="3" fill="#1B2A41" />
      <circle cx="58" cy="62" r="1.2" fill="white" opacity="0.9" />
      <circle cx="83" cy="60" r="1" fill="white" opacity="0.9" />
      {/* Eyebrows — shot way up */}
      <path d="M 49 53 Q 57 48 65 52" fill="none" stroke="#1B2A41" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 75 51 Q 82 47 89 51" fill="none" stroke="#1B2A41" strokeWidth="2.5" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="70" cy="73" rx="3" ry="2" fill="#C99A3D" opacity="0.45" />
      {/* Mustache — slightly ruffled */}
      <path d="M 58 78 Q 62 80 66 78 Q 68 79 70 78 Q 72 79 74 78 Q 78 80 82 78" fill="none" stroke="#1B2A41" strokeWidth="2.5" strokeLinecap="round" />
      {/* Open mouth — shocked "O" */}
      <ellipse cx="70" cy="86" rx="6" ry="5" fill="#1B2A41" />
      <ellipse cx="70" cy="86" rx="4.5" ry="3.5" fill="#8B4444" />
      {/* Neck */}
      <rect x="62" y="93" width="16" height="11" rx="3" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Lab coat */}
      <path d="M 25 104 L 28 188 L 112 188 L 115 104 Q 100 96 85 98 L 70 106 L 55 98 Q 40 96 25 104 Z" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <path d="M 55 98 L 66 117 L 70 106" fill="#EEE" stroke="#1B2A41" strokeWidth="1.5" />
      <path d="M 85 98 L 74 117 L 70 106" fill="#EEE" stroke="#1B2A41" strokeWidth="1.5" />
      <path d="M 70 106 L 67 116 L 70 125 L 73 116 Z" fill="#D9603B" />
      {/* Left arm — flung out in shock */}
      <path d="M 27 120 Q 10 108 4 92 Q 0 82 8 78 Q 16 74 20 84" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <ellipse cx="5" cy="75" rx="9" ry="11" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Right arm — also flung out */}
      <path d="M 113 118 Q 132 108 136 90 Q 140 80 132 76 Q 124 72 120 82" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <ellipse cx="135" cy="74" rx="9" ry="11" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Shock lines */}
      <line x1="8" y1="60" x2="3" y2="55" stroke="#C99A3D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12" y1="58" x2="8" y2="52" stroke="#C99A3D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="130" y1="60" x2="135" y2="54" stroke="#C99A3D" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="126" y1="58" x2="130" y2="52" stroke="#C99A3D" strokeWidth="1.5" strokeLinecap="round" />
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
      {/* Putois — also alarmed */}
      <ellipse cx="116" cy="193" rx="18" ry="8" fill="#1B2A41" />
      <ellipse cx="121" cy="184" rx="9" ry="9" fill="#1B2A41" />
      <ellipse cx="121" cy="184" rx="5.5" ry="5.5" fill="white" />
      <path d="M 100 191 Q 116 186 131 191" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 131 189 Q 143 178 138 168" fill="none" stroke="#1B2A41" strokeWidth="4" strokeLinecap="round" />
      <path d="M 131 190 Q 141 180 136 170" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="124" cy="182" r="1.5" fill="#1B2A41" stroke="white" strokeWidth="0.5" />
    </svg>
  );
}

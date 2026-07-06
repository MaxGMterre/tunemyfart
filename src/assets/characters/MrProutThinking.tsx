export function MrProutThinking({ size = 140 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 140 200"
      width={size}
      height={(size * 200) / 140}
      aria-label="Professeur Prout pensif"
      role="img"
    >
      {/* Hair — slightly messier */}
      <ellipse cx="43" cy="39" rx="22" ry="17" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="70" cy="32" rx="25" ry="18" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="97" cy="39" rx="22" ry="17" fill="#F8F8F8" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Head tilted slightly */}
      <ellipse cx="70" cy="65" rx="27" ry="29" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="2" />
      {/* Glasses */}
      <circle cx="57" cy="63" r="9" fill="rgba(245,237,214,0.5)" stroke="#C99A3D" strokeWidth="2" />
      <line x1="66" y1="63" x2="72" y2="63" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="37" y1="62" x2="48" y2="63" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="72" y1="63" x2="96" y2="62" stroke="#C99A3D" strokeWidth="1.5" />
      <circle cx="82" cy="62" r="7" fill="none" stroke="#C99A3D" strokeWidth="1.5" />
      <line x1="85" y1="58" x2="89" y2="53" stroke="#C99A3D" strokeWidth="1" />
      {/* Eyes — looking up-left */}
      <circle cx="55" cy="61" r="4" fill="#1B2A41" />
      <circle cx="80" cy="60" r="3.5" fill="#1B2A41" />
      {/* Eyebrow raised */}
      <path d="M 50 54 Q 57 51 64 54" fill="none" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round" />
      <path d="M 75 53 Q 81 51 87 53" fill="none" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round" />
      {/* Nose */}
      <ellipse cx="70" cy="72" rx="3" ry="2" fill="#C99A3D" opacity="0.45" />
      {/* Mustache */}
      <path d="M 59 77 Q 65 81 70 78 Q 75 81 81 77" fill="none" stroke="#1B2A41" strokeWidth="2.5" strokeLinecap="round" />
      {/* Thinking expression */}
      <path d="M 63 84 Q 70 86 77 83" fill="none" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      {/* Thought bubble */}
      <circle cx="100" cy="42" r="3" fill="white" stroke="#1B2A41" strokeWidth="1" opacity="0.8" />
      <circle cx="108" cy="35" r="5" fill="white" stroke="#1B2A41" strokeWidth="1" opacity="0.9" />
      <circle cx="118" cy="26" r="7" fill="white" stroke="#1B2A41" strokeWidth="1.5" />
      <text x="118" y="29" textAnchor="middle" fontSize="6" fill="#1B2A41">?</text>
      {/* Neck */}
      <rect x="62" y="92" width="16" height="11" rx="3" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Lab coat */}
      <path d="M 25 103 L 28 188 L 112 188 L 115 103 Q 100 95 85 97 L 70 105 L 55 97 Q 40 95 25 103 Z" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <path d="M 55 97 L 66 116 L 70 105" fill="#EEE" stroke="#1B2A41" strokeWidth="1.5" />
      <path d="M 85 97 L 74 116 L 70 105" fill="#EEE" stroke="#1B2A41" strokeWidth="1.5" />
      <path d="M 70 105 L 67 115 L 70 124 L 73 115 Z" fill="#D9603B" />
      {/* Left arm — hand at chin */}
      <path d="M 28 120 Q 20 130 30 148 Q 36 158 50 155" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <path d="M 50 155 Q 60 155 65 148 Q 68 140 62 135 Q 55 132 50 138" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Finger at chin */}
      <line x1="62" y1="135" x2="68" y2="128" stroke="#F5EDD6" strokeWidth="4" strokeLinecap="round" />
      <line x1="62" y1="135" x2="68" y2="128" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" />
      {/* Right arm — hanging */}
      <path d="M 112 118 Q 126 140 124 162 Q 123 168 118 166" fill="white" stroke="#1B2A41" strokeWidth="2" />
      <ellipse cx="121" cy="167" rx="8" ry="10" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5" />
      {/* Pocket */}
      <rect x="32" y="132" width="20" height="24" rx="3" fill="none" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="36" y="130" width="4" height="18" rx="2" fill="#C99A3D" />
      <ellipse cx="90" cy="125" rx="10" ry="6" fill="#C99A3D" opacity="0.2" />
      <circle cx="70" cy="145" r="2.5" fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1" />
      <circle cx="70" cy="158" r="2.5" fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1" />
      <circle cx="70" cy="171" r="2.5" fill="#E8E0CC" stroke="#1B2A41" strokeWidth="1" />
      <rect x="47" y="186" width="20" height="12" rx="2" fill="#2A3548" stroke="#1B2A41" strokeWidth="1.5" />
      <rect x="73" y="186" width="20" height="12" rx="2" fill="#2A3548" stroke="#1B2A41" strokeWidth="1.5" />
      <ellipse cx="57" cy="198" rx="14" ry="5" fill="#1B2A41" />
      <ellipse cx="83" cy="198" rx="14" ry="5" fill="#1B2A41" />
      {/* Putois also looking thoughtful */}
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

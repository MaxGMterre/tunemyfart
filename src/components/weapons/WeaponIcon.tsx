import type { WeaponType, WeaponRarity } from "../../lib/weapons";

interface WeaponIconProps {
  weaponType: WeaponType;
  visualSeed: string;
  rarity: WeaponRarity;
  size?: number;
}

const RARITY_COLORS: Record<WeaponRarity, string> = {
  common: "#8A9E8A", uncommon: "#4A9B7F", rare: "#4A7FB5", epic: "#9B59B6", legendary: "#C99A3D",
};

function seedToNum(seed: string, offset: number): number {
  const val = parseInt(seed.substring(offset % 6, (offset % 6) + 2) || "80", 16);
  return val / 255;
}

export function WeaponIcon({ weaponType, visualSeed, rarity, size = 80 }: WeaponIconProps) {
  const rarityColor = RARITY_COLORS[rarity];
  const hue = Math.round(seedToNum(visualSeed, 0) * 360);
  const bodyColor = `hsl(${hue}, 60%, 55%)`;
  const isShiny = rarity === "epic" || rarity === "legendary";

  return (
    <svg viewBox="0 0 80 80" width={size} height={size} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="40" cy="40" r="36" fill={rarityColor} opacity="0.15" />
      <circle cx="40" cy="40" r="36" stroke="#1D1D1F" strokeWidth="2.5" />
      {weaponType === "canon" && <>
        <rect x="15" y="33" width="40" height="14" rx="7" fill={bodyColor} stroke="#1D1D1F" strokeWidth="2"/>
        <rect x="52" y="28" width="12" height="24" rx="6" fill={bodyColor} stroke="#1D1D1F" strokeWidth="2"/>
        <circle cx="26" cy="40" r="5" fill="#1D1D1F"/>
        <circle cx="27" cy="39" r="1.5" fill="white" opacity="0.5"/>
        {isShiny && <path d="M60 30 L65 25" stroke="#FFD700" strokeWidth="2" strokeLinecap="round"/>}
      </>}
      {weaponType === "flechette" && <>
        <path d="M18 40 L55 40 L62 35 L62 45 Z" fill={bodyColor} stroke="#1D1D1F" strokeWidth="2"/>
        <path d="M18 37 L18 43 L12 40 Z" fill="#E63946" stroke="#1D1D1F" strokeWidth="1.5"/>
        <line x1="28" y1="38" x2="28" y2="42" stroke="#1D1D1F" strokeWidth="1.5"/>
        <line x1="38" y1="38" x2="38" y2="42" stroke="#1D1D1F" strokeWidth="1.5"/>
        {isShiny && <circle cx="60" cy="40" r="3" fill="#FFD700" opacity="0.8"/>}
      </>}
      {weaponType === "sirene" && <>
        <ellipse cx="40" cy="40" rx="18" ry="14" fill={bodyColor} stroke="#1D1D1F" strokeWidth="2"/>
        <path d="M58 32 Q68 40 58 48" stroke={bodyColor} strokeWidth="6" strokeLinecap="round" fill="none"/>
        <path d="M58 32 Q68 40 58 48" stroke="#1D1D1F" strokeWidth="2" strokeLinecap="round" fill="none"/>
        <circle cx="34" cy="38" r="3" fill="#1D1D1F"/>
        {isShiny && <line x1="65" y1="36" x2="70" y2="32" stroke="#FFD700" strokeWidth="1.5"/>}
      </>}
      {weaponType === "bardique" && <>
        <ellipse cx="34" cy="48" rx="12" ry="10" fill={bodyColor} stroke="#1D1D1F" strokeWidth="2"/>
        <rect x="44" y="22" width="5" height="30" rx="2.5" fill={bodyColor} stroke="#1D1D1F" strokeWidth="2"/>
        <path d="M44 22 Q52 20 53 26 Q52 32 44 30" fill={bodyColor} stroke="#1D1D1F" strokeWidth="1.5"/>
        <line x1="30" y1="40" x2="30" y2="55" stroke="#1D1D1F" strokeWidth="1.5"/>
        <line x1="34" y1="38" x2="34" y2="58" stroke="#1D1D1F" strokeWidth="1.5"/>
        <line x1="38" y1="40" x2="38" y2="55" stroke="#1D1D1F" strokeWidth="1.5"/>
        {isShiny && <text x="55" y="25" fontSize="10" fill="#FFD700">♪</text>}
      </>}
      {weaponType === "sniper" && <>
        <rect x="12" y="37" width="50" height="6" rx="3" fill={bodyColor} stroke="#1D1D1F" strokeWidth="2"/>
        <rect x="52" y="30" width="6" height="20" rx="3" fill={bodyColor} stroke="#1D1D1F" strokeWidth="1.5"/>
        <circle cx="56" cy="36" r="4" fill="#1D1D1F"/>
        <circle cx="57" cy="35" r="1.5" fill="white" opacity="0.6"/>
        <rect x="22" y="43" width="10" height="10" rx="2" fill={bodyColor} stroke="#1D1D1F" strokeWidth="1.5"/>
      </>}
      {weaponType === "conventionnel" && <>
        <rect x="18" y="34" width="30" height="12" rx="4" fill={bodyColor} stroke="#1D1D1F" strokeWidth="2"/>
        <rect x="46" y="36" width="16" height="8" rx="4" fill={bodyColor} stroke="#1D1D1F" strokeWidth="2"/>
        <rect x="26" y="46" width="14" height="8" rx="3" fill={bodyColor} stroke="#1D1D1F" strokeWidth="1.5"/>
        <circle cx="28" cy="38" r="2.5" fill="#1D1D1F"/>
        <circle cx="28.7" cy="37.3" r="0.8" fill="white" opacity="0.5"/>
      </>}
      {rarity === "legendary" && <>
        <text x="8" y="18" fontSize="8" fill="#FFD700">✦</text>
        <text x="64" y="18" fontSize="8" fill="#FFD700">✦</text>
      </>}
    </svg>
  );
}

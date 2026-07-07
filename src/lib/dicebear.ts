export type WeaponType = "canon" | "flechette" | "sirene" | "bardique" | "sniper" | "conventionnel";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

const RARITY_BG_COLORS: Record<Rarity, string[]> = {
  common:    ["b0b0b0"],
  uncommon:  ["4ecdc4"],
  rare:      ["3498db"],
  epic:      ["9b59b6"],
  legendary: ["FFD93D", "FF6B35"],
};

/** Simple seeded PRNG (mulberry32) */
function seedRng(seed: string): () => number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = (Math.imul(h, 0x01000193) | 0) >>> 0;
  }
  return () => {
    h ^= h << 13;
    h ^= h >> 17;
    h ^= h << 5;
    return ((h >>> 0) / 0xffffffff);
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function hex2rgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return [r, g, b];
}

function lighten(hex: string, amount: number): string {
  const [r, g, b] = hex2rgb(hex);
  const lr = Math.min(255, Math.round(r + (255 - r) * amount));
  const lg = Math.min(255, Math.round(g + (255 - g) * amount));
  const lb = Math.min(255, Math.round(b + (255 - b) * amount));
  return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`;
}

function darken(hex: string, amount: number): string {
  const [r, g, b] = hex2rgb(hex);
  const dr = Math.max(0, Math.round(r * (1 - amount)));
  const dg = Math.max(0, Math.round(g * (1 - amount)));
  const db = Math.max(0, Math.round(b * (1 - amount)));
  return `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db.toString(16).padStart(2, "0")}`;
}

/** Generate a procedural weapon avatar SVG encoded as a data URI */
export function generateWeaponSvg(visualSeed: string, rarity: Rarity): string {
  const rng = seedRng(visualSeed + rarity);
  const bgHex = pick(rng, RARITY_BG_COLORS[rarity]);
  const bg = `#${bgHex}`;
  const bgLight = lighten(bgHex, 0.4);

  // Body color derived from seed
  const hue = Math.floor(rng() * 360);
  const sat = 50 + Math.floor(rng() * 30);
  const lit = 45 + Math.floor(rng() * 20);
  const bodyColor = `hsl(${hue},${sat}%,${lit}%)`;
  const accentColor = `hsl(${(hue + 40) % 360},${sat}%,${lit - 10}%)`;

  const isLegendary = rarity === "legendary";
  const isEpic = rarity === "epic";
  const shimmer = isLegendary ? `<circle cx="72" cy="16" r="5" fill="#FFD93D" opacity="0.9"/>
    <circle cx="16" cy="72" r="3" fill="#FF6B35" opacity="0.7"/>
    <text x="6" y="16" font-size="9" fill="#FFD93D">✦</text>
    <text x="72" y="88" font-size="9" fill="#FFD93D">✦</text>` : "";
  const epicGlow = isEpic ? `<circle cx="48" cy="48" r="40" fill="none" stroke="#9b59b6" stroke-width="1" opacity="0.5"/>` : "";

  // Botts-inspired procedural robot/weapon face
  const eyeShape = Math.floor(rng() * 3);
  const eyeSvg = eyeShape === 0
    ? `<circle cx="36" cy="44" r="6" fill="${accentColor}"/><circle cx="60" cy="44" r="6" fill="${accentColor}"/>`
    : eyeShape === 1
    ? `<rect x="30" y="39" width="12" height="10" rx="2" fill="${accentColor}"/><rect x="54" y="39" width="12" height="10" rx="2" fill="${accentColor}"/>`
    : `<ellipse cx="36" cy="44" rx="7" ry="5" fill="${accentColor}"/><ellipse cx="60" cy="44" rx="7" ry="5" fill="${accentColor}"/>`;

  const mouthType = Math.floor(rng() * 3);
  const mouthSvg = mouthType === 0
    ? `<rect x="36" y="58" width="24" height="6" rx="3" fill="${accentColor}"/>`
    : mouthType === 1
    ? `<path d="M36 58 Q48 68 60 58" stroke="${accentColor}" stroke-width="3" fill="none" stroke-linecap="round"/>`
    : `<rect x="34" y="56" width="6" height="10" rx="1" fill="${accentColor}"/><rect x="45" y="56" width="6" height="10" rx="1" fill="${accentColor}"/>`;

  const antennaType = Math.floor(rng() * 2);
  const antennaSvg = antennaType === 0
    ? `<line x1="48" y1="20" x2="48" y2="32" stroke="${darken(bgHex, 0.3)}" stroke-width="2"/><circle cx="48" cy="18" r="4" fill="${bodyColor}"/>`
    : `<line x1="40" y1="22" x2="36" y2="12" stroke="${darken(bgHex, 0.3)}" stroke-width="2"/><circle cx="34" cy="10" r="3" fill="${bodyColor}"/>
       <line x1="56" y1="22" x2="60" y2="12" stroke="${darken(bgHex, 0.3)}" stroke-width="2"/><circle cx="62" cy="10" r="3" fill="${bodyColor}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${bgLight}"/>
      <stop offset="100%" stop-color="${bg}"/>
    </linearGradient>
  </defs>
  <rect width="96" height="96" rx="16" fill="url(#bg)"/>
  ${epicGlow}
  ${antennaSvg}
  <rect x="22" y="24" width="52" height="52" rx="10" fill="${bodyColor}" stroke="${darken(bgHex, 0.4)}" stroke-width="2"/>
  <rect x="28" y="30" width="40" height="26" rx="6" fill="${lighten(bgHex.replace("#", ""), 0.15)}" opacity="0.5"/>
  ${eyeSvg}
  ${mouthSvg}
  ${shimmer}
</svg>`;

  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}

/** Generate a procedural user avatar encoded as a data URI */
export function generateUserAvatar(userId: string, customSeed?: string): string {
  const seed = customSeed ?? userId;
  const rng = seedRng(seed);

  const hue = Math.floor(rng() * 360);
  const bg = `hsl(${hue},60%,80%)`;
  const skin = `hsl(${30 + Math.floor(rng() * 20)},${60 + Math.floor(rng() * 20)}%,${65 + Math.floor(rng() * 20)}%)`;
  const hairHue = Math.floor(rng() * 360);
  const hair = `hsl(${hairHue},50%,35%)`;
  const eyeColor = `hsl(${Math.floor(rng() * 360)},60%,35%)`;

  const accessoryType = Math.floor(rng() * 4);
  const accessory = accessoryType === 0
    ? `<circle cx="32" cy="36" r="4" fill="none" stroke="${hair}" stroke-width="1.5"/>
       <circle cx="64" cy="36" r="4" fill="none" stroke="${hair}" stroke-width="1.5"/>
       <line x1="36" y1="36" x2="60" y2="36" stroke="${hair}" stroke-width="1.5"/>`
    : accessoryType === 1
    ? `<path d="M28 32 Q48 22 68 32" fill="${hair}" opacity="0.9"/>`
    : accessoryType === 2
    ? `<rect x="27" y="32" width="15" height="9" rx="4" fill="none" stroke="${eyeColor}" stroke-width="1.5"/>
       <rect x="54" y="32" width="15" height="9" rx="4" fill="none" stroke="${eyeColor}" stroke-width="1.5"/>
       <line x1="42" y1="36" x2="54" y2="36" stroke="${eyeColor}" stroke-width="1.5"/>`
    : "";

  const hairStyle = Math.floor(rng() * 3);
  const hairTop = hairStyle === 0
    ? `<ellipse cx="48" cy="22" rx="22" ry="14" fill="${hair}"/>`
    : hairStyle === 1
    ? `<rect x="26" y="14" width="44" height="16" rx="8" fill="${hair}"/>`
    : `<path d="M26 28 Q36 10 48 14 Q60 10 70 28" fill="${hair}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <rect width="96" height="96" rx="8" fill="${bg}"/>
  <ellipse cx="48" cy="90" rx="26" ry="12" fill="${darken(bg.replace("hsl", "").replace("(", "").replace(")", ""), 0.1)}" opacity="0.3"/>
  <rect x="28" y="58" width="40" height="30" rx="10" fill="${skin}"/>
  <ellipse cx="48" cy="46" rx="22" ry="24" fill="${skin}"/>
  ${hairTop}
  <circle cx="38" cy="44" r="4" fill="white"/>
  <circle cx="58" cy="44" r="4" fill="white"/>
  <circle cx="39" cy="45" r="2.5" fill="${eyeColor}"/>
  <circle cx="59" cy="45" r="2.5" fill="${eyeColor}"/>
  <circle cx="40" cy="44" r="1" fill="white" opacity="0.8"/>
  <circle cx="60" cy="44" r="1" fill="white" opacity="0.8"/>
  <ellipse cx="36" cy="54" rx="4" ry="2.5" fill="${skin}" opacity="0.6"/>
  <ellipse cx="60" cy="54" rx="4" ry="2.5" fill="${skin}" opacity="0.6"/>
  <path d="M40 54 Q48 60 56 54" stroke="${darken(skin.replace("hsl","").replace("(","").replace(")",""), 0.2)}" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  ${accessory}
</svg>`;

  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
}

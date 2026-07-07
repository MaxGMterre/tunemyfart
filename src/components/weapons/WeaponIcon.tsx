import { generateWeaponSvg } from "../../lib/dicebear";
import type { Rarity } from "../../lib/dicebear";

interface Props {
  visualSeed: string;
  rarity: string;
  size?: number;
}

export function WeaponIcon({ visualSeed, rarity, size = 64 }: Props) {
  const dataUri = generateWeaponSvg(visualSeed, rarity as Rarity);
  return (
    <img
      src={dataUri}
      width={size}
      height={size}
      alt="Arme"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

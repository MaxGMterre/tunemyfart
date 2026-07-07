import { motion, AnimatePresence } from "framer-motion";
import { WeaponIcon } from "./weapons/WeaponIcon";
import { playSound } from "../lib/soundEffects";
import type { Weapon } from "../lib/weapons";
import "./NewWeaponModal.css";

const RARITY_LABELS: Record<string, string> = {
  common: "Commune",
  uncommon: "Peu commune",
  rare: "Rare",
  epic: "Épique",
  legendary: "Légendaire",
};

const RARITY_COLORS: Record<string, string> = {
  common:    "#9e9e9e",
  uncommon:  "#4ECDC4",
  rare:      "#3498db",
  epic:      "#9b59b6",
  legendary: "#FFD93D",
};

interface Props {
  weapon: Weapon;
  onClose: () => void;
}

export function NewWeaponModal({ weapon, onClose }: Props) {
  // play sound on mount (useEffect not needed — fire once on first render)
  playSound("weaponObtained");
  void playSound;

  const rarityColor = RARITY_COLORS[weapon.rarity] ?? "#9e9e9e";

  return (
    <AnimatePresence>
      <motion.div
        className="new-weapon-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ "--rarity-color": rarityColor } as React.CSSProperties}
      >
        <motion.div
          className="new-weapon-card"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0, rotate: 10 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="new-weapon-flash" />
          <p className="new-weapon-tag">Nouvelle arme !</p>
          <WeaponIcon visualSeed={weapon.visual_seed} rarity={weapon.rarity} size={120} />
          <h2 className="new-weapon-name">{weapon.name}</h2>
          <div className="new-weapon-rarity" style={{ color: rarityColor }}>
            ★ {RARITY_LABELS[weapon.rarity] ?? weapon.rarity}
          </div>
          <div className="new-weapon-stats">
            <div className="new-weapon-stat"><span>Puissance</span><div className="stat-bar"><div style={{ width: `${weapon.power}%`, background: rarityColor }} /></div></div>
            <div className="new-weapon-stat"><span>Portée</span><div className="stat-bar"><div style={{ width: `${weapon.range_stat ?? 0}%`, background: rarityColor }} /></div></div>
            <div className="new-weapon-stat"><span>Style</span><div className="stat-bar"><div style={{ width: `${weapon.style_stat ?? 0}%`, background: rarityColor }} /></div></div>
          </div>
          <button className="new-weapon-close" onClick={onClose}>
            Voir dans l'Arsenal →
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

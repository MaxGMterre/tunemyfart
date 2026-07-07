import { useEffect, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { fetchUserWeapons, toggleFavorite } from "../lib/weapons";
import type { Weapon, WeaponType, WeaponRarity } from "../lib/weapons";
import { WeaponIcon } from "./weapons/WeaponIcon";

const RARITY_LABELS: Record<WeaponRarity, string> = {
  common: "Commune", uncommon: "Peu commune", rare: "Rare", epic: "Épique", legendary: "Légendaire",
};
const RARITY_COLORS: Record<WeaponRarity, string> = {
  common: "#8A9E8A", uncommon: "#4A9B7F", rare: "#4A7FB5", epic: "#9B59B6", legendary: "#C99A3D",
};
const TYPE_LABELS: Record<WeaponType, string> = {
  canon: "💥 Canon", sirene: "📢 Sirène", flechette: "🎯 Fléchette",
  bardique: "🎵 Bardique", sniper: "🎯 Sniper", conventionnel: "🔫 Conv.",
};

function StatBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="weapon-stat-row">
      <span className="weapon-stat-label">{label}</span>
      <div className="weapon-stat-track">
        <div className="weapon-stat-fill" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="weapon-stat-value">{value}</span>
    </div>
  );
}

export function WeaponArsenal() {
  const { user } = useAuth();
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Weapon | null>(null);
  const [filterRarity, setFilterRarity] = useState<WeaponRarity | "all">("all");
  const [sort, setSort] = useState<"score" | "date">("score");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user || !open) return;
    setLoading(true);
    fetchUserWeapons(user.id).then((data) => { setWeapons(data); setLoading(false); });
  }, [user, open]);

  const filtered = weapons
    .filter((w) => filterRarity === "all" || w.rarity === filterRarity)
    .sort((a, b) => sort === "score"
      ? (b.overall_score ?? 0) - (a.overall_score ?? 0)
      : new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    );

  const handleToggleFav = async (w: Weapon) => {
    if (!w.id) return;
    await toggleFavorite(w.id, !w.is_favorite);
    setWeapons((prev) => prev.map((x) => x.id === w.id ? { ...x, is_favorite: !x.is_favorite } : x));
    setSelected((prev) => {
      if (!prev || prev.id !== w.id) return prev;
      return { ...prev, is_favorite: !prev.is_favorite };
    });
  };

  if (!user) return null;

  return (
    <div className="weapon-arsenal">
      <button className="weapon-arsenal-toggle" onClick={() => setOpen(!open)}>
        <span>⚔️ Arsenal d'armes</span>
        <span className="weapon-arsenal-count">{weapons.length > 0 ? `${weapons.length} armes` : "0 armes"}</span>
        <span className="weapon-arsenal-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="weapon-arsenal-body">
          <div className="weapon-filters">
            <select className="weapon-filter-select" value={filterRarity} onChange={(e) => setFilterRarity(e.target.value as WeaponRarity | "all")}>
              <option value="all">Toutes raretés</option>
              {(["common","uncommon","rare","epic","legendary"] as WeaponRarity[]).map((r) => (
                <option key={r} value={r}>{RARITY_LABELS[r]}</option>
              ))}
            </select>
            <select className="weapon-filter-select" value={sort} onChange={(e) => setSort(e.target.value as "score" | "date")}>
              <option value="score">Par score</option>
              <option value="date">Par date</option>
            </select>
          </div>
          {loading ? (
            <div className="weapon-empty">Chargement de l'arsenal…</div>
          ) : filtered.length === 0 ? (
            <div className="weapon-empty">Aucune arme. Enregistrez un prout pour en obtenir une !</div>
          ) : (
            <div className="weapon-grid">
              {filtered.map((w) => (
                <div key={w.id} className="weapon-card" style={{ borderColor: RARITY_COLORS[w.rarity as WeaponRarity] }} onClick={() => setSelected(w)}>
                  <WeaponIcon weaponType={w.weapon_type as WeaponType} visualSeed={w.visual_seed} rarity={w.rarity as WeaponRarity} size={56} />
                  <div className="weapon-card-info">
                    <div className="weapon-card-name">{w.name}</div>
                    <div className="weapon-card-type">{TYPE_LABELS[w.weapon_type as WeaponType]}</div>
                    <div className="weapon-card-score" style={{ color: RARITY_COLORS[w.rarity as WeaponRarity] }}>⭐ {w.overall_score}</div>
                  </div>
                  {w.is_favorite && <span className="weapon-fav-badge">❤️</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selected && (
        <div className="weapon-modal-overlay" onClick={() => setSelected(null)}>
          <div className="weapon-modal" onClick={(e) => e.stopPropagation()}>
            <WeaponIcon weaponType={selected.weapon_type as WeaponType} visualSeed={selected.visual_seed} rarity={selected.rarity as WeaponRarity} size={100} />
            <h3 className="weapon-modal-name">{selected.name}</h3>
            <div className="weapon-modal-type">{TYPE_LABELS[selected.weapon_type as WeaponType]}</div>
            <div className="weapon-modal-rarity" style={{ color: RARITY_COLORS[selected.rarity as WeaponRarity] }}>{RARITY_LABELS[selected.rarity as WeaponRarity]}</div>
            <div className="weapon-modal-stats">
              <StatBar label="⚡ Puissance" value={selected.power ?? 0} color="#FF6B35" />
              <StatBar label="📏 Portée" value={selected.range_stat ?? 0} color="#4ECDC4" />
              <StatBar label="🎯 Précision" value={selected.precision_stat ?? 0} color="#FFD93D" />
              <StatBar label="✨ Style" value={selected.style_stat ?? 0} color="#C77DFF" />
            </div>
            <div className="weapon-modal-score">Score global : {selected.overall_score}/100</div>
            <div className="weapon-modal-actions">
              <button className="weapon-fav-btn" onClick={() => handleToggleFav(selected)}>
                {selected.is_favorite ? "💔 Retirer" : "❤️ Favori"}
              </button>
              <button className="weapon-close-btn" onClick={() => setSelected(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

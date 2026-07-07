import { useEffect, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabase";

interface ArtifactRow {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  description: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  lore: string;
}

interface UserArtifact {
  artifact_id: number;
}

export function ArtifactCabinet() {
  const { user } = useAuth();
  const [artifacts, setArtifacts] = useState<ArtifactRow[]>([]);
  const [owned, setOwned] = useState<Set<number>>(new Set());
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ArtifactRow | null>(null);

  useEffect(() => {
    supabase
      .from("artifacts")
      .select("*")
      .order("id")
      .then(({ data }) => {
        if (data) setArtifacts(data as ArtifactRow[]);
      });
    if (user) {
      supabase
        .from("user_artifacts")
        .select("artifact_id")
        .eq("user_id", user.id)
        .then(({ data }) => {
          if (data)
            setOwned(
              new Set((data as UserArtifact[]).map((r) => r.artifact_id))
            );
        });
    }
  }, [user]);

  const ownedCount = owned.size;
  const RARITY_COLORS: Record<string, string> = {
    common: "#8A9E8A",
    uncommon: "#4A9B7F",
    rare: "#4A7FB5",
    legendary: "#C99A3D",
  };

  return (
    <div className="artifact-cabinet">
      <button
        className="artifact-cabinet-toggle"
        onClick={() => setOpen(!open)}
      >
        <span>Cabinet de curiosités</span>
        <span className="artifact-count">
          {ownedCount} / {artifacts.length}
        </span>
        <span className="artifact-chevron">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="artifact-grid">
          {artifacts.map((art) => {
            const isOwned = owned.has(art.id);
            return (
              <button
                key={art.id}
                className={`artifact-cell${isOwned ? " owned" : " locked"}`}
                onClick={() => isOwned && setSelected(art)}
                title={isOwned ? art.name : "???"}
              >
                {isOwned ? (
                  <div
                    className="artifact-icon"
                    style={{ color: RARITY_COLORS[art.rarity] }}
                  >
                    {getArtifactEmoji(art.slug)}
                  </div>
                ) : (
                  <div className="artifact-locked">🔒</div>
                )}
                <div className="artifact-cell-name">
                  {isOwned ? art.name : "???"}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div
          className="artifact-modal-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="artifact-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="artifact-modal-icon"
              style={{ color: RARITY_COLORS[selected.rarity] }}
            >
              {getArtifactEmoji(selected.slug)}
            </div>
            <h3 className="artifact-modal-name">{selected.name}</h3>
            <p className="artifact-modal-subtitle">{selected.subtitle}</p>
            <div
              className={`artifact-rarity-badge rarity-${selected.rarity}`}
            >
              {selected.rarity === "common"
                ? "Commune"
                : selected.rarity === "uncommon"
                ? "Peu commune"
                : selected.rarity === "rare"
                ? "Rare"
                : "Légendaire"}
            </div>
            <p className="artifact-modal-lore">{selected.lore}</p>
            <button
              className="artifact-modal-close"
              onClick={() => setSelected(null)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getArtifactEmoji(slug: string): string {
  const map: Record<string, string> = {
    barometre_flatulence_1743: "🌡️",
    diapason_ambroise_1876: "🎵",
    oreillettes_fartesius_1601: "👂",
    livre_des_vents_1802: "📜",
    fiole_energetique: "⚗️",
    lunette_olfactive: "🔭",
    gant_mesureur: "🧤",
    pendule_gazeux: "⏰",
    carte_registres: "🗺️",
    sceau_academie: "🏛️",
    plume_chronique: "✒️",
    ampoule_premiere: "💡",
    soufflet_analyse: "🎺",
    medaille_fondateur: "🏅",
    clef_labo: "🗝️",
  };
  return map[slug] ?? "🧪";
}

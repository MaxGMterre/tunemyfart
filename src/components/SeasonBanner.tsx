import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Season {
  id: string;
  name: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  color_primary: string | null;
}

function formatCountdown(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days}j ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return "Bientôt terminée";
}

export function SeasonBanner() {
  const [season, setSeason] = useState<Season | null>(null);

  useEffect(() => {
    async function fetchSeason() {
      const { data } = await supabase
        .from("seasons")
        .select("*")
        .lte("starts_at", new Date().toISOString())
        .gte("ends_at", new Date().toISOString())
        .limit(1)
        .maybeSingle();
      setSeason(data as Season | null);
    }
    fetchSeason();
  }, []);

  if (!season) return null;

  const start = new Date(season.starts_at).getTime();
  const end = new Date(season.ends_at).getTime();
  const now = Date.now();
  const totalDuration = end - start;
  const elapsed = now - start;
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  return (
    <div
      className="season-banner"
      style={{ borderLeftColor: season.color_primary ?? "var(--color-brass)" }}
    >
      <div className="season-banner-left">
        <span className="season-label">SAISON EN COURS</span>
        <span className="season-name">{season.name}</span>
        {season.description && (
          <span className="season-desc">{season.description}</span>
        )}
      </div>
      <div className="season-banner-right">
        <span className="season-countdown-label">Fin dans</span>
        <span className="season-countdown">{formatCountdown(season.ends_at)}</span>
      </div>
      <div className="season-progress-bar">
        <div
          className="season-progress-fill"
          style={{
            width: `${progress}%`,
            background: season.color_primary ?? "var(--color-brass)",
          }}
        />
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { supabase } from "../lib/supabase";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 11) return "Bonjour, cher chercheur";
  if (h >= 11 && h < 14) return "Bon appétit — tout est propice à la sonoflatulogie";
  if (h >= 14 && h < 18) return "L'après-midi est jeune";
  if (h >= 18 && h < 22) return "Bonsoir, le laboratoire est prêt";
  return "Une session nocturne ? Fascinant";
}

interface TodayDashboardProps {
  onGoToAnalyser: () => void;
  onGoToMissions: () => void;
}

export function TodayDashboard({ onGoToAnalyser, onGoToMissions }: TodayDashboardProps) {
  const { user } = useAuth();
  const [todayCount, setTodayCount] = useState<number>(0);
  const [bestDb, setBestDb] = useState<number | null>(null);
  const [dominantNote, setDominantNote] = useState<string | null>(null);
  const [feedItems, setFeedItems] = useState<{ pseudo: string; note: string; db: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    supabase
      .from("recordings")
      .select("db_max, note_principale")
      .eq("user_id", user.id)
      .gte("created_at", today.toISOString())
      .then(({ data }) => {
        if (!data) return;
        setTodayCount(data.length);
        const maxDb = Math.max(...data.map((r: { db_max: number | null }) => r.db_max ?? -100));
        if (maxDb > -100) setBestDb(maxDb);
        const noteCount: Record<string, number> = {};
        data.forEach((r: { note_principale: string | null }) => {
          if (r.note_principale) noteCount[r.note_principale] = (noteCount[r.note_principale] ?? 0) + 1;
        });
        const top = Object.entries(noteCount).sort((a, b) => b[1] - a[1])[0];
        if (top) setDominantNote(top[0]);
      });

    // Feed rapide — 3 dernières activités
    supabase
      .from("recordings")
      .select("db_max, note_principale, profiles(pseudo)")
      .neq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (!data) return;
        setFeedItems(
          data.map((r: any) => ({
            pseudo: r.profiles?.pseudo ?? "Chercheur",
            note: r.note_principale ?? "—",
            db: r.db_max ?? 0,
          }))
        );
      });
  }, [user]);

  return (
    <div className="today-dashboard">
      <div className="today-greeting">{getGreeting()}</div>

      {/* Récap 24h */}
      <div className="today-recap">
        <div className="today-recap-card">
          <span className="today-recap-value">{todayCount}</span>
          <span className="today-recap-label">relevés aujourd'hui</span>
        </div>
        {bestDb !== null && (
          <div className="today-recap-card">
            <span className="today-recap-value">{bestDb.toFixed(1)} dB</span>
            <span className="today-recap-label">meilleur dB</span>
          </div>
        )}
        {dominantNote && (
          <div className="today-recap-card">
            <span className="today-recap-value">{dominantNote}</span>
            <span className="today-recap-label">note dominante</span>
          </div>
        )}
      </div>

      {/* Grand bouton Analyser */}
      <button className="today-cta" onClick={onGoToAnalyser}>
        <span className="today-cta-icon">🎙</span>
        <span className="today-cta-label">Nouveau relevé</span>
      </button>

      {/* Missions */}
      <button className="today-missions-link" onClick={onGoToMissions}>
        Voir les défis en cours →
      </button>

      {/* Feed rapide */}
      {feedItems.length > 0 && (
        <div className="today-feed">
          <div className="today-feed-title">Activité récente</div>
          {feedItems.map((item, i) => (
            <div key={i} className="today-feed-item">
              <span className="today-feed-pseudo">{item.pseudo}</span>
              <span className="today-feed-note">{item.note}</span>
              <span className="today-feed-db">{item.db.toFixed(1)} dB</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

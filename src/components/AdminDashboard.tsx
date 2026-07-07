import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/useAuth";

// Change this to your actual Supabase user ID after first login
const ADMIN_USER_IDS = ["__SET_YOUR_USER_ID__"];

interface DashboardStats {
  totalUsers: number;
  totalRecordings: number;
  totalCompositions: number;
  totalMissionsCompleted: number;
  recentSignups: number;
  topRecordings: { db_max: number; created_at: string }[];
  noteDistribution: { note: string; count: number }[];
  hourlyDistribution: { hour: number; count: number }[];
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "recordings" | "users">("overview");

  const isAdmin = user && ADMIN_USER_IDS.includes(user.id);

  useEffect(() => {
    if (!isAdmin) return;
    loadStats();
  }, [isAdmin]);

  async function loadStats() {
    setLoading(true);
    try {
      const [
        { count: totalRecordings },
        { count: totalUsers },
        { count: totalCompositions },
        { data: topRec },
        { data: noteDist },
      ] = await Promise.all([
        supabase.from("recordings").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("compositions").select("*", { count: "exact", head: true }),
        supabase.from("recordings")
          .select("db_max, created_at")
          .order("db_max", { ascending: false })
          .limit(5),
        supabase.from("recordings")
          .select("note_principale")
          .not("note_principale", "is", null)
          .limit(500),
      ]);

      // Compute note distribution
      const noteCount: Record<string, number> = {};
      (noteDist ?? []).forEach((r: { note_principale: string | null }) => {
        if (r.note_principale) noteCount[r.note_principale] = (noteCount[r.note_principale] ?? 0) + 1;
      });
      const noteDistribution = Object.entries(noteCount)
        .map(([note, count]) => ({ note, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12);

      // Recent signups (last 7 days) — gracefully handle if created_at is absent
      let recentSignups = 0;
      try {
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());
        recentSignups = count ?? 0;
      } catch {
        recentSignups = 0;
      }

      setStats({
        totalUsers: totalUsers ?? 0,
        totalRecordings: totalRecordings ?? 0,
        totalCompositions: totalCompositions ?? 0,
        totalMissionsCompleted: 0,
        recentSignups,
        topRecordings: (topRec ?? []) as DashboardStats["topRecordings"],
        noteDistribution,
        hourlyDistribution: [],
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (!user) return <div className="admin-guard">Connexion requise.</div>;
  if (!isAdmin) return (
    <div className="admin-guard">
      <p>Accès réservé aux administrateurs du laboratoire.</p>
      <p className="admin-user-id">Votre ID : <code>{user.id}</code></p>
    </div>
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-title">Tableau de bord — Administration</h1>
        <button className="admin-refresh" onClick={loadStats}>↻ Actualiser</button>
      </div>

      <div className="admin-tabs">
        {(["overview", "recordings", "users"] as const).map(t => (
          <button key={t} className={`admin-tab${activeTab === t ? " active" : ""}`}
            onClick={() => setActiveTab(t)}>
            {t === "overview" ? "Vue générale" : t === "recordings" ? "Relevés" : "Utilisateurs"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="admin-loading">Chargement des données…</p>
      ) : stats ? (
        <>
          {activeTab === "overview" && (
            <div className="admin-overview">
              <div className="admin-kpi-grid">
                {[
                  { label: "Relevés totaux", value: stats.totalRecordings },
                  { label: "Chercheurs inscrits", value: stats.totalUsers },
                  { label: "Compositions", value: stats.totalCompositions },
                  { label: "Nouveaux (7j)", value: stats.recentSignups },
                ].map(kpi => (
                  <div key={kpi.label} className="admin-kpi">
                    <span className="kpi-value">{kpi.value.toLocaleString("fr-FR")}</span>
                    <span className="kpi-label">{kpi.label}</span>
                  </div>
                ))}
              </div>
              <div className="admin-section">
                <h3 className="admin-section-title">Distribution des notes</h3>
                <div className="note-bars">
                  {stats.noteDistribution.map(({ note, count }) => {
                    const max = stats.noteDistribution[0]?.count ?? 1;
                    return (
                      <div key={note} className="note-bar-row">
                        <span className="note-bar-label">{note}</span>
                        <div className="note-bar-track">
                          <div className="note-bar-fill"
                            style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                        <span className="note-bar-count">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {activeTab === "recordings" && (
            <div className="admin-section">
              <h3 className="admin-section-title">Top 5 — Décibels maximum</h3>
              <table className="admin-table">
                <thead><tr><th>#</th><th>dB max</th><th>Date</th></tr></thead>
                <tbody>
                  {stats.topRecordings.map((r, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{r.db_max?.toFixed(1)} dB</td>
                      <td>{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {activeTab === "users" && (
            <div className="admin-section">
              <p className="admin-hint">
                Statistiques utilisateurs — Consultez la base Supabase pour les détails complets.
              </p>
              <div className="admin-kpi-grid">
                <div className="admin-kpi">
                  <span className="kpi-value">{stats.totalUsers}</span>
                  <span className="kpi-label">Total chercheurs</span>
                </div>
                <div className="admin-kpi">
                  <span className="kpi-value">{stats.recentSignups}</span>
                  <span className="kpi-label">7 derniers jours</span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

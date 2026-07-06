import { useEffect, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { MISSIONS, checkMissions } from "../lib/missions";
import type { MissionProgress } from "../lib/missions";
import { getPersonalStats, fetchUserRecordings } from "../lib/supabase";

export function Missions() {
  const { user } = useAuth();
  const [progressList, setProgressList] = useState<MissionProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProgressList(
        MISSIONS.map((m) => ({
          mission: m,
          completed: false,
          progress: 0,
          current: 0,
          target: "value" in m.condition ? (m.condition.value as number) : 1,
        }))
      );
      setLoading(false);
      return;
    }

    Promise.all([getPersonalStats(user.id), fetchUserRecordings(user.id)])
      .then(([stats, recordings]) => {
        const { progress } = checkMissions(stats, recordings);
        setProgressList(progress);
      })
      .catch(() => {
        setProgressList(
          MISSIONS.map((m) => ({
            mission: m,
            completed: false,
            progress: 0,
            current: 0,
            target: 0,
          }))
        );
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading)
    return <p className="status-text">Consultation du programme d'étude…</p>;

  const completed = progressList.filter((p) => p.completed).length;

  return (
    <div className="missions-panel">
      <p className="missions-progress-hint">
        {completed} / {progressList.length} protocoles accomplis
      </p>

      <div className="missions-list">
        {progressList.map(
          ({ mission, completed: done, progress, current, target }) => (
            <div
              key={mission.id}
              className={`mission-card${done ? " completed" : ""}`}
            >
              <div className="mission-header">
                <span className="mission-emoji">{mission.emoji}</span>
                <div className="mission-info">
                  <div className="mission-titre">{mission.titre}</div>
                  <div className="mission-description">
                    {mission.description}
                  </div>
                </div>
                {done && <span className="mission-check">✓</span>}
              </div>

              <div className="mission-progress-track">
                <div
                  className="mission-progress-bar"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              {done ? (
                <div className="mission-recompense">
                  🏅 {mission.recompense}
                </div>
              ) : (
                <div className="mission-counter">
                  Progression : {current} / {target}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { MISSIONS, checkMissions } from "../lib/missions";
import type { Mission, MissionProgress } from "../lib/missions";
import { getPersonalStats, fetchUserRecordings } from "../lib/supabase";
import { MissionRewardModal } from "./MissionRewardModal";
import { SeasonBanner } from "./SeasonBanner";
import { SFX } from "../lib/soundEffects";

const COMPLETED_KEY = "tmf_completed_missions";

function getStoredCompleted(): string[] {
  try {
    return JSON.parse(localStorage.getItem(COMPLETED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

interface MissionsProps {
  onComposerUnlocked?: () => void;
}

export function Missions({ onComposerUnlocked }: MissionsProps) {
  const { user } = useAuth();
  const [progressList, setProgressList] = useState<MissionProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [rewardMission, setRewardMission] = useState<Mission | null>(null);
  const rewardQueueRef = useRef<Mission[]>([]);

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
        const stored = getStoredCompleted();
        const { progress, newlyCompleted } = checkMissions(
          stats,
          recordings,
          stored
        );
        setProgressList(progress);

        if (newlyCompleted.length > 0) {
          const updated = [...new Set([...stored, ...newlyCompleted])];
          localStorage.setItem(COMPLETED_KEY, JSON.stringify(updated));

          const newMissions = newlyCompleted
            .map((id) => MISSIONS.find((m) => m.id === id))
            .filter((m): m is Mission => Boolean(m));

          rewardQueueRef.current = newMissions.slice(1);
          setRewardMission(newMissions[0] ?? null);

          if (newlyCompleted.includes("full_octave")) {
            onComposerUnlocked?.();
          }

          SFX.unlock();
        }
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
  }, [user, onComposerUnlocked]);

  const handleRewardClose = () => {
    const next = rewardQueueRef.current.shift() ?? null;
    setRewardMission(next);
    if (next) SFX.unlock();
  };

  if (loading)
    return <p className="status-text">Consultation du programme d'étude…</p>;

  const completed = progressList.filter((p) => p.completed).length;

  return (
    <>
      <div className="missions-panel">
        <SeasonBanner />
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

      {rewardMission && (
        <MissionRewardModal
          missionTitle={rewardMission.titre}
          missionDescription={rewardMission.description}
          badge={rewardMission.emoji}
          onClose={handleRewardClose}
        />
      )}
    </>
  );
}

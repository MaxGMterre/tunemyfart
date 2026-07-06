import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { AuthProvider, useAuth } from "./lib/useAuth";
import { Auth } from "./components/Auth";
import { Recorder } from "./components/Recorder";
import { Leaderboard } from "./components/Leaderboard";
import { Missions } from "./components/Missions";
import { Composer } from "./components/Composer";
import { Profile } from "./components/Profile";
import { WelcomeModal } from "./components/WelcomeModal";
import "./styles/tokens.css";
import "./components/Auth.css";
import "./components/Recorder.css";
import "./components/Leaderboard.css";
import "./components/Missions.css";
import "./components/ShareCard.css";
import "./components/Composer.css";
import "./components/Profile.css";
import "./components/WelcomeModal.css";

type Tab = "analyser" | "classement" | "missions" | "profil" | "composer";

const TABS: Tab[] = ["analyser", "classement", "missions", "profil", "composer"];

function AppShell() {
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("analyser");
  const [showWelcome, setShowWelcome] = useState(
    () => !localStorage.getItem("tmf_onboarding_v2")
  );

  const handleWelcomeClose = () => {
    localStorage.setItem("tmf_onboarding_v2", "true");
    setShowWelcome(false);
  };

  const tabIndex = TABS.indexOf(tab);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const next = TABS[tabIndex + 1];
      if (next) setTab(next);
    },
    onSwipedRight: () => {
      const prev = TABS[tabIndex - 1];
      if (prev) setTab(prev);
    },
    trackMouse: false,
    delta: 60,
    preventScrollOnSwipe: false,
  });

  if (loading) {
    return (
      <div className="app-shell" style={{ alignItems: "center", justifyContent: "center" }}>
        <p className="status-text">Chargement…</p>
      </div>
    );
  }

  if (!session) return <Auth />;

  return (
    <>
      <div className="app-shell">
        <header className="app-header">
          <h1 className="app-title">L'Anal-yser</h1>
          <p className="app-subtitle">Instrument de mesure acoustique — Tunemyfart</p>
        </header>

        <main className="panel-content" {...swipeHandlers}>
          {tab === "analyser"   && <Recorder />}
          {tab === "classement" && <Leaderboard />}
          {tab === "missions"   && <Missions />}
          {tab === "profil"     && <Profile />}
          {tab === "composer"   && <Composer />}
        </main>

        <nav className="tab-bar">
          <div
            className="tab-indicator-bar"
            style={{
              width: `${100 / TABS.length}%`,
              transform: `translateX(${tabIndex * 100}%)`,
            }}
          />
          <button className={tab === "analyser" ? "active" : ""} onClick={() => setTab("analyser")}>
            <span className="tab-emoji">🎙️</span>
            Analyser
          </button>
          <button className={tab === "classement" ? "active" : ""} onClick={() => setTab("classement")}>
            <span className="tab-emoji">🏆</span>
            Classement
          </button>
          <button className={tab === "missions" ? "active" : ""} onClick={() => setTab("missions")}>
            <span className="tab-emoji">🎯</span>
            Missions
          </button>
          <button className={tab === "profil" ? "active" : ""} onClick={() => setTab("profil")}>
            <span className="tab-emoji">👤</span>
            Profil
          </button>
          <button className={tab === "composer" ? "active" : ""} onClick={() => setTab("composer")}>
            <span className="tab-emoji">🎹</span>
            Composer
          </button>
        </nav>
      </div>

      {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

export default App;

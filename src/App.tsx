import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { AuthProvider, useAuth } from "./lib/useAuth";
import { useNetwork } from "./lib/useNetwork";
import { SCREEN_HEADERS, ONBOARDING_KEY } from "./lib/constants";
import { ToastProvider, useToast } from "./components/ui/Toast";
import { Auth } from "./components/Auth";
import { Recorder } from "./components/Recorder";
import { Leaderboard } from "./components/Leaderboard";
import { Missions } from "./components/Missions";
import { Composer } from "./components/Composer";
import { Profile } from "./components/Profile";
import { History } from "./components/History";
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
import "./components/History.css";
import "./components/Settings.css";

type Tab =
  | "analyser"
  | "classement"
  | "missions"
  | "profil"
  | "composer"
  | "corpus";

const TABS: Tab[] = [
  "analyser",
  "classement",
  "missions",
  "profil",
  "composer",
  "corpus",
];

const TAB_META: Record<Tab, { emoji: string; label: string }> = {
  analyser: { emoji: "🎙️", label: "Anal-yser" },
  classement: { emoji: "📊", label: "Registres" },
  missions: { emoji: "🎯", label: "Missions" },
  profil: { emoji: "🧑‍🔬", label: "Spécimen" },
  composer: { emoji: "🎹", label: "Clavier" },
  corpus: { emoji: "📜", label: "Corpus" },
};

function NetworkWatcher() {
  const isOnline = useNetwork();
  const { showToast } = useToast();
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (!isOnline)
      showToast("Connexion perdue — mode hors-ligne actif", "warning");
    else showToast("Connexion rétablie", "success");
  }, [isOnline, showToast]);

  return null;
}

function AppShell() {
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("analyser");
  const [showWelcome, setShowWelcome] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );

  const handleWelcomeClose = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
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

  const header = SCREEN_HEADERS[tab];

  if (loading) {
    return (
      <div
        className="app-shell"
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <p className="status-text">Initialisation du laboratoire…</p>
      </div>
    );
  }

  if (!session) return <Auth />;

  return (
    <>
      <NetworkWatcher />
      <div className="app-shell">
        <header className="app-header">
          <h1 className="app-title">{header.title}</h1>
          <p className="app-subtitle">{header.subtitle}</p>
        </header>

        <main className="panel-content" {...swipeHandlers}>
          {tab === "analyser" && <Recorder />}
          {tab === "classement" && <Leaderboard />}
          {tab === "missions" && <Missions />}
          {tab === "profil" && <Profile />}
          {tab === "composer" && <Composer />}
          {tab === "corpus" && (
            <History onTabChange={(t) => setTab(t as Tab)} />
          )}
        </main>

        <nav className="tab-bar" aria-label="Navigation principale">
          <div
            className="tab-indicator-bar"
            style={{
              width: `${100 / TABS.length}%`,
              transform: `translateX(${tabIndex * 100}%)`,
            }}
          />
          {TABS.map((t) => (
            <button
              key={t}
              className={tab === t ? "active" : ""}
              onClick={() => setTab(t)}
              aria-label={TAB_META[t].label}
              aria-current={tab === t ? "page" : undefined}
            >
              <span className="tab-emoji">{TAB_META[t].emoji}</span>
              {TAB_META[t].label}
            </button>
          ))}
        </nav>
      </div>

      {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;

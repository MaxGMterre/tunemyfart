import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
import { SplashScreen } from "./components/SplashScreen";
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

// ── Dark mode ─────────────────────────────────────────────────────────────────

export type ThemeMode = "system" | "light" | "dark";
const THEME_KEY = "tmf_theme";

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(
    () => (localStorage.getItem(THEME_KEY) as ThemeMode) ?? "system"
  );

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    localStorage.setItem(THEME_KEY, t);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────────

type Tab = "analyser" | "classement" | "missions" | "profil" | "composer";

const BASE_TABS: Tab[] = ["analyser", "classement", "missions", "profil"];

const TAB_META: Record<Tab, { emoji: string; label: string }> = {
  analyser: { emoji: "🎙️", label: "Anal-yser" },
  classement: { emoji: "📊", label: "Registres" },
  missions: { emoji: "🎯", label: "Missions" },
  profil: { emoji: "🧑‍🔬", label: "Spécimen" },
  composer: { emoji: "🎹", label: "Clavier" },
};

// ── Network watcher ────────────────────────────────────────────────────────────

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

// ── App shell ─────────────────────────────────────────────────────────────────

function AppShell() {
  const { session, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("analyser");
  const [showWelcome, setShowWelcome] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );
  // Unlock composer once full_octave mission is complete
  const [composerUnlocked, setComposerUnlocked] = useState(
    () => localStorage.getItem("tmf_composer_unlocked") === "true"
  );

  const TABS: Tab[] = composerUnlocked
    ? [...BASE_TABS, "composer"]
    : BASE_TABS;
  const tabIndex = TABS.indexOf(tab);

  const handleWelcomeClose = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowWelcome(false);
  };

  const handleComposerUnlock = () => {
    localStorage.setItem("tmf_composer_unlocked", "true");
    setComposerUnlocked(true);
  };

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

  const header = SCREEN_HEADERS[tab] ?? SCREEN_HEADERS.analyser;

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
          {tab === "missions" && (
            <Missions onComposerUnlocked={handleComposerUnlock} />
          )}
          {tab === "profil" && (
            <Profile onTabChange={(t) => setTab(t as Tab)} />
          )}
          {tab === "composer" && <Composer />}
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

// ── Splash wrapper ────────────────────────────────────────────────────────────

function AppWithSplash() {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem("tmf_splash_shown") === "true"
  );

  const handleSplashDone = () => {
    sessionStorage.setItem("tmf_splash_shown", "true");
    setSplashDone(true);
  };

  return (
    <>
      {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      <AppShell />
    </>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppWithSplash />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

import {
  createContext,
  lazy,
  Suspense,
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
import { Loading } from "./components/ui/Loading";
import { Auth } from "./components/Auth";
import { Recorder } from "./components/Recorder";
import { SplashScreen } from "./components/SplashScreen";
import { WelcomeModal } from "./components/WelcomeModal";
import { applyActiveTheme } from "./lib/themes";

// Lazy-loaded heavy panels
const Leaderboard = lazy(() => import("./components/Leaderboard").then((m) => ({ default: m.Leaderboard })));
const Missions = lazy(() => import("./components/Missions").then((m) => ({ default: m.Missions })));
const Composer = lazy(() => import("./components/Composer").then((m) => ({ default: m.Composer })));
const Profile = lazy(() => import("./components/Profile").then((m) => ({ default: m.Profile })));
const Duel = lazy(() => import("./components/Duel").then((m) => ({ default: m.Duel })));
const Feed = lazy(() => import("./components/Feed").then((m) => ({ default: m.Feed })));
const AdminDashboard = lazy(() => import("./components/AdminDashboard").then((m) => ({ default: m.AdminDashboard })));
import { TodayDashboard } from "./components/TodayDashboard";
import { GlobalSearch } from "./components/GlobalSearch";
import { Settings } from "./components/Settings";
import { track } from "./lib/analytics";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles/tokens.css";
import "./components/ui/Button.css";
import "./components/Auth.css";
import "./components/Recorder.css";
import "./components/Leaderboard.css";
import "./components/Missions.css";
import "./components/ShareCard.css";
import "./components/Composer.css";
import "./components/Studio.css";
import "./components/Profile.css";
import "./components/WelcomeModal.css";
import "./components/History.css";
import "./components/Settings.css";
import "./components/DailyChallenge.css";
import "./components/Friends.css";
import "./components/Shop.css";
import "./components/Duel.css";
import "./components/Feed.css";
import "./components/SeasonBanner.css";
import "./components/ErrorBoundary.css";
import "./components/AdminDashboard.css";
import "./components/FAQ.css";
import "./components/ui/Tooltip.css";
import "./components/ui/UIComponents.css";
import "./components/EmptyState.css";
import "./components/ArtifactCabinet.css";
import "./components/ThemePicker.css";
import "./components/WeaponArsenal.css";
import "./components/TodayDashboard.css";
import "./components/GlobalSearch.css";

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

type Tab = "analyser" | "classement" | "missions" | "profil" | "composer" | "duel" | "communauté" | "admin";

const BASE_TABS: Tab[] = ["analyser", "classement", "missions", "composer", "profil"];

// SVG tab icons defined inline — no emoji dependency
const TAB_SVGS: Record<Tab, React.ReactNode> = {
  analyser:   <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><ellipse cx="12" cy="8" rx="4" ry="5.5"/><line x1="10" y1="6" x2="14" y2="6"/><line x1="9.5" y1="8.5" x2="14.5" y2="8.5"/><line x1="10" y1="11" x2="14" y2="11"/><rect x="10.5" y="13.5" width="3" height="1.8" rx="0.5"/><path d="M9 15.5 Q12 17 15 15.5"/><path d="M15.5 16 Q18 17 18 21"/></svg>,
  classement: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 2 L16 2 L16 10 Q16 16 12 17 Q8 16 8 10 Z"/><path d="M8 5 Q5 5 5 8 Q5 12 8 12"/><path d="M16 5 Q19 5 19 8 Q19 12 16 12"/><line x1="12" y1="17" x2="12" y2="20"/><rect x="8" y="20" width="8" height="2" rx="1"/></svg>,
  missions:   <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M7 4 L17 4 Q19 4 19 6 L19 18 Q19 20 17 20 L7 20 Q5 20 5 18 L5 6 Q5 4 7 4 Z"/><ellipse cx="7" cy="5" rx="2" ry="1.5"/><ellipse cx="17" cy="5" rx="2" ry="1.5"/><line x1="9" y1="9.5" x2="15" y2="9.5"/><line x1="9" y1="12.5" x2="15" y2="12.5"/><line x1="9" y1="15.5" x2="13" y2="15.5"/></svg>,
  profil:     <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="7.5" r="3.5"/><path d="M5.5 21 C5.5 17 8 14.5 12 14.5 C16 14.5 18.5 17 18.5 21"/></svg>,
  composer:   <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="6" width="18" height="13" rx="1"/><line x1="7.5" y1="6" x2="7.5" y2="19"/><line x1="10" y1="6" x2="10" y2="19"/><line x1="12.5" y1="6" x2="12.5" y2="19"/><line x1="15" y1="6" x2="15" y2="19"/><rect x="5.5" y="6" width="2.5" height="7.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="10.5" y="6" width="2.5" height="7.5" rx="0.5" fill="currentColor" stroke="none"/><rect x="13" y="6" width="2.5" height="7.5" rx="0.5" fill="currentColor" stroke="none"/></svg>,
  communauté: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><path d="M3 21 C3 17 6 14.5 9 14.5 C12 14.5 15 17 15 21"/><path d="M13 14.8 C14 14.6 15.3 14.5 17 14.5 C20 14.5 21 16.5 21 19"/></svg>,
  duel:       <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 3 L6 9 L3 12 L6 15 L6 21"/><path d="M18 3 L18 9 L21 12 L18 15 L18 21"/><line x1="6" y1="12" x2="18" y2="12"/></svg>,
  admin:      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="9" x2="9" y2="21"/></svg>,
};

const TAB_META: Record<Tab, { label: string }> = {
  analyser:   { label: "Anal-yser" },
  classement: { label: "Registres" },
  missions:   { label: "Missions" },
  profil:     { label: "Spécimen" },
  composer:   { label: "Clavier" },
  communauté: { label: "Communauté" },
  duel:       { label: "Duels" },
  admin:      { label: "Admin" },
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
  const [analyserView, setAnalyserView] = useState<"dashboard" | "record">("dashboard");
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    track("app_open");
    applyActiveTheme();
  }, []);
  const [showWelcome, setShowWelcome] = useState(
    () => !localStorage.getItem(ONBOARDING_KEY)
  );
  const TABS: Tab[] = BASE_TABS;
  const tabIndex = TABS.indexOf(tab);

  const handleWelcomeClose = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowWelcome(false);
    track("onboarding_completed");
  };

  const handleComposerUnlock = () => {
    localStorage.setItem("tmf_composer_unlocked", "true");
  };

  // View Transitions API helper
  function navigateTo(newTab: Tab) {
    if ('startViewTransition' in document) {
      (document as any).startViewTransition(() => setTab(newTab));
    } else {
      setTab(newTab);
    }
  }

  // Track tab changes
  const handleTabChange = (t: Tab) => {
    navigateTo(t);
    track("tab_change", { tab: t });
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      const next = TABS[tabIndex + 1];
      if (next) navigateTo(next);
    },
    onSwipedRight: () => {
      const prev = TABS[tabIndex - 1];
      if (prev) navigateTo(prev);
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
          <div className="header-actions">
            <button className="search-toggle-btn" onClick={() => setSearchOpen(true)} aria-label="Recherche">🔍</button>
            <button className="search-toggle-btn" onClick={() => setSettingsOpen(true)} aria-label="Réglages">⚙️</button>
          </div>
        </header>

        <Suspense fallback={<Loading label="Chargement du laboratoire…" />}>
          <main className="panel-content" {...swipeHandlers}>
            {tab === "analyser" && analyserView === "dashboard" && (
              <TodayDashboard
                onGoToAnalyser={() => setAnalyserView("record")}
                onGoToMissions={() => { navigateTo("missions"); track("tab_change", { tab: "missions" }); }}
              />
            )}
            {tab === "analyser" && analyserView === "record" && (
              <>
                <button className="back-to-dashboard" onClick={() => setAnalyserView("dashboard")}>
                  ← Accueil
                </button>
                <Recorder />
              </>
            )}
            {tab === "classement" && <Leaderboard />}
            {tab === "missions" && (
              <Missions onComposerUnlocked={handleComposerUnlock} />
            )}
            {tab === "profil" && (
              <Profile onTabChange={(t) => navigateTo(t as Tab)} />
            )}
            {tab === "composer" && <Composer />}
            {tab === "communauté" && <Feed />}
            {tab === "duel" && <Duel />}
            {tab === "admin" && <AdminDashboard />}
          </main>
        </Suspense>

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
              onClick={() => handleTabChange(t)}
              aria-label={TAB_META[t].label}
              aria-current={tab === t ? "page" : undefined}
            >
              <span className="tab-icon">{TAB_SVGS[t]}</span>
              {TAB_META[t].label}
            </button>
          ))}
        </nav>
      </div>

      {showWelcome && <WelcomeModal onClose={handleWelcomeClose} />}
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
      {settingsOpen && <Settings onClose={() => setSettingsOpen(false)} />}
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

  const splashEnabled = localStorage.getItem("tmf_show_splash") !== "false";

  return (
    <>
      {!splashDone && splashEnabled && <SplashScreen onDone={handleSplashDone} />}
      <AppShell />
    </>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppWithSplash />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

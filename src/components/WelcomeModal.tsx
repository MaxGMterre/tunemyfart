import { useState } from "react";
import { useAuth } from "../lib/useAuth";

type Mode = "onboarding" | "auth";
type AuthTab = "signup" | "login";

interface Props {
  onClose: () => void;
}

const PAGES = [
  {
    logo: "🦨",
    title: "Bienvenue au Laboratoire",
    sub: "Instrument scientifique du phénomène gazeux",
    body: "Tunemyfart mesure, analyse et classe tes exploits acoustiques avec la rigueur d'un laboratoire des années 70.",
  },
  {
    logo: null,
    title: "Protocoles disponibles",
    sub: "Équipements du laboratoire",
    body: null,
    features: [
      {
        icon: "🎙️",
        label: "L'Anal-yser",
        desc: "Oscilloscope live, détection de note et mesure en dB SPL",
      },
      {
        icon: "📊",
        label: "Les Registres",
        desc: "Classements des confrères par intensité, durée, fréquence",
      },
      {
        icon: "🎹",
        label: "Le Clavier",
        desc: "Rejoue tes meilleurs relevés en séquence chromatique",
      },
    ],
  },
  {
    logo: "🔬",
    title: "Prêt à contribuer à la science ?",
    sub: "Crée un compte pour préserver ton corpus",
    body: "Ou continue sans compte — tu pourras t'inscrire depuis ta fiche spécimen.",
  },
];

export function WelcomeModal({ onClose }: Props) {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<Mode>("onboarding");
  const [page, setPage] = useState(0);
  const [authTab, setAuthTab] = useState<AuthTab>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleAuth = async () => {
    if (!email || !password) return;
    setError(null);
    setLoading(true);
    try {
      if (authTab === "login") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(dx) < 50) return;
    if (dx < 0 && page < PAGES.length - 1) setPage((p) => p + 1);
    if (dx > 0 && page > 0) setPage((p) => p - 1);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (mode === "auth") {
    return (
      <div className="welcome-overlay" onClick={handleOverlayClick}>
        <div className="welcome-modal">
          <button
            className="welcome-close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
          <button
            className="welcome-back"
            onClick={() => {
              setMode("onboarding");
              setError(null);
            }}
          >
            ← Retour
          </button>
          <div className="welcome-logo welcome-logo--sm">🦨</div>
          <div className="welcome-auth-tabs">
            <button
              className={authTab === "signup" ? "active" : ""}
              onClick={() => {
                setAuthTab("signup");
                setError(null);
              }}
            >
              Inscription
            </button>
            <button
              className={authTab === "login" ? "active" : ""}
              onClick={() => {
                setAuthTab("login");
                setError(null);
              }}
            >
              Connexion
            </button>
          </div>
          <div className="welcome-auth-form">
            <label className="welcome-field">
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                autoCapitalize="none"
                autoComplete="email"
              />
            </label>
            <label className="welcome-field">
              Mot de passe
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={
                  authTab === "login" ? "current-password" : "new-password"
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAuth();
                }}
              />
            </label>
            {error && <p className="welcome-error">{error}</p>}
            <button
              className="welcome-btn-primary"
              onClick={handleAuth}
              disabled={loading || !email || !password}
            >
              {loading
                ? "Identification…"
                : authTab === "login"
                ? "Accéder au laboratoire"
                : "Créer mon dossier"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPage = PAGES[page];

  return (
    <div className="welcome-overlay" onClick={handleOverlayClick}>
      <div
        className="welcome-modal"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button className="welcome-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>

        <div className="welcome-page" key={page}>
          {currentPage.logo && (
            <div className="welcome-logo">{currentPage.logo}</div>
          )}
          <h2 className="welcome-title">{currentPage.title}</h2>
          <p className="welcome-sub">{currentPage.sub}</p>
          {currentPage.body && (
            <p className="welcome-body">{currentPage.body}</p>
          )}
          {currentPage.features && (
            <div className="welcome-features">
              {currentPage.features.map((f) => (
                <div key={f.label} className="welcome-feature">
                  <span className="welcome-feature-icon">{f.icon}</span>
                  <div className="welcome-feature-text">
                    <strong>{f.label}</strong>
                    <span>{f.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination dots */}
        <div className="welcome-dots">
          {PAGES.map((_, i) => (
            <button
              key={i}
              className={`welcome-dot${i === page ? " active" : ""}`}
              onClick={() => setPage(i)}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation / CTA */}
        {page < PAGES.length - 1 ? (
          <button
            className="welcome-btn-primary"
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant →
          </button>
        ) : (
          <>
            <button
              className="welcome-btn-primary"
              onClick={() => setMode("auth")}
            >
              Ouvrir un dossier au laboratoire
            </button>
            <button className="welcome-btn-anon" onClick={onClose}>
              Entrer comme observateur →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

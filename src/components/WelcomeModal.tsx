import { useState } from "react";
import { useAuth } from "../lib/useAuth";
import {
  MrProut,
  MrProutExcited,
  MrProutThinking,
  MrProutWriting,
} from "../assets/characters";


type Mode = "onboarding" | "auth";
type AuthTab = "signup" | "login";

interface Props {
  onClose: () => void;
}

const PAGES = [
  {
    character: <MrProutExcited size={130} />,
    title: "Bienvenue au Laboratoire",
    sub: "Prof. Prout vous reçoit",
    body: "Je suis le Professeur Prout, et j'ai consacré ma vie à l'étude acoustique des phénomènes gazeux. Mon instrument va analyser, classifier et archiver chacun de tes spécimens avec la rigueur d'un vrai laboratoire.",
    cta: "Fascinant →",
  },
  {
    character: <MrProut size={130} />,
    character2: "🦨",
    title: "Mon assistant : Putois",
    sub: "Partenaire de terrain depuis 1987",
    body: "Putois détecte les émissions avec une précision olfactive hors du commun. Il te guidera pendant l'enregistrement et te soufflera des conseils scientifiques… à sa façon.",
    cta: "Je comprends →",
  },
  {
    character: <MrProutThinking size={130} />,
    title: "L'Anal-yser",
    sub: "Équipement principal du laboratoire",
    features: [
      { icon: "🎙️", label: "Oscilloscope live", desc: "Forme d'onde en temps réel" },
      { icon: "🎵", label: "Détection de note", desc: "Chromagramme et fréquence fondamentale" },
      { icon: "💥", label: "Mesure dB SPL", desc: "Intensité calibrée par rapport à -90 dB" },
      { icon: "📊", label: "Classements", desc: "Compare-toi aux confrères du monde entier" },
    ],
    cta: "Allons-y →",
  },
  {
    character: <MrProutWriting size={130} />,
    title: "Premier défi scientifique",
    sub: "Mission d'initiation du laboratoire",
    body: "Avant de contribuer aux registres mondiaux, tu dois réaliser ton premier enregistrement. Clique sur l'onglet 🎙️ et appuie sur le bouton rouge. La science attend.",
    cta: null, // last page — shows auth CTAs
  },
];

export function WelcomeModal({ onClose }: Props) {
  const { signInWithEmail, signUpWithEmail, signInAnonymously } = useAuth();
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

  const handleAnon = async () => {
    setLoading(true);
    try {
      await signInAnonymously();
      onClose();
    } catch {
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
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
          <button className="welcome-close" onClick={onClose} aria-label="Fermer">✕</button>
          <button className="welcome-back" onClick={() => { setMode("onboarding"); setError(null); }}>
            ← Retour
          </button>
          <div className="welcome-auth-character" aria-hidden="true">
            <MrProutWriting size={90} />
          </div>
          <div className="welcome-auth-tabs">
            <button className={authTab === "signup" ? "active" : ""} onClick={() => { setAuthTab("signup"); setError(null); }}>
              Inscription
            </button>
            <button className={authTab === "login" ? "active" : ""} onClick={() => { setAuthTab("login"); setError(null); }}>
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
                autoComplete={authTab === "login" ? "current-password" : "new-password"}
                onKeyDown={(e) => { if (e.key === "Enter") handleAuth(); }}
              />
            </label>
            {error && <p className="welcome-error">{error}</p>}
            <button
              className="welcome-btn-primary"
              onClick={handleAuth}
              disabled={loading || !email || !password}
            >
              {loading ? "Identification…" : authTab === "login" ? "Accéder au laboratoire" : "Créer mon dossier"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentPage = PAGES[page];
  const isLast = page === PAGES.length - 1;

  return (
    <div className="welcome-overlay" onClick={handleOverlayClick}>
      <div
        className="welcome-modal"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button className="welcome-close" onClick={onClose} aria-label="Fermer">✕</button>

        <div className="welcome-page" key={page}>
          <div className="welcome-character" aria-hidden="true">
            {currentPage.character}
            {currentPage.character2 && (
              <span className="welcome-character2">{currentPage.character2}</span>
            )}
          </div>
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

        {isLast ? (
          <>
            <button className="welcome-btn-primary" onClick={() => setMode("auth")}>
              Ouvrir un dossier au laboratoire
            </button>
            <button className="welcome-btn-anon" onClick={handleAnon} disabled={loading}>
              {loading ? "Connexion…" : "Entrer comme observateur →"}
            </button>
          </>
        ) : (
          <button className="welcome-btn-primary" onClick={() => setPage((p) => p + 1)}>
            {currentPage.cta ?? "Suivant →"}
          </button>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { useAuth } from "../lib/useAuth";

type Mode = "login" | "signup";

export function Auth() {
  const { signInWithEmail, signUpWithEmail, signInAnonymously } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") await signInWithEmail(email, password);
      else await signUpWithEmail(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Identification impossible — vérifiez vos coordonnées épistolaires.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnon = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAnonymously();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connexion anonyme impossible");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && email && password) handle();
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">🦨</div>
        <h1 className="auth-title">L'Anal-yser</h1>
        <p className="auth-subtitle">Instrument de mesure acoustique</p>

        <div className="auth-mode-tabs">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Connexion
          </button>
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => setMode("signup")}
          >
            Inscription
          </button>
        </div>

        <div className="auth-form">
          <label className="auth-field">
            <span>E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKey}
              placeholder="exemple@email.com"
              autoCapitalize="none"
              autoComplete="email"
            />
          </label>
          <label className="auth-field">
            <span>Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKey}
              placeholder="••••••••"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button
            className="auth-btn-primary"
            onClick={handle}
            disabled={loading || !email || !password}
          >
            {loading
              ? "…"
              : mode === "login"
              ? "Se connecter"
              : "Créer un compte"}
          </button>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <button
            className="auth-btn-anon"
            onClick={handleAnon}
            disabled={loading}
          >
            Continuer sans compte →
          </button>
        </div>
      </div>
    </div>
  );
}

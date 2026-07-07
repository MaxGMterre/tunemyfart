import { useState, useEffect } from "react";
import { useAuth } from "../lib/useAuth";
import { useToast } from "./ui/Toast";
import { useTheme } from "../App";
import type { ThemeMode } from "../App";
import { SOUNDS_PREF_KEY, HAPTICS_PREF_KEY } from "../lib/constants";
import { setAnalyticsEnabled, isAnalyticsEnabled } from "../lib/analytics";
import { submitFeedback } from "../lib/supabase";

interface Props {
  onClose: () => void;
}

export function Settings({ onClose }: Props) {
  const { user, signOut } = useAuth();
  const { showToast } = useToast();

  const [sounds, setSounds] = useState(
    () => localStorage.getItem(SOUNDS_PREF_KEY) !== "false"
  );
  const [haptics, setHaptics] = useState(
    () => localStorage.getItem(HAPTICS_PREF_KEY) !== "false"
  );
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [analytics, setAnalytics] = useState(() => isAnalyticsEnabled());
  const [showFeedback, setShowFeedback] = useState(false);
  const [fbType, setFbType] = useState<"bug" | "suggestion">("bug");
  const [fbDesc, setFbDesc] = useState("");
  const [fbSending, setFbSending] = useState(false);
  const { theme, setTheme } = useTheme();

  // Persist prefs immediately on change
  useEffect(() => {
    localStorage.setItem(SOUNDS_PREF_KEY, sounds ? "true" : "false");
  }, [sounds]);
  useEffect(() => {
    localStorage.setItem(HAPTICS_PREF_KEY, haptics ? "true" : "false");
  }, [haptics]);

  const handleAnalyticsToggle = (val: boolean) => {
    setAnalytics(val);
    setAnalyticsEnabled(val);
  };

  const handleSendFeedback = async () => {
    if (!fbDesc.trim()) return;
    setFbSending(true);
    try {
      await submitFeedback({ user_id: user?.id, type: fbType, description: fbDesc });
      showToast("Merci pour ton retour !", "success");
      setFbDesc("");
      setShowFeedback(false);
    } catch {
      showToast("Erreur d'envoi — réessaie plus tard", "error");
    } finally {
      setFbSending(false);
    }
  };

  const handleExportData = () => {
    const data = {
      exported_at: new Date().toISOString(),
      user_id: user?.id,
      email: user?.email,
      prefs: { sounds, haptics },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tunemyfart_data.json";
    a.click();
    URL.revokeObjectURL(url);
    showToast("Données exportées.", "success");
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div
      className="settings-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="settings-panel"
        role="dialog"
        aria-label="Paramètres du laboratoire"
      >
        <div className="settings-header">
          <h2 className="settings-title">Paramètres</h2>
          <button
            className="settings-close"
            onClick={onClose}
            aria-label="Fermer les paramètres"
          >
            ✕
          </button>
        </div>

        <div className="settings-body">
          {/* Compte */}
          <section className="settings-section">
            <div className="settings-section-title">Compte</div>
            <div className="settings-row">
              <span className="settings-row-label">Identifiant</span>
              <span className="settings-row-value">
                {user?.email ?? "Spécimen anonyme"}
              </span>
            </div>
            <button className="settings-link-btn" onClick={handleSignOut}>
              Se déconnecter
            </button>
          </section>

          {/* Expérience */}
          <section className="settings-section">
            <div className="settings-section-title">Expérience</div>
            <div className="settings-row settings-row--toggle">
              <div>
                <span className="settings-row-label">Sons d'interface</span>
                <span className="settings-row-hint">
                  Clics et bips du laboratoire
                </span>
              </div>
              <button
                className={`settings-toggle${sounds ? " on" : ""}`}
                onClick={() => setSounds((v) => !v)}
                role="switch"
                aria-checked={sounds}
                aria-label="Sons d'interface"
              >
                <span className="toggle-knob" />
              </button>
            </div>
            <div className="settings-row settings-row--toggle">
              <div>
                <span className="settings-row-label">Vibrations</span>
                <span className="settings-row-hint">
                  Retour haptique à l'enregistrement
                </span>
              </div>
              <button
                className={`settings-toggle${haptics ? " on" : ""}`}
                onClick={() => setHaptics((v) => !v)}
                role="switch"
                aria-checked={haptics}
                aria-label="Vibrations"
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </section>

          {/* Apparence */}
          <section className="settings-section">
            <div className="settings-section-title">Apparence</div>
            <div className="settings-row settings-row--theme">
              <span className="settings-row-label">Thème</span>
              <div className="settings-theme-buttons">
                {(["system", "light", "dark"] as ThemeMode[]).map((t) => (
                  <button
                    key={t}
                    className={`settings-theme-btn${theme === t ? " active" : ""}`}
                    onClick={() => setTheme(t)}
                    aria-pressed={theme === t}
                  >
                    {t === "system" ? "Auto" : t === "light" ? "Clair" : "Sombre"}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Analytics */}
          <section className="settings-section">
            <div className="settings-section-title">Analytics</div>
            <div className="settings-row settings-row--toggle">
              <div>
                <span className="settings-row-label">Données d'usage anonymes</span>
                <span className="settings-row-hint">
                  Aide à améliorer l'appli — aucune donnée personnelle
                </span>
              </div>
              <button
                className={`settings-toggle${analytics ? " on" : ""}`}
                onClick={() => handleAnalyticsToggle(!analytics)}
                role="switch"
                aria-checked={analytics}
                aria-label="Analytics"
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </section>

          {/* Confidentialité */}
          <section className="settings-section">
            <div className="settings-section-title">Confidentialité</div>
            <button className="settings-link-btn" onClick={handleExportData}>
              Exporter mes données (JSON)
            </button>
            <button
              className="settings-link-btn settings-link-btn--danger"
              onClick={() => setDeleteConfirm(true)}
            >
              Supprimer mon compte
            </button>
            {deleteConfirm && (
              <div className="settings-danger-confirm">
                <p>
                  Cette action est irréversible. Toutes les données du spécimen
                  seront perdues.
                </p>
                <div className="settings-danger-actions">
                  <button
                    className="settings-link-btn settings-link-btn--danger"
                    onClick={() => {
                      showToast(
                        "Contacte le support pour supprimer ton compte.",
                        "info"
                      );
                      setDeleteConfirm(false);
                    }}
                  >
                    Confirmer la suppression
                  </button>
                  <button
                    className="settings-link-btn"
                    onClick={() => setDeleteConfirm(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* À propos */}
          <section className="settings-section">
            <div className="settings-section-title">À propos</div>
            <div className="settings-row">
              <span className="settings-row-label">Version</span>
              <span className="settings-row-value settings-row-value--mono">
                v0.2.0
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-row-label">Laboratoire</span>
              <span className="settings-row-value">
                Tunemyfart Labs — MK.II
              </span>
            </div>
            <div className="settings-about-text">
              Instrument scientifique dédié à l'étude acoustique des phénomènes
              gazeux. Toutes les mesures sont effectuées dans un cadre
              expérimental sérieux.
            </div>
          </section>

          {/* Support */}
          <section className="settings-section">
            <div className="settings-section-title">Support</div>
            {!showFeedback ? (
              <>
                <button className="settings-link-btn" onClick={() => { setFbType("bug"); setShowFeedback(true); }}>
                  Signaler un bug
                </button>
                <button className="settings-link-btn" onClick={() => { setFbType("suggestion"); setShowFeedback(true); }}>
                  Suggérer une amélioration
                </button>
              </>
            ) : (
              <div className="settings-feedback-form">
                <div className="settings-fb-tabs">
                  <button className={fbType === "bug" ? "active" : ""} onClick={() => setFbType("bug")}>🐛 Bug</button>
                  <button className={fbType === "suggestion" ? "active" : ""} onClick={() => setFbType("suggestion")}>💡 Suggestion</button>
                </div>
                <textarea
                  className="settings-fb-textarea"
                  value={fbDesc}
                  onChange={(e) => setFbDesc(e.target.value)}
                  placeholder={fbType === "bug" ? "Décris le problème observé…" : "Décris ton idée d'amélioration…"}
                  rows={4}
                />
                <div className="settings-fb-actions">
                  <button
                    className="settings-link-btn"
                    onClick={handleSendFeedback}
                    disabled={fbSending || !fbDesc.trim()}
                  >
                    {fbSending ? "Envoi…" : "Envoyer"}
                  </button>
                  <button className="settings-link-btn" onClick={() => setShowFeedback(false)}>
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

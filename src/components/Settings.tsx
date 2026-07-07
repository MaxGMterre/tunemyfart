import React, { useState, useEffect } from "react";
import { useAuth } from "../lib/useAuth";
import { useToast } from "./ui/Toast";
import { useTheme } from "../App";
import type { ThemeMode } from "../App";
import { SOUNDS_PREF_KEY, HAPTICS_PREF_KEY } from "../lib/constants";
import { setAnalyticsEnabled, isAnalyticsEnabled } from "../lib/analytics";
import { submitFeedback, supabase } from "../lib/supabase";
import { getAmbientLevel, setAmbientLevel } from "../lib/ambientSound";
import { FAQ } from "./FAQ";
import { ThemePicker } from "./ThemePicker";
import "./FAQ.css";

function HealthCheck() {
  const [checks, setChecks] = React.useState<Record<string, boolean | null>>({
    supabase: null, auth: null, microphone: null, storage: null, network: null,
  });
  const [running, setRunning] = React.useState(false);

  const run = async () => {
    setRunning(true);
    setChecks({ supabase: null, auth: null, microphone: null, storage: null, network: null });
    // Network
    const network = navigator.onLine;
    // Supabase
    let sup = false;
    try { const { error } = await supabase.from("profiles").select("id").limit(1); sup = !error; } catch { sup = false; }
    // Auth
    let auth = false;
    try { const { data } = await supabase.auth.getSession(); auth = !!data.session; } catch { auth = false; }
    // Microphone
    let mic = false;
    try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach(t => t.stop()); mic = true; } catch { mic = false; }
    // Storage
    let storage = false;
    try { localStorage.setItem("_hc", "1"); localStorage.removeItem("_hc"); storage = true; } catch { storage = false; }
    setChecks({ supabase: sup, auth, microphone: mic, storage, network });
    setRunning(false);
  };

  const items: { key: string; label: string }[] = [
    { key: "network", label: "Connexion réseau" },
    { key: "supabase", label: "Base de données" },
    { key: "auth", label: "Session active" },
    { key: "microphone", label: "Microphone" },
    { key: "storage", label: "Stockage local" },
  ];

  return (
    <div className="health-check">
      <button className="hc-run-btn" onClick={run} disabled={running}>
        {running ? "Diagnostic en cours…" : "Lancer le diagnostic"}
      </button>
      {Object.values(checks).some(v => v !== null) && (
        <div className="hc-results">
          {items.map(({ key, label }) => {
            const v = checks[key];
            return (
              <div key={key} className="hc-item">
                <span className={`hc-dot hc-dot--${v === null ? "pending" : v ? "ok" : "fail"}`} />
                <span className="hc-label">{label}</span>
                <span className="hc-status">{v === null ? "—" : v ? "OK" : "Échec"}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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
  const [ambientLevel, setAmbientLevelState] = useState<"off" | "subtle" | "immersive">(
    () => getAmbientLevel()
  );
  const [showSplash, setShowSplash] = useState(
    () => localStorage.getItem("tmf_show_splash") !== "false"
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

  const handleAmbientChange = (level: "off" | "subtle" | "immersive") => {
    setAmbientLevel(level);
    setAmbientLevelState(level);
  };

  const handleSplashToggle = (v: boolean) => {
    setShowSplash(v);
    localStorage.setItem("tmf_show_splash", v ? "true" : "false");
    if (!v) sessionStorage.setItem("tmf_splash_shown", "1");
    else sessionStorage.removeItem("tmf_splash_shown");
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
          {/* Général */}
          <section className="settings-section">
            <div className="settings-section-title">Général</div>
            <div className="settings-row settings-row--toggle">
              <div>
                <span className="settings-row-label">Afficher l'intro cinématique</span>
                <span className="settings-row-hint">
                  Séquence d'ouverture au lancement
                </span>
              </div>
              <button
                className={`settings-toggle${showSplash ? " on" : ""}`}
                onClick={() => handleSplashToggle(!showSplash)}
                role="switch"
                aria-checked={showSplash}
                aria-label="Afficher l'intro cinématique"
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </section>

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
            <div className="settings-field">
              <span className="settings-label">Ambiance laboratoire</span>
              <div className="ambient-level-group">
                {(["off", "subtle", "immersive"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    className={`ambient-btn${ambientLevel === lvl ? " active" : ""}`}
                    onClick={() => handleAmbientChange(lvl)}
                  >
                    {{ off: "Silence", subtle: "Discret", immersive: "Immersif" }[lvl]}
                  </button>
                ))}
              </div>
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
            <div className="settings-item">
              <span className="settings-label">Thème du laboratoire</span>
            </div>
            <ThemePicker />
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

          {/* ── Diagnostic ── */}
          <section className="settings-section">
            <h3 className="settings-section-title">Diagnostic du laboratoire</h3>
            <HealthCheck />
          </section>

          {/* ── FAQ ── */}
          <section className="settings-section">
            <h3 className="settings-section-title">FAQ</h3>
            <FAQ />
          </section>
        </div>
      </div>
    </div>
  );
}

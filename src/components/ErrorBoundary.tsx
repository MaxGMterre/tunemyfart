import { Component, type ReactNode, type ErrorInfo } from "react";
import { supabase } from "../lib/supabase";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void supabase.from("client_logs").insert({
      level: "error",
      message: error.message,
      stack: error.stack?.slice(0, 1000) ?? null,
      component: info.componentStack?.split("\n")[1]?.trim() ?? null,
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString(),
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="error-boundary">
        <div className="error-boundary-inner">
          <div className="eb-illustration" aria-hidden="true">
            {/* Mr. Prout perplexe avec loupe — SVG inline */}
            <svg viewBox="0 0 120 140" width="120" height="140" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Corps */}
              <ellipse cx="60" cy="95" rx="28" ry="35" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5"/>
              {/* Tête */}
              <circle cx="60" cy="52" r="22" fill="#F5EDD6" stroke="#1B2A41" strokeWidth="1.5"/>
              {/* Yeux interrogatifs */}
              <circle cx="52" cy="48" r="3.5" fill="#1B2A41"/>
              <circle cx="68" cy="48" r="3.5" fill="#1B2A41"/>
              <circle cx="53" cy="47" r="1" fill="white"/>
              <circle cx="69" cy="47" r="1" fill="white"/>
              {/* Sourcils levés */}
              <path d="M 49 42 Q 52 39 55 42" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M 65 42 Q 68 39 71 42" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              {/* Bouche "?" */}
              <path d="M 55 58 Q 60 62 65 58" stroke="#1B2A41" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              {/* Queue putois */}
              <path d="M 60 130 Q 45 115 48 100 Q 55 88 60 130" fill="#1B2A41" stroke="#1B2A41" strokeWidth="1"/>
              <path d="M 60 130 Q 50 118 52 104 Q 56 95 60 130" fill="white" opacity="0.6"/>
              {/* Loupe */}
              <circle cx="85" cy="72" r="14" fill="rgba(212,234,240,0.3)" stroke="#C99A3D" strokeWidth="2.5"/>
              <circle cx="85" cy="72" r="10" fill="rgba(212,234,240,0.2)" stroke="#C99A3D" strokeWidth="1"/>
              <line x1="96" y1="83" x2="104" y2="91" stroke="#C99A3D" strokeWidth="3.5" strokeLinecap="round"/>
              {/* Bras tenant la loupe */}
              <path d="M 78 85 Q 82 78 85 72" stroke="#1B2A41" strokeWidth="2" strokeLinecap="round" fill="none"/>
              {/* ? dans la loupe */}
              <text x="82" y="77" fontFamily="serif" fontSize="12" fill="#1B2A41" fontWeight="bold">?</text>
            </svg>
          </div>
          <h2 className="eb-title">Anomalie détectée dans le laboratoire</h2>
          <p className="eb-message">
            {this.state.error?.message ?? "Erreur inattendue"}
          </p>
          <p className="eb-hint">L'incident a été consigné au registre des anomalies.</p>
          <div className="eb-actions">
            <button className="eb-btn eb-btn--primary" onClick={this.handleRetry}>
              Réessayer l'expérience
            </button>
            <button className="eb-btn eb-btn--ghost" onClick={() => window.location.reload()}>
              Recharger le laboratoire
            </button>
          </div>
        </div>
      </div>
    );
  }
}

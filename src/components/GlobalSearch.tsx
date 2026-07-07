import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

interface SearchResult {
  type: "user" | "recording" | "mission";
  id: string;
  title: string;
  subtitle: string;
}

interface GlobalSearchProps {
  onClose: () => void;
}

const HISTORY_KEY = "tmf_search_history";

function getHistory(): string[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); } catch { return []; }
}
function addHistory(q: string) {
  const h = [q, ...getHistory().filter((x) => x !== q)].slice(0, 5);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
}

export function GlobalSearch({ onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(getHistory);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const q = query.trim().toLowerCase();
      const found: SearchResult[] = [];

      // Cherche utilisateurs par pseudo
      const { data: users } = await supabase
        .from("profiles")
        .select("id, pseudo")
        .ilike("pseudo", `%${q}%`)
        .limit(5);
      (users ?? []).forEach((u: { id: string; pseudo: string }) => {
        found.push({ type: "user", id: u.id, title: u.pseudo, subtitle: "Chercheur" });
      });

      // Cherche relevés publics par note
      const { data: recs } = await supabase
        .from("recordings")
        .select("id, note_principale, db_max")
        .ilike("note_principale", `%${q}%`)
        .limit(5);
      (recs ?? []).forEach((r: { id: string; note_principale: string | null; db_max: number | null }) => {
        found.push({ type: "recording", id: r.id, title: r.note_principale ?? "—", subtitle: `${r.db_max?.toFixed(1) ?? "—"} dB` });
      });

      setResults(found);
      setLoading(false);
    }, 300);
  }, [query]);

  const handleSubmit = () => {
    if (query.trim()) { addHistory(query.trim()); setHistory(getHistory()); }
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  return (
    <div className="global-search-overlay" onClick={onClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="global-search-bar">
          <span className="global-search-icon">🔍</span>
          <input
            ref={inputRef}
            className="global-search-input"
            placeholder="Chercher un chercheur, une note…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); if (e.key === "Escape") onClose(); }}
          />
          <button className="global-search-close" onClick={onClose}>✕</button>
        </div>

        {query === "" && history.length > 0 && (
          <div className="global-search-history">
            <div className="search-section-title">
              Historique
              <button className="search-clear-btn" onClick={clearHistory}>Effacer</button>
            </div>
            {history.map((h, i) => (
              <button key={i} className="search-history-item" onClick={() => setQuery(h)}>{h}</button>
            ))}
          </div>
        )}

        {loading && <div className="global-search-loading">Recherche…</div>}

        {results.length > 0 && (
          <div className="global-search-results">
            {results.map((r) => (
              <div key={r.id} className={`search-result search-result--${r.type}`}>
                <span className="search-result-icon">
                  {{ user: "👤", recording: "🎙", mission: "📋" }[r.type]}
                </span>
                <div>
                  <div className="search-result-title">{r.title}</div>
                  <div className="search-result-sub">{r.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && query.trim() && results.length === 0 && (
          <div className="global-search-empty">Aucun résultat pour « {query} »</div>
        )}
      </div>
    </div>
  );
}

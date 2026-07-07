import { useState } from "react";
import { LAB_THEMES, getActiveTheme, setActiveTheme } from "../lib/themes";

export function ThemePicker() {
  const [activeId, setActiveId] = useState(() => getActiveTheme().id);

  const handleSelect = (themeId: string) => {
    // Pour l'instant tous les thèmes premium sont accessibles (pas de paywall)
    setActiveTheme(themeId);
    setActiveId(themeId);
  };

  return (
    <div className="theme-picker">
      <div className="theme-picker-grid">
        {LAB_THEMES.map((theme) => (
          <button
            key={theme.id}
            className={`theme-card${activeId === theme.id ? " selected" : ""}`}
            onClick={() => handleSelect(theme.id)}
            title={theme.description}
          >
            <div
              className="theme-card-preview"
              style={{
                background: theme.cssVars["--theme-table-bg"],
                "--accent": theme.cssVars["--theme-accent"],
              } as React.CSSProperties}
            >
              {/* Mini preview avec un carré accent */}
              <div
                className="theme-preview-accent"
                style={{ background: theme.cssVars["--theme-accent"] }}
              />
            </div>
            <div className="theme-card-name">{theme.name}</div>
            {theme.isPremium && (
              <span className="theme-badge-premium">Premium</span>
            )}
            {activeId === theme.id && (
              <span className="theme-check">✓</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

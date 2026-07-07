export interface LabTheme {
  id: string;
  name: string;
  description: string;
  unlockCondition: string | null;
  isPremium: boolean;
  cssVars: Record<string, string>;
}

export const LAB_THEMES: LabTheme[] = [
  {
    id: "default",
    name: "Bois clair",
    description: "Le laboratoire classique du Professeur Prout",
    unlockCondition: null,
    isPremium: false,
    cssVars: {
      "--theme-table-bg": "#c8a97a",
      "--theme-table-grain": "rgba(0,0,0,0.06)",
      "--theme-accent": "#C99A3D",
    },
  },
  {
    id: "oak",
    name: "Chêne foncé",
    description: "Le bureau d'un vétéran de la recherche",
    unlockCondition: "20 relevés",
    isPremium: false,
    cssVars: {
      "--theme-table-bg": "#6b4c2a",
      "--theme-table-grain": "rgba(0,0,0,0.1)",
      "--theme-accent": "#b8860b",
    },
  },
  {
    id: "marble",
    name: "Marbre impérial",
    description: "L'académie des sciences gazeuses",
    unlockCondition: "streak 7 jours",
    isPremium: false,
    cssVars: {
      "--theme-table-bg": "#c8c8c8",
      "--theme-table-grain": "rgba(100,100,100,0.08)",
      "--theme-accent": "#888",
    },
  },
  {
    id: "lab_metal",
    name: "Plateau métallique",
    description: "Laboratoire moderne acier inoxydable",
    unlockCondition: null,
    isPremium: true,
    cssVars: {
      "--theme-table-bg": "#7a8694",
      "--theme-table-grain": "rgba(255,255,255,0.05)",
      "--theme-accent": "#a0b4c8",
    },
  },
  {
    id: "night",
    name: "Laboratoire nocturne",
    description: "La nuit, tous les prouts sont noirs",
    unlockCondition: null,
    isPremium: true,
    cssVars: {
      "--theme-table-bg": "#1a1a2e",
      "--theme-table-grain": "rgba(255,255,255,0.03)",
      "--theme-accent": "#6c63ff",
    },
  },
  {
    id: "steampunk",
    name: "Steampunk",
    description: "Engrenages, vapeur et cuivre bruni",
    unlockCondition: null,
    isPremium: true,
    cssVars: {
      "--theme-table-bg": "#7a4e2a",
      "--theme-table-grain": "rgba(184,115,51,0.15)",
      "--theme-accent": "#B87333",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "Circuits néons et données qui pulsent",
    unlockCondition: null,
    isPremium: true,
    cssVars: {
      "--theme-table-bg": "#050510",
      "--theme-table-grain": "rgba(0,229,255,0.05)",
      "--theme-accent": "#00E5FF",
    },
  },
  {
    id: "empire",
    name: "Ancien Empire",
    description: "Marbre veiné, dorures et pourpre impérial",
    unlockCondition: null,
    isPremium: true,
    cssVars: {
      "--theme-table-bg": "#d4c5a9",
      "--theme-table-grain": "rgba(139,90,43,0.1)",
      "--theme-accent": "#8B5A2B",
    },
  },
  {
    id: "ocean",
    name: "Sous les Océans",
    description: "Hublot de sous-marin, profondeurs bleues",
    unlockCondition: null,
    isPremium: true,
    cssVars: {
      "--theme-table-bg": "#0a2040",
      "--theme-table-grain": "rgba(0,100,180,0.15)",
      "--theme-accent": "#0099CC",
    },
  },
  {
    id: "space",
    name: "Station Spatiale",
    description: "L'immensité cosmique, étoiles et silence",
    unlockCondition: null,
    isPremium: true,
    cssVars: {
      "--theme-table-bg": "#080814",
      "--theme-table-grain": "rgba(255,255,255,0.03)",
      "--theme-accent": "#C99A3D",
    },
  },
];

const THEME_PREF_KEY = "tmf_lab_theme";

export function getActiveTheme(): LabTheme {
  const id = localStorage.getItem(THEME_PREF_KEY) ?? "default";
  return LAB_THEMES.find((t) => t.id === id) ?? LAB_THEMES[0];
}

export function setActiveTheme(themeId: string) {
  localStorage.setItem(THEME_PREF_KEY, themeId);
  const theme = LAB_THEMES.find((t) => t.id === themeId);
  if (theme) {
    for (const [key, val] of Object.entries(theme.cssVars)) {
      document.documentElement.style.setProperty(key, val);
    }
  }
}

export function applyActiveTheme() {
  setActiveTheme(getActiveTheme().id);
}

export function getThemePreview(themeId: string): string {
  const theme = LAB_THEMES.find((t) => t.id === themeId);
  if (!theme) return "";
  const bg = theme.cssVars["--theme-table-bg"];
  const accent = theme.cssVars["--theme-accent"];
  const grain = theme.cssVars["--theme-table-grain"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="32" viewBox="0 0 48 32">
    <rect width="48" height="32" fill="${bg}" rx="4"/>
    <rect width="48" height="32" fill="${grain}" rx="4"/>
    <circle cx="24" cy="16" r="8" fill="${accent}" opacity="0.8"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

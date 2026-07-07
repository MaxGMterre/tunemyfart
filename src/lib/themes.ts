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

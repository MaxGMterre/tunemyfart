export const colors = {
  // Core
  ink: "#1B2A41",
  paper: "#F2ECE0",
  brass: "#C99A3D",
  coral: "#D9603B",
  // Ink scale
  ink100: "#E8ECF1", ink200: "#C8D0DA", ink300: "#A3B0BF",
  ink400: "#7D90A3", ink500: "#5A7189", ink600: "#3D5A73",
  ink700: "#2A4260", ink800: "#1B2A41", ink900: "#0F1C2D",
  // Paper scale
  paper50: "#FDFAF4", paper100: "#F8F2E4", paper200: "#F2ECE0",
  paper300: "#E8E0CC", paper400: "#DDD4B8",
  // Semantic
  sage: "#6B8F71", rust: "#9B3A2A", sky: "#7B9EB8",
  amber: "#E8A857", plum: "#6B4E71",
  mint: "#2ECC71", violet: "#9B59B6", blue: "#3498DB",
  // Dark variants
  dk: {
    ink: "#E8DFC8", paper: "#1A1610", paperDark: "#252018",
    brass: "#D4AA4A", coral: "#E06840",
    sage: "#7AB882", rust: "#C04A38", sky: "#8BB5CE",
    amber: "#F0BC6A", plum: "#8B6A91",
  },
} as const;

export const spacing = {
  px: "1px", 0.5: "0.125rem", 1: "0.25rem", 1.5: "0.375rem",
  2: "0.5rem", 2.5: "0.625rem", 3: "0.75rem", 3.5: "0.875rem",
  4: "1rem", 5: "1.25rem", 6: "1.5rem", 7: "1.75rem", 8: "2rem",
  10: "2.5rem", 12: "3rem", 16: "4rem", 20: "5rem",
} as const;

export const radius = {
  none: "0", sm: "2px", md: "4px", lg: "6px",
  xl: "10px", "2xl": "16px", full: "9999px",
} as const;

export const zIndex = {
  base: 0, raised: 10, overlay: 100, modal: 200, toast: 300,
} as const;

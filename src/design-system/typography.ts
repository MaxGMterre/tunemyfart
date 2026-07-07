export const fontFamily = {
  display: '"Fraunces", "Georgia", serif',
  mono: '"IBM Plex Mono", "Courier New", monospace',
  body: '"IBM Plex Sans", system-ui, sans-serif',
} as const;

export const fontSize = {
  xs: "0.52rem", sm: "0.65rem", base: "0.875rem", md: "1rem",
  lg: "1.1rem", xl: "1.25rem", "2xl": "1.5rem", "3xl": "1.8rem",
  "4xl": "2.25rem",
} as const;

export const fontWeight = {
  normal: 400, medium: 500, semibold: 600, bold: 700,
} as const;

export const lineHeight = {
  tight: 1.2, snug: 1.35, normal: 1.5, relaxed: 1.65,
} as const;

export const letterSpacing = {
  tight: "-0.01em", normal: "0", wide: "0.05em",
  wider: "0.08em", widest: "0.15em",
} as const;

export const duration = {
  instant: "0ms", fast: "120ms", normal: "200ms",
  medium: "300ms", slow: "400ms", slower: "600ms", crawl: "1000ms",
} as const;

export const easing = {
  linear: "linear",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const;

export const transition = {
  fast: `${duration.fast} ${easing.easeInOut}`,
  normal: `${duration.normal} ${easing.easeInOut}`,
  medium: `${duration.medium} ${easing.easeInOut}`,
  slow: `${duration.slow} ${easing.easeInOut}`,
  spring: `${duration.slow} ${easing.spring}`,
} as const;

// Stagger delays for cascade animations
export const stagger = (index: number, base = 50) => `${index * base}ms`;

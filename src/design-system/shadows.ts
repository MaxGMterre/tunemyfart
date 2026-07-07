// 6 shadow levels
export const shadow = {
  none: "none",
  subtle: "0 1px 2px rgba(27,42,65,0.05)",
  sm: "0 1px 3px rgba(27,42,65,0.07), 0 1px 2px rgba(27,42,65,0.04)",
  md: "0 4px 6px rgba(27,42,65,0.07), 0 2px 4px rgba(27,42,65,0.04)",
  lg: "0 10px 15px rgba(27,42,65,0.08), 0 4px 6px rgba(27,42,65,0.04)",
  xl: "0 20px 25px rgba(27,42,65,0.1), 0 10px 10px rgba(27,42,65,0.04)",
  dramatic: "0 25px 50px rgba(27,42,65,0.25)",
  // Inset variants
  insetSm: "inset 0 1px 2px rgba(27,42,65,0.06)",
  insetMd: "inset 0 2px 4px rgba(27,42,65,0.1)",
  // Glow variants
  brass: "0 0 12px rgba(201,154,61,0.3)",
  coral: "0 0 12px rgba(217,96,59,0.35)",
  phosphor: "0 0 8px rgba(57,255,20,0.4)",
} as const;

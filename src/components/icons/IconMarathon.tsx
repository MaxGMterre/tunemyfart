interface P { size?: number; color?: string; className?: string }
export function IconMarathon({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="16" cy="4" r="2"/>
      <path d="M14 8 L12 14 L7 17"/>
      <path d="M14 8 L17 13 L21 15"/>
      <path d="M12 14 L10 19 L8 22"/>
      <path d="M17 13 L16 18 L18 22"/>
    </svg>
  );
}

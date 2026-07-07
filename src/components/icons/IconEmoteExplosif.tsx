interface P { size?: number; color?: string; className?: string }
export function IconEmoteExplosif({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M8 14.5 Q10 12 12 14.5 Q14 12 16 14.5"/>
      <circle cx="9" cy="9.5" r="1.5" fill={color} stroke="none"/>
      <circle cx="15" cy="9.5" r="1.5" fill={color} stroke="none"/>
      <path d="M7 7 L8.5 8.5 M17 7 L15.5 8.5" strokeWidth="1.5"/>
    </svg>
  );
}

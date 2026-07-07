interface P { size?: number; color?: string; className?: string }
export function IconEmoteDiscret({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <line x1="9" y1="13.5" x2="15" y2="13.5"/>
      <line x1="8.5" y1="10" x2="11.5" y2="10"/>
      <line x1="12.5" y1="10" x2="15.5" y2="10"/>
    </svg>
  );
}

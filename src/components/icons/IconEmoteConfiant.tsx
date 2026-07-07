interface P { size?: number; color?: string; className?: string }
export function IconEmoteConfiant({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M8.5 14 Q12 17 15.5 14"/>
      <circle cx="9.5" cy="10" r="1.2" fill={color} stroke="none"/>
      <circle cx="14.5" cy="10" r="1.2" fill={color} stroke="none"/>
    </svg>
  );
}

interface P { size?: number; color?: string; className?: string }
export function IconEmoteShy({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M9 14 Q12 12 15 14"/>
      <circle cx="9.5" cy="10" r="1" fill={color} stroke="none"/>
      <circle cx="14.5" cy="10" r="1" fill={color} stroke="none"/>
      <path d="M8 8 Q9.5 6.5 11 8" strokeWidth="1.2"/>
      <path d="M13 8 Q14.5 6.5 16 8" strokeWidth="1.2"/>
    </svg>
  );
}

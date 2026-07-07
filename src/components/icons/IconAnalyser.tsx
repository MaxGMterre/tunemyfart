interface P { size?: number; color?: string; className?: string }
export function IconAnalyser({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <ellipse cx="12" cy="8" rx="4" ry="5.5"/>
      <line x1="10" y1="6" x2="14" y2="6"/>
      <line x1="9.5" y1="8.5" x2="14.5" y2="8.5"/>
      <line x1="10" y1="11" x2="14" y2="11"/>
      <rect x="10.5" y="13.5" width="3" height="1.8" rx="0.5"/>
      <path d="M9 15.5 Q12 17 15 15.5"/>
      <path d="M15.5 16 Q18 17 18 21"/>
    </svg>
  );
}

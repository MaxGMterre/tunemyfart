interface P { size?: number; color?: string; className?: string }
export function IconTrophy({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8 2 L16 2 L16 10 Q16 16 12 17 Q8 16 8 10 Z"/>
      <path d="M8 5 Q5 5 5 8 Q5 12 8 12"/>
      <path d="M16 5 Q19 5 19 8 Q19 12 16 12"/>
      <line x1="12" y1="17" x2="12" y2="20"/>
      <path d="M9 20 L15 20"/>
      <rect x="8" y="20" width="8" height="2" rx="1"/>
    </svg>
  );
}

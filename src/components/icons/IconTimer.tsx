interface P { size?: number; color?: string; className?: string }
export function IconTimer({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M8 2 L16 2"/>
      <path d="M8 22 L16 22"/>
      <path d="M8 2 Q5 2 5 5 Q5 10 12 12 Q5 14 5 19 Q5 22 8 22 L16 22 Q19 22 19 19 Q19 14 12 12 Q19 10 19 5 Q19 2 16 2 Z"/>
      <path d="M9 19.5 Q12 18 15 19.5" strokeWidth="1.5"/>
    </svg>
  );
}

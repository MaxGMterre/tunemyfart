interface P { size?: number; color?: string; className?: string }
export function IconMissions({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M7 4 L17 4 Q19 4 19 6 L19 18 Q19 20 17 20 L7 20 Q5 20 5 18 L5 6 Q5 4 7 4 Z"/>
      <ellipse cx="7" cy="5" rx="2" ry="1.5"/>
      <ellipse cx="17" cy="5" rx="2" ry="1.5"/>
      <line x1="9" y1="9.5" x2="15" y2="9.5"/>
      <line x1="9" y1="12.5" x2="15" y2="12.5"/>
      <line x1="9" y1="15.5" x2="13" y2="15.5"/>
      <circle cx="16" cy="17" r="1.5" strokeWidth="1.5"/>
    </svg>
  );
}

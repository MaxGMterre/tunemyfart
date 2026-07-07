interface P { size?: number; color?: string; className?: string }
export function IconRegistres({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 4 L12 2 L20 4 L20 19 L12 21 L4 19 Z"/>
      <line x1="12" y1="2" x2="12" y2="21"/>
      <line x1="7" y1="7" x2="10.5" y2="8"/>
      <line x1="7" y1="10.5" x2="10.5" y2="11.5"/>
      <line x1="7" y1="14" x2="10.5" y2="15"/>
      <line x1="13.5" y1="8" x2="17" y2="7"/>
      <line x1="13.5" y1="11.5" x2="17" y2="10.5"/>
      <line x1="13.5" y1="15" x2="17" y2="14"/>
    </svg>
  );
}

interface P { size?: number; color?: string; className?: string }
export function IconMelody({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {[7,10,13,16].map((y, i) => <line key={i} x1="3" y1={y} x2="21" y2={y} strokeWidth="1"/>)}
      <ellipse cx="8" cy="17" rx="2.2" ry="1.5" transform="rotate(-10 8 17)"/>
      <line x1="10.2" y1="16.5" x2="10.2" y2="7"/>
      <ellipse cx="15" cy="14" rx="2.2" ry="1.5" transform="rotate(-10 15 14)"/>
      <line x1="17.2" y1="13.5" x2="17.2" y2="7"/>
      <line x1="10.2" y1="7" x2="17.2" y2="7" strokeWidth="2.5"/>
    </svg>
  );
}

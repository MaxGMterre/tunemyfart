interface P { size?: number; color?: string; className?: string }
export function IconDelete({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6 L18 20 Q18 21 17 21 L7 21 Q6 21 6 20 L5 6"/>
      <path d="M9 6 L9 4 Q9 3 10 3 L14 3 Q15 3 15 4 L15 6"/>
      <line x1="10" y1="11" x2="10" y2="17"/>
      <line x1="14" y1="11" x2="14" y2="17"/>
    </svg>
  );
}

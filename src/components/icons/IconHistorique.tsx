interface P { size?: number; color?: string; className?: string }
export function IconHistorique({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 3 Q6 5.5 9 5.5 L15 5.5 Q18 5.5 18 8 L18 16 Q18 18.5 15 18.5 L9 18.5 Q6 18.5 6 21"/>
      <path d="M3 3 L6 3 M18 21 L21 21"/>
      <line x1="9" y1="9" x2="15" y2="9"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="15" x2="13" y2="15"/>
    </svg>
  );
}

interface P { size?: number; color?: string; className?: string }
export function IconUnlock({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="11" rx="2"/>
      <path d="M8 11 L8 7 Q8 3 12 3 Q16 3 16 7"/>
      <circle cx="12" cy="16" r="1.5" fill={color} stroke="none"/>
    </svg>
  );
}

interface P { size?: number; color?: string; className?: string }
export function IconCrown({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M3 18 L3 14 L7 8 L12 14 L17 6 L21 14 L21 18 Z"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
      <circle cx="7" cy="8" r="1.2" fill={color} stroke="none"/>
      <circle cx="12" cy="14" r="1.2" fill={color} stroke="none"/>
      <circle cx="17" cy="6" r="1.2" fill={color} stroke="none"/>
    </svg>
  );
}

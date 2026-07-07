interface P { size?: number; color?: string; className?: string }
export function IconBadge({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="13" r="7"/>
      <path d="M9 2 L12 6 L15 2"/>
      <path d="M8 2 L8 7"/>
      <path d="M16 2 L16 7"/>
      <path d="M10 11 L11.5 12.5 L14 9.5" strokeWidth="1.8"/>
    </svg>
  );
}

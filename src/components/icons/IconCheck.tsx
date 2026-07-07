interface P { size?: number; color?: string; className?: string }
export function IconCheck({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 13 L9 18 L20 7"/>
    </svg>
  );
}

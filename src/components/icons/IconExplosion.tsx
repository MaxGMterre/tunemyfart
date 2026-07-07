interface P { size?: number; color?: string; className?: string }
export function IconExplosion({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2 L13.5 8 L18 5 L15 10 L21 11 L16 13.5 L19 18 L13.5 16 L12 22 L10.5 16 L5 18 L8 13.5 L3 11 L9 10 L6 5 L10.5 8 Z"/>
    </svg>
  );
}

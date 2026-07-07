interface P { size?: number; color?: string; className?: string }
export function IconSilence({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <line x1="5.5" y1="5.5" x2="18.5" y2="18.5"/>
      <path d="M10 8 L10 16 M10 8 Q14 8 14 10 Q14 12 10 12" strokeWidth="1.8"/>
    </svg>
  );
}

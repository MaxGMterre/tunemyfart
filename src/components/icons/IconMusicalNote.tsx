interface P { size?: number; color?: string; className?: string }
export function IconMusicalNote({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <ellipse cx="8" cy="18" rx="3" ry="2" transform="rotate(-10 8 18)"/>
      <line x1="11" y1="17.2" x2="11" y2="5"/>
      <path d="M11 5 Q17 4 19 7 Q17 7.5 11 8"/>
    </svg>
  );
}

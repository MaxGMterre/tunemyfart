interface P { size?: number; color?: string; className?: string }
export function IconEmoteMajestueux({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M8.5 14 Q12 16.5 15.5 14"/>
      <path d="M8 9 L11 10" strokeWidth="1.8"/>
      <path d="M16 9 L13 10" strokeWidth="1.8"/>
      <circle cx="9.5" cy="10.5" r="1" fill={color} stroke="none"/>
      <circle cx="14.5" cy="10.5" r="1" fill={color} stroke="none"/>
      <path d="M10 6 L12 3 L14 6" strokeWidth="1.5"/>
    </svg>
  );
}

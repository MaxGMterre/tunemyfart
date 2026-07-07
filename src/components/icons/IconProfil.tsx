interface P { size?: number; color?: string; className?: string }
export function IconProfil({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="7.5" r="3.5"/>
      <path d="M5.5 21 C5.5 17 8 14.5 12 14.5 C16 14.5 18.5 17 18.5 21"/>
      <path d="M9.5 15 L10.5 18 L12 16.5 L13.5 18 L14.5 15"/>
      <path d="M9 7 Q9 5.5 10.5 5.5 L13.5 5.5 Q15 5.5 15 7"/>
    </svg>
  );
}

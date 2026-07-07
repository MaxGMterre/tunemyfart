interface P { size?: number; color?: string; className?: string }
export function IconMail({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="2"/>
      <path d="M3 7 L12 13 L21 7"/>
    </svg>
  );
}

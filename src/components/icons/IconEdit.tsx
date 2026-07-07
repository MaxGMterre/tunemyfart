interface P { size?: number; color?: string; className?: string }
export function IconEdit({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M17 3 Q19 3 20 5 Q21 7 19 8 L8 19 L4 20 L5 16 L16 5 Q17 4 17 3 Z"/>
      <path d="M15 5 L19 9"/>
      <path d="M17 3 Q16 4 16 5 Q19 5 19 8" strokeWidth="1"/>
    </svg>
  );
}

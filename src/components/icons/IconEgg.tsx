interface P { size?: number; color?: string; className?: string }
export function IconEgg({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2 Q18 4 18 13 Q18 20 12 22 Q6 20 6 13 Q6 4 12 2 Z"/>
    </svg>
  );
}

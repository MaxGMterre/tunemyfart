interface P { size?: number; color?: string; className?: string }
export function IconFire({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2 Q9 6 10 9 Q7 7 8 4 Q4 8 5 14 Q5 20 12 22 Q19 20 19 14 Q18 9 14 8 Q15 11 13 13 Q11 10 12 2 Z"/>
    </svg>
  );
}

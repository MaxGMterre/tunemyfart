interface P { size?: number; color?: string; className?: string }
export function IconBell({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2 Q12 4 14 5 Q18 6 18 12 L18 16 L20 18 L4 18 L6 16 L6 12 Q6 6 10 5 Q12 4 12 2"/>
      <path d="M9.5 18 Q9.5 21 12 21 Q14.5 21 14.5 18"/>
    </svg>
  );
}

interface P { size?: number; color?: string; className?: string }
export function IconThunder({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M13 2 L4 14 L11 14 L9 22 L20 10 L13 10 Z" strokeLinejoin="round"/>
    </svg>
  );
}

interface P { size?: number; color?: string; className?: string }
export function IconPlay({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M6 4 L20 12 L6 20 Z" fill={color} stroke="none"/>
    </svg>
  );
}

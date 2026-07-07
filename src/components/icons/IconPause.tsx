interface P { size?: number; color?: string; className?: string }
export function IconPause({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="6" y="4" width="4" height="16" rx="1" fill={color} stroke="none"/>
      <rect x="14" y="4" width="4" height="16" rx="1" fill={color} stroke="none"/>
    </svg>
  );
}

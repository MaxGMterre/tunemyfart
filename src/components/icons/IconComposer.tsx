interface P { size?: number; color?: string; className?: string }
export function IconComposer({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="6" width="18" height="13" rx="1"/>
      {[5,7.5,10,12.5,15,17.5].map((x, i) => (
        <line key={i} x1={x} y1="6" x2={x} y2="19"/>
      ))}
      <rect x="5.5" y="6" width="2.5" height="7.5" rx="0.5" fill={color} stroke="none"/>
      <rect x="10.5" y="6" width="2.5" height="7.5" rx="0.5" fill={color} stroke="none"/>
      <rect x="13" y="6" width="2.5" height="7.5" rx="0.5" fill={color} stroke="none"/>
      <rect x="17.5" y="6" width="2.5" height="7.5" rx="0.5" fill={color} stroke="none"/>
    </svg>
  );
}

interface P { size?: number; color?: string; className?: string }
export function IconShare({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 3 L12 15"/>
      <path d="M7 8 L12 3 L17 8"/>
      <path d="M5 13 L5 19 Q5 21 7 21 L17 21 Q19 21 19 19 L19 13"/>
    </svg>
  );
}

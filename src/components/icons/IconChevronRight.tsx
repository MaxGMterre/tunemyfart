interface P { size?: number; color?: string; className?: string }
export function IconChevronRight({ size = 24, color = "currentColor", className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 6 L15 12 L9 18"/>
    </svg>
  );
}

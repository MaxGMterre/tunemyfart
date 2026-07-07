import { useEffect, useRef } from "react";
import rough from "roughjs";
import "./SketchBorder.css";

interface Props {
  children: React.ReactNode;
  color?: string;
  roughness?: number;
  strokeWidth?: number;
  className?: string;
}

export function SketchBorder({ children, color = "#1D1D1F", roughness = 2, strokeWidth = 2.5, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    const w = wrapper.offsetWidth;
    const h = wrapper.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const rc = rough.canvas(canvas);
    rc.rectangle(4, 4, w - 8, h - 8, {
      stroke: color,
      strokeWidth,
      roughness,
      fill: "none",
    });
  }, [color, roughness, strokeWidth]);

  return (
    <div ref={wrapperRef} className={`sketch-border-wrapper ${className ?? ""}`} style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", inset: 0, pointerEvents: "none", width: "100%", height: "100%" }}
      />
      <div style={{ position: "relative" }}>{children}</div>
    </div>
  );
}

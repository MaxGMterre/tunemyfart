import { useState, useEffect } from "react";
import { shouldShowTooltip, dismissTooltip } from "../../lib/tooltips";

interface TooltipProps {
  id: string;
  text: string;
  position?: "top" | "bottom" | "left" | "right";
  children: React.ReactNode;
}

export function Tooltip({ id, text, position = "bottom", children }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shouldShowTooltip(id)) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, [id]);

  const dismiss = () => {
    setVisible(false);
    dismissTooltip(id);
  };

  return (
    <div className="tooltip-wrap" style={{ position: "relative", display: "inline-block" }}>
      {children}
      {visible && (
        <div className={`tooltip-bubble tooltip-bubble--${position}`} onClick={dismiss} role="tooltip">
          <span className="tooltip-text">{text}</span>
          <button className="tooltip-dismiss" aria-label="Fermer">×</button>
        </div>
      )}
    </div>
  );
}

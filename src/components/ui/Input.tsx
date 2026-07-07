import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

export function Input({ label, error, icon, className = "", ...props }: InputProps) {
  return (
    <div className={`ui-input-wrapper${error ? " has-error" : ""} ${className}`}>
      {label && <label className="ui-input-label">{label}</label>}
      <div className="ui-input-inner">
        {icon && <span className="ui-input-icon">{icon}</span>}
        <input className="ui-input" {...props} />
      </div>
      {error && <span className="ui-input-error">{error}</span>}
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <label className={`ui-toggle-label${disabled ? " disabled" : ""}`}>
      {label && <span className="ui-toggle-text">{label}</span>}
      <button
        role="switch"
        aria-checked={checked}
        className={`ui-toggle${checked ? " on" : " off"}`}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        type="button"
      >
        <span className="ui-toggle-thumb" />
        <span className="ui-toggle-state-label">{checked ? "ON" : "OFF"}</span>
      </button>
    </label>
  );
}

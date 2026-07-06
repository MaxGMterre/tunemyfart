import "./EmptyState.css";

interface Props {
  message?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({
  message = "Aucun relevé enregistré à ce jour",
  ctaLabel,
  onCta,
}: Props) {
  return (
    <div className="empty-state">
      <span className="empty-state-skunk" aria-hidden="true">
        🦨
      </span>
      <p className="empty-state-message">{message}</p>
      {ctaLabel && onCta && (
        <button className="empty-state-cta" onClick={onCta}>
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

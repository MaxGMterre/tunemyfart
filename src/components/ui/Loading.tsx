import "./Loading.css";

interface Props {
  label?: string;
}

export function Loading({ label = "Analyse acoustique en cours…" }: Props) {
  return (
    <div className="loading-wrap" role="status" aria-label={label}>
      <div className="loading-spinner" aria-hidden="true">
        <div className="spinner-blade" />
        <div className="spinner-blade" />
        <div className="spinner-blade" />
        <div className="spinner-blade" />
        <div className="spinner-blade" />
        <div className="spinner-blade" />
        <div className="spinner-blade" />
        <div className="spinner-blade" />
      </div>
      <p className="loading-label">{label}</p>
    </div>
  );
}

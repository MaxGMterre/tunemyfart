import "./Card.css";

interface Props {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "default" | "highlighted" | "empty";
  style?: React.CSSProperties;
  className?: string;
}

export function Card({
  title,
  subtitle,
  children,
  variant = "default",
  style,
  className,
}: Props) {
  return (
    <div
      className={`ui-card ui-card--${variant}${
        className ? " " + className : ""
      }`}
      style={style}
    >
      {(title || subtitle) && (
        <div className="ui-card-header">
          {title && <div className="ui-card-title">{title}</div>}
          {subtitle && <div className="ui-card-subtitle">{subtitle}</div>}
        </div>
      )}
      <div className="ui-card-body">{children}</div>
    </div>
  );
}

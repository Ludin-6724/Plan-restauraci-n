import { type CSSProperties, type ReactNode } from "react";

export function GlassCard({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article";
}) {
  return <Tag className={`glass-card ${className}`}>{children}</Tag>;
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-muted text-sm sm:text-base max-w-2xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  className = "",
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${className}`}
      /* color por CSS var: en Blanco ThemeEffect pone --on-primary en blanco */
      style={{ color: "var(--on-primary)", ...style }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`btn-secondary ${className}`}>
      {children}
    </button>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-muted">{label}</span>
      <textarea
        className="input-field min-h-[80px]"
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function TextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-muted">{label}</span>
      <input
        className="input-field"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return <p className="text-sm text-subtle italic">{children}</p>;
}

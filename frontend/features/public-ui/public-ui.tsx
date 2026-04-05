import type {
  ChangeEventHandler,
  InputHTMLAttributes,
  ReactNode,
  SVGProps
} from "react";
import styles from "./public-ui.module.css";

export type PublicBrandTone = "default" | "inverse";
export type PublicEyebrowTone = "brand" | "surface" | "inverse";
export type PublicActionTone = "primary" | "secondary" | "surface" | "inline";
export type PublicNoticeTone = "info" | "success" | "danger";

type PublicBrandProps = {
  readonly name: string;
  readonly label?: string;
  readonly mark?: string;
  readonly tone?: PublicBrandTone;
};

type PublicEyebrowProps = {
  readonly tone?: PublicEyebrowTone;
  readonly children: ReactNode;
};

type PublicSectionHeadingProps = {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly align?: "start" | "center";
};

type PublicActionProps = {
  readonly tone?: PublicActionTone;
  readonly children: ReactNode;
  readonly className?: string;
  readonly href?: string;
  readonly onClick?: () => void;
  readonly type?: "button" | "submit";
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
};

type PublicNoticeProps = {
  readonly tone?: PublicNoticeTone;
  readonly children: ReactNode;
};

type PublicStatProps = {
  readonly value: string;
  readonly label: string;
  readonly className?: string;
};

type PublicInputFieldProps = {
  readonly label: string;
  readonly id: string;
  readonly name: string;
  readonly type?: InputHTMLAttributes<HTMLInputElement>["type"];
  readonly autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  readonly value: string;
  readonly placeholder?: string;
  readonly onChange: ChangeEventHandler<HTMLInputElement>;
  readonly icon?: ReactNode;
};

export function PublicBrand({
  name,
  label,
  mark = "CA",
  tone = "default"
}: PublicBrandProps) {
  return (
    <div className={styles.brandCluster}>
      <div className={cx(styles.brandMark, tone === "inverse" && styles.brandMarkInverse)}>
        {mark}
      </div>
      <div>
        <div className={cx(styles.brandName, tone === "inverse" && styles.brandNameInverse)}>
          {name}
        </div>
        {label ? (
          <div
            className={cx(
              styles.brandLabel,
              tone === "inverse" && styles.brandLabelInverse
            )}
          >
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function PublicEyebrow({
  tone = "brand",
  children
}: PublicEyebrowProps) {
  return <span className={cx(styles.eyebrow, eyebrowClassName(tone))}>{children}</span>;
}

export function PublicSectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "start"
}: PublicSectionHeadingProps) {
  return (
    <div
      className={cx(
        styles.sectionHeading,
        align === "center" && styles.sectionHeadingCenter
      )}
    >
      <div className={styles.sectionHeadingBody}>
        {eyebrow ? <PublicEyebrow>{eyebrow}</PublicEyebrow> : null}
        <h2 className={styles.sectionTitle}>{title}</h2>
        {description ? <p className={styles.sectionDescription}>{description}</p> : null}
      </div>
      {action ? <div className={styles.sectionAction}>{action}</div> : null}
    </div>
  );
}

export function PublicAction({
  tone = "primary",
  children,
  className,
  href,
  onClick,
  type = "button",
  disabled = false,
  ariaLabel
}: PublicActionProps) {
  const resolvedClassName = cx(styles.actionBase, actionClassName(tone), className);

  if (href) {
    return (
      <a
        aria-disabled={disabled ? "true" : undefined}
        aria-label={ariaLabel}
        className={resolvedClassName}
        href={disabled ? undefined : href}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      aria-label={ariaLabel}
      className={resolvedClassName}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

export function PublicNotice({
  tone = "info",
  children
}: PublicNoticeProps) {
  return <div className={cx(styles.notice, noticeClassName(tone))}>{children}</div>;
}

export function PublicStat({ value, label, className }: PublicStatProps) {
  return (
    <div className={cx(styles.statCard, className)}>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  );
}

export function PublicInputField({
  label,
  id,
  name,
  type = "text",
  autoComplete,
  value,
  placeholder,
  onChange,
  icon
}: PublicInputFieldProps) {
  return (
    <label className={styles.field} htmlFor={id}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.fieldShell}>
        {icon ? <span className={styles.fieldIcon}>{icon}</span> : null}
        <input
          autoComplete={autoComplete}
          className={styles.fieldInput}
          id={id}
          name={name}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          value={value}
        />
      </div>
    </label>
  );
}

export function ArrowRightGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export function SearchGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function EmergencyGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M12 4v16" />
      <path d="M4 12h16" />
      <circle cx="12" cy="12" r="8.5" />
    </svg>
  );
}

export function MapPinGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M12 21s-6-5.45-6-11a6 6 0 1 1 12 0c0 5.55-6 11-6 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function DepartmentGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M4.5 20V7.5L12 3l7.5 4.5V20" />
      <path d="M9 20v-5h6v5" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
    </svg>
  );
}

export function CalendarGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="15" rx="2" width="17" x="3.5" y="5" />
      <path d="M7 3.5v3" />
      <path d="M17 3.5v3" />
      <path d="M3.5 9h17" />
    </svg>
  );
}

export function MailGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function LockGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="11" rx="2" width="14" x="5" y="10" />
      <path d="M8 10V7.5a4 4 0 1 1 8 0V10" />
    </svg>
  );
}

export function ShieldGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M12 3 5 6v5c0 5 3.4 8.7 7 10 3.6-1.3 7-5 7-10V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.5-3.6" />
    </svg>
  );
}

export function PulseGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M3 12h4l2-4 4 8 2-4h6" />
    </svg>
  );
}

function eyebrowClassName(tone: PublicEyebrowTone) {
  switch (tone) {
    case "brand":
      return styles.eyebrowBrand;
    case "surface":
      return styles.eyebrowSurface;
    case "inverse":
      return styles.eyebrowInverse;
  }
}

function actionClassName(tone: PublicActionTone) {
  switch (tone) {
    case "primary":
      return styles.actionPrimary;
    case "secondary":
      return styles.actionSecondary;
    case "surface":
      return styles.actionSurface;
    case "inline":
      return styles.actionInline;
  }
}

function noticeClassName(tone: PublicNoticeTone) {
  switch (tone) {
    case "info":
      return styles.noticeInfo;
    case "success":
      return styles.noticeSuccess;
    case "danger":
      return styles.noticeDanger;
  }
}

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

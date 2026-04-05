import type { ReactNode, SVGProps } from "react";
import styles from "./workspace-ui.module.css";

export type WorkspaceNavItem = {
  readonly label: string;
  readonly href: string;
  readonly active?: boolean;
  readonly icon?: ReactNode;
  readonly badge?: string;
};

export type WorkspaceBadgeTone =
  | "cyan"
  | "green"
  | "amber"
  | "red"
  | "slate"
  | "navy";

export type WorkspaceActionTone =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "ghost";

export type WorkspaceMetricAccent =
  | "cyan"
  | "green"
  | "amber"
  | "red"
  | "slate";

type WorkspaceShellProps = {
  readonly brand: string;
  readonly brandMark?: string;
  readonly screenLabel: string;
  readonly meta: string;
  readonly navItems: readonly WorkspaceNavItem[];
  readonly userName: string;
  readonly userRole: string;
  readonly sidebarFooter?: ReactNode;
  readonly topbarLead?: ReactNode;
  readonly topbarActions?: ReactNode;
  readonly footer?: ReactNode;
  readonly children: ReactNode;
};

type WorkspacePageIntroProps = {
  readonly eyebrow: string;
  readonly title: string;
  readonly summary: string;
  readonly aside?: ReactNode;
};

type WorkspacePanelProps = {
  readonly eyebrow?: string;
  readonly title: string;
  readonly aside?: ReactNode;
  readonly children: ReactNode;
};

type WorkspaceMetricCardProps = {
  readonly accent: WorkspaceMetricAccent;
  readonly label: string;
  readonly value: string;
  readonly description?: string;
};

type WorkspaceBadgeProps = {
  readonly tone?: WorkspaceBadgeTone;
  readonly children: ReactNode;
};

type WorkspaceActionProps = {
  readonly tone?: WorkspaceActionTone;
  readonly children: ReactNode;
  readonly href?: string;
  readonly onClick?: () => void;
  readonly type?: "button" | "submit";
  readonly disabled?: boolean;
  readonly ariaLabel?: string;
};

export function WorkspaceShell({
  brand,
  brandMark = "CA",
  screenLabel,
  meta,
  navItems,
  userName,
  userRole,
  sidebarFooter,
  topbarLead,
  topbarActions,
  footer,
  children
}: WorkspaceShellProps) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brandCluster}>
          <div className={styles.brandMark} aria-hidden="true">
            {brandMark}
          </div>
          <div>
            <div className={styles.brandName}>{brand}</div>
            <div className={styles.screenLabel}>{screenLabel}</div>
          </div>
        </div>

        <nav className={styles.nav} aria-label={`${screenLabel} navigation`}>
          {navItems.map((item) => (
            <a
              key={`${item.href}-${item.label}`}
              className={item.active ? styles.navItemActive : styles.navItem}
              href={item.href}
            >
              {item.icon ? <span className={styles.navIcon}>{item.icon}</span> : null}
              <span>{item.label}</span>
              {item.badge ? <span className={styles.navBadge}>{item.badge}</span> : null}
            </a>
          ))}
        </nav>

        {sidebarFooter ? (
          <div className={styles.sidebarFooter}>{sidebarFooter}</div>
        ) : null}
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.topbarLead}>
            <div className={styles.meta}>{meta}</div>
            {topbarLead}
          </div>
          <div className={styles.topbarActions}>
            {topbarActions}
            <div className={styles.userChip}>
              <div className={styles.userAvatar} aria-hidden="true">
                {toInitials(userName)}
              </div>
              <div>
                <div className={styles.userName}>{userName}</div>
                <div className={styles.userRole}>{userRole}</div>
              </div>
            </div>
          </div>
        </header>

        <div className={styles.content}>{children}</div>

        <footer className={styles.footer}>
          {footer ?? (
            <>
              <span>{brand}</span>
              <span>Clinical workflows · Accessible operations · Clear handoffs</span>
            </>
          )}
        </footer>
      </main>
    </div>
  );
}

export function WorkspacePageIntro({
  eyebrow,
  title,
  summary,
  aside
}: WorkspacePageIntroProps) {
  return (
    <section className={styles.pageIntro}>
      <div className={styles.pageIntroBody}>
        <div className={styles.pageEyebrow}>{eyebrow}</div>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageSummary}>{summary}</p>
      </div>
      {aside ? <div className={styles.pageIntroAside}>{aside}</div> : null}
    </section>
  );
}

export function WorkspacePanel({
  eyebrow,
  title,
  aside,
  children
}: WorkspacePanelProps) {
  return (
    <section className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          {eyebrow ? <div className={styles.panelEyebrow}>{eyebrow}</div> : null}
          <h2 className={styles.panelTitle}>{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function WorkspaceMetricGrid({ children }: { readonly children: ReactNode }) {
  return <section className={styles.metricGrid}>{children}</section>;
}

export function WorkspaceMetricCard({
  accent,
  label,
  value,
  description
}: WorkspaceMetricCardProps) {
  return (
    <article className={styles.metricCard}>
      <div className={cx(styles.metricAccent, metricAccentClassName(accent))} />
      <div className={styles.metricValue}>{value}</div>
      <div className={styles.metricLabel}>{label}</div>
      {description ? <div className={styles.metricDescription}>{description}</div> : null}
    </article>
  );
}

export function WorkspaceBadge({
  tone = "slate",
  children
}: WorkspaceBadgeProps) {
  return <span className={cx(styles.badge, badgeClassName(tone))}>{children}</span>;
}

export function WorkspaceAction({
  tone = "secondary",
  children,
  href,
  onClick,
  type = "button",
  disabled = false,
  ariaLabel
}: WorkspaceActionProps) {
  const className = cx(styles.actionBase, actionClassName(tone));

  if (href) {
    return (
      <a
        aria-disabled={disabled ? "true" : undefined}
        aria-label={ariaLabel}
        className={className}
        href={disabled ? undefined : href}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      aria-label={ariaLabel}
      className={className}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
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

export function HomeGlyph(props: SVGProps<SVGSVGElement>) {
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
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20h13V9.5" />
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

export function ClipboardGlyph(props: SVGProps<SVGSVGElement>) {
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
      <rect height="17" rx="2" width="14" x="5" y="4" />
      <path d="M9 4.5h6v3H9z" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </svg>
  );
}

export function SparkGlyph(props: SVGProps<SVGSVGElement>) {
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
      <path d="m12 3 1.8 4.7L18.5 9l-4.7 1.3L12 15l-1.8-4.7L5.5 9l4.7-1.3Z" />
      <path d="M19 15.5 20 18l2.5 1-2.5 1L19 22.5l-1-2.5-2.5-1 2.5-1Z" />
    </svg>
  );
}

export function LogoutGlyph(props: SVGProps<SVGSVGElement>) {
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
      <path d="M9 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function metricAccentClassName(accent: WorkspaceMetricAccent) {
  switch (accent) {
    case "cyan":
      return styles.metricAccentCyan;
    case "green":
      return styles.metricAccentGreen;
    case "amber":
      return styles.metricAccentAmber;
    case "red":
      return styles.metricAccentRed;
    case "slate":
      return styles.metricAccentSlate;
  }
}

function badgeClassName(tone: WorkspaceBadgeTone) {
  switch (tone) {
    case "cyan":
      return styles.badgeCyan;
    case "green":
      return styles.badgeGreen;
    case "amber":
      return styles.badgeAmber;
    case "red":
      return styles.badgeRed;
    case "navy":
      return styles.badgeNavy;
    case "slate":
      return styles.badgeSlate;
  }
}

function actionClassName(tone: WorkspaceActionTone) {
  switch (tone) {
    case "primary":
      return styles.actionPrimary;
    case "secondary":
      return styles.actionSecondary;
    case "success":
      return styles.actionSuccess;
    case "danger":
      return styles.actionDanger;
    case "ghost":
      return styles.actionGhost;
  }
}

function toInitials(fullName: string) {
  return fullName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function cx(...classNames: Array<string | false | null | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./patient-portal-ui.module.css";

export type PatientPortalNavItem = {
  readonly href: string;
  readonly label: string;
  readonly active?: boolean;
};

export function PatientPortalShell({
  children,
  navItems,
  subtitle,
  title,
  topbarAction
}: {
  readonly children: ReactNode;
  readonly navItems: readonly PatientPortalNavItem[];
  readonly subtitle: string;
  readonly title: string;
  readonly topbarAction?: ReactNode;
}) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>{subtitle}</div>
          <h1 className={styles.title}>{title}</h1>
        </div>
        {topbarAction}
      </header>
      <nav className={styles.nav} aria-label="Patient portal navigation">
        {navItems.map((item) => (
          <Link
            key={item.href}
            className={item.active ? styles.navItemActive : styles.navItem}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <main className={styles.content}>{children}</main>
    </div>
  );
}

export function PatientPortalCard({
  children,
  title,
  eyebrow
}: {
  readonly children: ReactNode;
  readonly title: string;
  readonly eyebrow?: string;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        {eyebrow ? <div className={styles.cardEyebrow}>{eyebrow}</div> : null}
        <h2 className={styles.cardTitle}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

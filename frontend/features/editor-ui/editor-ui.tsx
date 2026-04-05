import type { ReactNode } from "react";
import styles from "./editor-ui.module.css";

type EditorShellProps = {
  readonly children: ReactNode;
  readonly header: ReactNode;
  readonly sidebar: ReactNode;
};

export function EditorShell({ children, header, sidebar }: EditorShellProps) {
  return (
    <div className={styles.shell}>
      <header className={styles.header}>{header}</header>
      <div className={styles.body}>
        <main className={styles.canvas}>{children}</main>
        <aside className={styles.sidebar}>{sidebar}</aside>
      </div>
    </div>
  );
}

export function EditorCard({
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
        {eyebrow ? <div className={styles.eyebrow}>{eyebrow}</div> : null}
        <h2 className={styles.title}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

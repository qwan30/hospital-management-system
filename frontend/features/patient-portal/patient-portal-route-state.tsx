import styles from "./patient-portal-screen.module.css";

export function PatientPortalRouteState({
  title,
  description
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className={styles.stateShell}>
      <div className={styles.stateCard}>
        <div className={styles.stateEyebrow}>Patient portal</div>
        <h1 className={styles.stateTitle}>{title}</h1>
        <p className={styles.stateText}>{description}</p>
      </div>
    </div>
  );
}

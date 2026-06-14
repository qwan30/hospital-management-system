import Link from "next/link";

interface PortalMetric {
  label: string;
  value: string;
  detail: string;
  tone?: "primary" | "neutral" | "warning";
}

interface PortalRow {
  title: string;
  eyebrow: string;
  detail: string;
  status: string;
}

interface PortalSectionPageProps {
  eyebrow: string;
  title: string;
  description: string;
  metrics: PortalMetric[];
  rows: PortalRow[];
  primaryAction?: {
    label: string;
    href: string;
  };
  secondaryPanel?: {
    title: string;
    body: string;
    metadata: string;
  };
}

const toneClasses = {
  primary: "bg-primary-container text-white",
  neutral: "bg-surface-container-highest text-on-surface",
  warning: "bg-error-container text-on-error-container",
};

export function PortalSectionPage({
  eyebrow,
  title,
  description,
  metrics,
  rows,
  primaryAction,
  secondaryPanel,
}: PortalSectionPageProps) {
  return (
    <main>
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 border-b border-outline-variant/20 pb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary mb-3">
                {eyebrow}
              </p>
              <h1 className="text-4xl font-light tracking-tight text-on-surface">
                {title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-on-surface-variant">
                {description}
              </p>
            </div>
            {primaryAction ? (
              <Link
                href={primaryAction.href}
                className="inline-flex h-12 items-center justify-center bg-primary-container px-6 text-sm font-bold text-white transition-colors hover:bg-primary"
              >
                {primaryAction.label}
              </Link>
            ) : null}
          </div>
        </header>

        <section className="grid grid-cols-1 gap-px bg-outline-variant/20 md:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`p-8 ${toneClasses[metric.tone ?? "neutral"]}`}
            >
              <p className="mb-6 text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">
                {metric.label}
              </p>
              <div className="text-5xl font-light tracking-tight">
                {metric.value}
              </div>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-widest opacity-75">
                {metric.detail}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-on-surface">
                Current Items
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-outline">
                Patient visible
              </span>
            </div>
            <div className="space-y-3">
              {rows.map((row) => (
                <article
                  key={`${row.eyebrow}-${row.title}`}
                  className="bg-surface-container-low p-6 transition-colors hover:bg-surface-container-lowest"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-outline">
                        {row.eyebrow}
                      </p>
                      <h3 className="text-lg font-semibold text-on-surface">
                        {row.title}
                      </h3>
                      <p className="mt-1 text-sm text-on-surface-variant">
                        {row.detail}
                      </p>
                    </div>
                    <span className="w-fit bg-surface-container-high px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                      {row.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {secondaryPanel ? (
            <aside className="bg-on-surface p-8 text-white">
              <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.22em] opacity-60">
                {secondaryPanel.metadata}
              </p>
              <h2 className="mb-4 text-2xl font-light tracking-tight">
                {secondaryPanel.title}
              </h2>
              <p className="text-sm leading-6 opacity-80">{secondaryPanel.body}</p>
            </aside>
          ) : null}
        </section>
      </div>
    </main>
  );
}

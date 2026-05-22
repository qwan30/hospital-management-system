"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listPatientPortalLabResults,
  type PatientPortalLabResultResponse,
} from "@/lib/operations-api";

import { HcIcon } from "@/components/ui/hc-icon";
import { PageHeader } from "@/components/ui/page-header";
import { KpiCard } from "@/components/ui/kpi-card";
import { AlertTriangle, Hourglass, Paperclip, FlaskConical } from "lucide-react";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusBadge(status: string) {
  const normalized = status.toUpperCase();
  if (normalized.includes("CRITICAL") || normalized.includes("ABNORMAL")) {
    return "bg-[var(--hc-danger-bg)] text-[var(--hc-danger)] border-[var(--hc-danger)]";
  }
  if (normalized.includes("PENDING") || normalized.includes("PROCESS")) {
    return "bg-[var(--hc-surface-soft)] text-[var(--hc-text-secondary)] border-[var(--hc-border)]";
  }
  return "bg-[var(--hc-primary-bg)] text-[var(--hc-primary)] border-[var(--hc-primary)]";
}

export default function PatientLabResultsPage() {
  const [labResults, setLabResults] = useState<PatientPortalLabResultResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    listPatientPortalLabResults()
      .then((results) => {
        if (isMounted) {
          setLabResults(results);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setLabResults([]);
          setError(loadError instanceof Error ? loadError.message : "Unable to load lab results.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const summary = useMemo(
    () => ({
      total: labResults.length,
      pending: labResults.filter((result) =>
        result.status.toUpperCase().includes("PENDING"),
      ).length,
      withAttachments: labResults.filter((result) => Boolean(result.attachmentUrl)).length,
      needsReview: labResults.filter((result) => {
        const status = result.status.toUpperCase();
        return status.includes("CRITICAL") || status.includes("ABNORMAL");
      }).length,
    }),
    [labResults],
  );

  const latestResult = labResults[0] ?? null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <PageHeader
          title="Patient Lab Results"
          description={latestResult ? `Latest result collected ${formatDateTime(latestResult.collectedAt)}` : "No laboratory results are available yet."}
          className="mb-0"
        />
        <div className="flex gap-4">
          <button
            className="hc-button-secondary opacity-60"
            type="button"
            disabled
            title="Bulk PDF export is not supported by the current patient portal API"
          >
            Export Unsupported
          </button>
          <button
            className="hc-button-primary opacity-60"
            type="button"
            disabled
            title="Retest request is not supported by the current patient portal API"
          >
            Retest Unsupported
          </button>
        </div>
      </div>

      {error ? (
        <div className="bg-[var(--hc-danger-bg)] text-[var(--hc-danger)] p-6 rounded-[var(--radius-lg)]" role="alert">
          <p className="text-sm font-semibold">{error}</p>
        </div>
      ) : null}

      <div className="hc-kpi-grid">
        <KpiCard
          label="Needs Review"
          value={summary.needsReview.toString()}
          tone={summary.needsReview > 0 ? "red" : "teal"}
          icon={AlertTriangle}
        />
        <KpiCard
          label="Pending Tests"
          value={summary.pending.toString()}
          tone="teal"
          icon={Hourglass}
        />
        <KpiCard
          label="Attachments"
          value={summary.withAttachments.toString()}
          tone="blue"
          icon={Paperclip}
        />
        <KpiCard
          label="Total Results"
          value={summary.total.toString()}
          tone="purple"
          icon={FlaskConical}
        />
      </div>

      <div className="bg-[var(--hc-surface)] rounded-[var(--radius-xl)] border border-[var(--hc-border)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--hc-border-soft)] bg-[var(--hc-surface-soft)]">
          <h2 className="text-sm font-bold text-[var(--hc-text)]">
            Laboratory Results
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-sm text-[var(--hc-text-secondary)]">
            Loading patient lab results...
          </div>
        ) : labResults.length > 0 ? (
          <div className="divide-y divide-[var(--hc-border-soft)]">
            {labResults.map((result) => (
              <LabResultRow key={result.labResultId} result={result} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[var(--hc-text-secondary)]">
            No lab results are available for this patient account.
          </div>
        )}
      </div>

      <footer className="mt-16 flex items-center justify-between border-t border-[var(--hc-border-soft)] py-8 text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
        <div>Source: Patient portal laboratory records API</div>
        <div>Attachment links appear only when provided by the backend</div>
      </footer>
    </div>
  );
}

function LabResultRow({ result }: { result: PatientPortalLabResultResponse }) {
  return (
    <div className="flex flex-col gap-4 p-6 hover:bg-[var(--hc-surface-soft)] transition-colors md:flex-row md:items-center justify-between">
      <div className="md:w-1/3">
        <h3 className="text-sm font-bold text-[var(--hc-text)]">{result.testName}</h3>
        <p className="mt-1 text-[11px] font-medium text-[var(--hc-text-secondary)]">
          {formatDateTime(result.collectedAt)}
        </p>
      </div>
      <div className="md:w-1/3">
        <p className="text-sm text-[var(--hc-text-secondary)]">
          {result.resultSummary || "No result summary was provided."}
        </p>
        {result.doctorComment ? (
          <p className="mt-2 text-xs font-semibold text-[var(--hc-text)]">
            Physician note: {result.doctorComment}
          </p>
        ) : null}
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">
        <span className={`hc-badge whitespace-nowrap ${getStatusBadge(result.status)}`}>
          {result.status}
        </span>
        {result.attachmentUrl ? (
          <a
            className="text-[11px] font-bold uppercase tracking-widest text-[var(--hc-primary)] hover:opacity-80 hover:underline flex items-center gap-1"
            href={result.attachmentUrl}
          >
            <HcIcon name="download" className="text-sm" />
            View Attachment
          </a>
        ) : (
          <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
            No Attachment
          </span>
        )}
      </div>
    </div>
  );
}

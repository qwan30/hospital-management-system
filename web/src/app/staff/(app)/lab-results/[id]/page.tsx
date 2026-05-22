"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { DataPanel } from "@/components/ui/data-panel";
import { HcIcon } from "@/components/ui/hc-icon";
import { getLabResult, deleteLabResult, type LabResultResponse } from "@/lib/clinical-api";
import { useStoredRole } from "@/lib/use-stored-role";

export default function LabResultDetailPage() {
  const params = useParams<{ id: string }>();
  const resultId = params.id;

  const [result, setResult] = useState<LabResultResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const role = useStoredRole("staff");

  const canDelete = role === "ADMIN" || role === "DOCTOR";

  useEffect(() => {
    let isMounted = true;

    getLabResult(resultId)
      .then((data) => {
        if (isMounted) {
          setResult(data);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load lab result.");
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
  }, [resultId]);

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this lab result?")) return;
    setIsDeleting(true);
    try {
      await deleteLabResult(resultId);
      window.location.href = "/staff/lab-results";
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete failed.");
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="p-6" aria-busy="true">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
            Loading lab result...
          </p>
        </div>
      </div>
    );
  }

  if (error && !result) {
    return (
      <div className="p-8">
        <section
          className="border border-[var(--hc-red-200)] bg-[var(--hc-red-50)] p-6 rounded-[var(--radius-md)]"
          role="alert"
        >
          <p className="text-sm font-semibold text-[var(--hc-red-600)]">{error}</p>
        </section>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="p-8 space-y-8">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title={result.testName}
          description={`Collected: ${new Date(result.collectedAt).toLocaleString()} | Result ID: ${result.labResultId}`}
          action={
            <div className="flex gap-4">
              {canDelete && (
                <button
                  className="px-4 py-2 bg-[var(--hc-red-50)] text-[var(--hc-red-600)] font-semibold text-xs flex items-center gap-2 hover:bg-[var(--hc-red-100)] transition-colors rounded-[var(--radius-sm)]"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  type="button"
                >
                  <HcIcon name="delete" className="text-sm" />
                  {isDeleting ? "Deleting..." : "Delete Result"}
                </button>
              )}
            </div>
          }
        />
      </div>

      {error && (
        <section
          className="max-w-5xl mx-auto border border-[var(--hc-red-200)] bg-[var(--hc-red-50)] p-6 rounded-[var(--radius-md)]"
          role="alert"
        >
          <p className="text-sm font-semibold text-[var(--hc-red-600)]">{error}</p>
        </section>
      )}

      <div className="max-w-5xl mx-auto grid grid-cols-12 gap-8">
        {/* Main Result */}
        <div className="col-span-12 md:col-span-8 bg-[var(--hc-surface-soft)] p-8 rounded-[var(--radius-lg)] border-b-2 border-[var(--hc-blue-600)]">
          <div className="flex justify-between items-start mb-8">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--hc-text-secondary)]">
                Test Name
              </span>
              <h2 className="text-2xl font-semibold text-[var(--hc-text)]">{result.testName}</h2>
            </div>
            <Badge variant="success">
              {result.status}
            </Badge>
          </div>

          {result.resultSummary && (
            <div className="mb-8">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">
                Result Summary
              </span>
              <p className="text-lg text-[var(--hc-text)] leading-relaxed">{result.resultSummary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-8 border-t border-[var(--hc-border-soft)] pt-8">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">
                Appointment
              </span>
              <span className="text-sm font-mono text-[var(--hc-text)]">{result.appointmentId}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-2">
                Collected At
              </span>
              <span className="text-sm font-mono text-[var(--hc-text)]">
                {new Date(result.collectedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Side Metadata */}
        <div className="col-span-12 md:col-span-4 space-y-8">
          {result.attachmentUrl && (
            <DataPanel className="p-6">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-4">
                Attachments
              </span>
              <a
                className="group flex items-center justify-between py-3"
                href={result.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="flex items-center gap-3">
                  <HcIcon name="description" className="text-[var(--hc-blue-600)]" />
                  <span className="text-xs font-semibold">View Attachment</span>
                </div>
                <HcIcon
                  name="arrow_forward"
                  className="text-sm group-hover:translate-x-1 transition-transform"
                />
              </a>
            </DataPanel>
          )}

          <DataPanel className="p-6">
            <span className="block text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-secondary)] mb-4">
              Result Metadata
            </span>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
                  Lab Result ID
                </span>
                <p className="text-sm font-mono mt-1">{result.labResultId}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--hc-text-placeholder)]">
                  Status
                </span>
                <p className="text-sm font-mono mt-1">{result.status}</p>
              </div>
            </div>
          </DataPanel>
        </div>

        {/* Clinician Comment */}
        {result.doctorComment && (
          <div className="col-span-12">
            <DataPanel className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <HcIcon name="comment" className="text-[var(--hc-text)]" />
                <h3 className="text-sm font-bold uppercase tracking-widest">
                  Clinician Comment
                </h3>
              </div>
              <div className="bg-white p-8 border-l-4 border-[var(--hc-blue-600)] rounded-[var(--radius-sm)]">
                <p className="text-lg text-[var(--hc-text)] leading-relaxed italic">
                  &quot;{result.doctorComment}&quot;
                </p>
              </div>
            </DataPanel>
          </div>
        )}
      </div>
    </div>
  );
}

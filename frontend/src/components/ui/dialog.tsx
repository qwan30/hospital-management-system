"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Dialog({ isOpen, onClose, title, description, children, className }: DialogProps) {
  if (!isOpen) {
    return <div className="hidden" data-testid="dialog-hidden" aria-hidden="true">{children}</div>;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
      <div
        className={cn(
          "w-full max-w-xl bg-white rounded-[var(--radius-xl)] shadow-[var(--shadow-card)] p-8 border border-[var(--hc-border)]",
          className,
        )}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[var(--hc-text)]">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-[var(--hc-text-secondary)]">{description}</p>
            ) : null}
          </div>
          <button
            aria-label="Close dialog"
            className="shrink-0 p-2 text-[var(--hc-text-secondary)] hover:bg-[var(--hc-surface-soft)] rounded-[var(--radius-md)] transition-colors"
            onClick={onClose}
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

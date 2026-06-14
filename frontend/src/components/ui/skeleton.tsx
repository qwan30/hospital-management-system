import { cn } from "@/lib/utils";

/**
 * Skeleton placeholder for loading states.
 *
 * Mirrors the shape and size of the real content so the page doesn't jump when
 * data arrives. Use `className` to match the dimensions of the target element.
 *
 * @example
 *   <Skeleton className="h-4 w-48 rounded" />           // text line
 *   <Skeleton className="h-[112px] w-full rounded-xl" /> // KPI card
 *   <Skeleton className="h-12 w-full rounded-lg" />      // table row
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse rounded-[var(--radius-md)] bg-[var(--hc-border-soft)]",
        className,
      )}
    />
  );
}

/** Matches the exact dimensions of `<KpiCard />`. */
export function KpiCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex min-h-[112px] items-center gap-4 rounded-[var(--radius-xl)] border border-[var(--hc-border)] bg-white p-5"
    >
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-8 w-24 rounded" />
        <Skeleton className="h-3 w-32 rounded" />
      </div>
    </div>
  );
}

/** Matches a standard data table row height. */
export function TableRowSkeleton({ columns }: { columns: number }) {
  return (
    <tr aria-hidden="true">
      {Array.from({ length: columns }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full rounded" />
        </td>
      ))}
    </tr>
  );
}

/** Matches page header dimensions. */
export function PageHeaderSkeleton() {
  return (
    <div className="mb-8 space-y-3">
      <Skeleton className="h-3 w-24 rounded" />
      <Skeleton className="h-8 w-64 rounded" />
      <Skeleton className="h-4 w-96 rounded" />
    </div>
  );
}

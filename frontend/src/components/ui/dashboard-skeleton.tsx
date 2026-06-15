import {
  KpiCardSkeleton,
  PageHeaderSkeleton,
  TableRowSkeleton,
} from "@/components/ui/skeleton";

interface DashboardSkeletonProps {
  /** Number of KPI cards to render. */
  kpiCount?: number;
  /** Number of table rows to render. */
  rowCount?: number;
  /** Number of table columns. */
  columns?: number;
}

/**
 * Composite skeleton matching the standard dashboard page layout:
 * PageHeader → KPI grid → Data table.
 *
 * Use as the `loading` state for dashboard pages.
 *
 * @example
 *   if (loading) return <DashboardSkeleton />;
 */
export function DashboardSkeleton({
  kpiCount = 4,
  rowCount = 5,
  columns = 4,
}: DashboardSkeletonProps) {
  return (
    <div className="mx-auto max-w-[1400px] p-8 pb-20">
      <PageHeaderSkeleton />

      {/* KPI grid */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: kpiCount }, (_, i) => (
          <KpiCardSkeleton key={i} />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--hc-border)] bg-white">
        <table className="w-full">
          <thead>
            <tr>
              {Array.from({ length: columns }, (_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <div className="h-3 w-16 animate-pulse rounded-[var(--radius-sm)] bg-[var(--hc-border-soft)]" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rowCount }, (_, i) => (
              <TableRowSkeleton key={i} columns={columns} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

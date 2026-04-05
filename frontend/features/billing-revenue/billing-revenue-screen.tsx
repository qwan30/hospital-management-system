"use client";

import {
  useDeferredValue,
  useEffect,
  useEffectEvent,
  useState,
  type ReactNode
} from "react";
import { FinanceRouteGuard } from "../auth/finance-route-guard";
import { useAuth } from "../auth/auth-provider";
import { ApiClientError } from "../auth/hms-api";
import {
  CalendarGlyph,
  ClipboardGlyph,
  HomeGlyph,
  SearchGlyph,
  WorkspaceAction,
  WorkspaceBadge,
  WorkspaceMetricCard,
  WorkspaceMetricGrid,
  WorkspacePageIntro,
  WorkspacePanel,
  WorkspaceShell,
  type WorkspaceNavItem
} from "../workspace-ui/workspace-ui";
import styles from "./billing-revenue-screen.module.css";

type InvoiceStatus = "PENDING" | "PAID" | "VOID";

type InvoiceRecord = {
  readonly invoiceId: string;
  readonly appointmentId: string;
  readonly patientId: string;
  readonly patientFullName: string;
  readonly doctorName: string;
  readonly departmentName: string;
  readonly appointmentDate: string;
  readonly totalAmount: number;
  readonly status: InvoiceStatus;
  readonly paymentMethod: string | null;
  readonly paidAt: string | null;
};

type RevenueDepartment = {
  readonly departmentId: string;
  readonly departmentName: string;
  readonly totalRevenue: number;
  readonly paidInvoiceCount: number;
};

type DailyRevenueReport = {
  readonly date: string;
  readonly totalRevenue: number;
  readonly paidInvoiceCount: number;
  readonly departmentBreakdown: readonly RevenueDepartment[];
};

type MonthlyRevenueReport = {
  readonly month: string;
  readonly totalRevenue: number;
  readonly paidInvoiceCount: number;
};

type ServicePricing = {
  readonly pricingId: string;
  readonly departmentId: string | null;
  readonly departmentName: string | null;
  readonly serviceName: string;
  readonly amount: number;
  readonly effectiveDate: string;
};

const navItems: readonly WorkspaceNavItem[] = [
  { label: "Overview", href: "#overview", active: true, icon: <HomeGlyph /> },
  { label: "Invoices", href: "#invoices", icon: <ClipboardGlyph /> },
  { label: "Pricing", href: "#pricing", icon: <CalendarGlyph /> },
  { label: "Monitoring", href: "/admin-monitoring", icon: <SearchGlyph /> }
] as const;

export function BillingRevenueScreen() {
  return (
    <FinanceRouteGuard
      fallback={
        <BillingState
          title="Checking finance access"
          description="Restoring the secured staff session for the billing workspace."
        />
      }
      forbiddenFallback={
        <BillingState
          title="Finance access required"
          description="Only accountant and admin accounts can enter the billing workspace."
        />
      }
    >
      <BillingRevenueContent />
    </FinanceRouteGuard>
  );
}

function BillingRevenueContent() {
  const { apiFetch, logout, session } = useAuth();
  const [invoices, setInvoices] = useState<readonly InvoiceRecord[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyRevenueReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyRevenueReport | null>(null);
  const [pricingRules, setPricingRules] = useState<readonly ServicePricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredQuery = useDeferredValue(searchQuery);
  const userName = session?.fullName ?? "Finance";

  const filteredInvoices = invoices.filter((invoice) => {
    if (statusFilter !== "ALL" && invoice.status !== statusFilter) {
      return false;
    }

    if (!deferredQuery.trim()) {
      return true;
    }

    const normalizedQuery = deferredQuery.trim().toLowerCase();
    return (
      invoice.patientFullName.toLowerCase().includes(normalizedQuery) ||
      invoice.doctorName.toLowerCase().includes(normalizedQuery) ||
      invoice.departmentName.toLowerCase().includes(normalizedQuery)
    );
  });

  const loadDashboard = useEffectEvent(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const month = today.slice(0, 7);

      const [invoiceResponse, dailyResponse, monthlyResponse, pricingResponse] =
        await Promise.all([
          apiFetch<InvoiceRecord[]>("/invoices"),
          apiFetch<DailyRevenueReport>(`/reports/revenue/daily?date=${today}`),
          apiFetch<MonthlyRevenueReport>(`/reports/revenue/monthly?month=${month}`),
          apiFetch<ServicePricing[]>("/pricing")
        ]);

      setInvoices(invoiceResponse);
      setDailyReport(dailyResponse);
      setMonthlyReport(monthlyResponse);
      setPricingRules(pricingResponse);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(toMessage(error));
    } finally {
      if (mode === "initial") {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  });

  useEffect(() => {
    void loadDashboard("initial");
  }, []);

  async function handleLogout() {
    await logout("staff");
    window.location.assign("/login");
  }

  if (loading) {
    return (
      <BillingFrame
        onLogout={handleLogout}
        onRefresh={() => {
          void loadDashboard("refresh");
        }}
        refreshing={refreshing}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userName={userName}
      >
        <BillingState
          title="Loading finance dashboards"
          description="Fetching invoice ledger, revenue snapshots, and pricing rules from the HMS API."
        />
      </BillingFrame>
    );
  }

  if (errorMessage && !dailyReport && !monthlyReport) {
    return (
      <BillingFrame
        onLogout={handleLogout}
        onRefresh={() => {
          void loadDashboard("refresh");
        }}
        refreshing={refreshing}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userName={userName}
      >
        <BillingState title="Unable to load billing workspace" description={errorMessage} />
      </BillingFrame>
    );
  }

  const paidInvoices = invoices.filter((invoice) => invoice.status === "PAID").length;
  const pendingInvoices = invoices.filter((invoice) => invoice.status === "PENDING").length;
  const departmentsTracked = new Set(
    pricingRules.map((rule) => rule.departmentName || "General")
  ).size;

  return (
    <BillingFrame
      onLogout={handleLogout}
      onRefresh={() => {
        void loadDashboard("refresh");
      }}
      refreshing={refreshing}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      userName={userName}
    >
      <WorkspacePageIntro
        eyebrow="Finance operations"
        title="Billing & revenue dashboard"
        summary="Track invoice recovery, compare today against month-to-date performance, and keep pricing rules visible next to the active ledger."
        aside={
          <>
            <WorkspaceBadge tone="green">
              {paidInvoices} paid invoices
            </WorkspaceBadge>
            <WorkspaceBadge tone="navy">
              {departmentsTracked} departments tracked
            </WorkspaceBadge>
          </>
        }
      />

      <WorkspaceMetricGrid>
        <WorkspaceMetricCard
          accent="green"
          label="Today revenue"
          value={formatCurrency(dailyReport?.totalRevenue ?? 0)}
          description={`${dailyReport?.paidInvoiceCount ?? 0} paid invoices captured today`}
        />
        <WorkspaceMetricCard
          accent="cyan"
          label="Month to date"
          value={formatCurrency(monthlyReport?.totalRevenue ?? 0)}
          description={`${monthlyReport?.paidInvoiceCount ?? 0} paid invoices in ${monthlyReport?.month ?? "this month"}`}
        />
        <WorkspaceMetricCard
          accent="amber"
          label="Pending invoices"
          value={pendingInvoices.toString().padStart(2, "0")}
          description="Outstanding invoice records still waiting for payment capture."
        />
        <WorkspaceMetricCard
          accent="slate"
          label="Pricing rules"
          value={pricingRules.length.toString().padStart(2, "0")}
          description="Effective pricing contracts currently visible to finance staff."
        />
      </WorkspaceMetricGrid>

      {errorMessage ? (
        <BillingInlineNotice>{errorMessage}</BillingInlineNotice>
      ) : null}

      <div className={styles.grid}>
        <WorkspacePanel
          aside={<WorkspaceBadge tone="cyan">Revenue pulse</WorkspaceBadge>}
          eyebrow="Snapshot"
          title="Daily and monthly revenue performance"
        >
          <div className={styles.revenueGrid} id="overview">
            <article className={styles.revenueCard}>
              <div className={styles.revenueLabel}>Today</div>
              <div className={styles.revenueValue}>
                {formatCurrency(dailyReport?.totalRevenue ?? 0)}
              </div>
              <div className={styles.revenueMeta}>
                {dailyReport?.paidInvoiceCount ?? 0} paid invoices
              </div>
            </article>
            <article className={styles.revenueCard}>
              <div className={styles.revenueLabel}>Month to date</div>
              <div className={styles.revenueValue}>
                {formatCurrency(monthlyReport?.totalRevenue ?? 0)}
              </div>
              <div className={styles.revenueMeta}>
                {monthlyReport?.paidInvoiceCount ?? 0} paid invoices
              </div>
            </article>
          </div>

          <div className={styles.breakdownList}>
            {(dailyReport?.departmentBreakdown ?? []).map((department) => (
              <article key={department.departmentId} className={styles.breakdownItem}>
                <div>
                  <div className={styles.breakdownTitle}>{department.departmentName}</div>
                  <div className={styles.breakdownMeta}>
                    {department.paidInvoiceCount} paid invoices today
                  </div>
                </div>
                <div className={styles.breakdownAmount}>
                  {formatCurrency(department.totalRevenue)}
                </div>
              </article>
            ))}
            {(dailyReport?.departmentBreakdown ?? []).length === 0 ? (
              <p className={styles.emptyCopy}>
                No department revenue has been captured yet for the selected day.
              </p>
            ) : null}
          </div>
        </WorkspacePanel>

        <WorkspacePanel
          aside={
            <div className={styles.filterRow}>
              {(["ALL", "PENDING", "PAID", "VOID"] as const).map((status) => (
                <button
                  key={status}
                  className={
                    statusFilter === status ? styles.filterChipActive : styles.filterChip
                  }
                  onClick={() => setStatusFilter(status)}
                  type="button"
                >
                  {status}
                </button>
              ))}
            </div>
          }
          eyebrow="Ledger"
          title="Invoice workbench"
        >
          <div className={styles.tableWrap} id="invoices">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Department</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.invoiceId}>
                    <td>
                      <div className={styles.tablePrimary}>{invoice.patientFullName}</div>
                      <div className={styles.tableSecondary}>{invoice.invoiceId.slice(0, 8)}</div>
                    </td>
                    <td>{invoice.departmentName}</td>
                    <td>{invoice.doctorName}</td>
                    <td>
                      <WorkspaceBadge tone={invoiceTone(invoice.status)}>
                        {invoice.status}
                      </WorkspaceBadge>
                    </td>
                    <td>{formatCurrency(invoice.totalAmount)}</td>
                    <td>{formatDate(invoice.appointmentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredInvoices.length === 0 ? (
              <p className={styles.emptyCopy}>
                No invoices match the current finance filters.
              </p>
            ) : null}
          </div>
        </WorkspacePanel>
      </div>

      <WorkspacePanel
        aside={<WorkspaceBadge tone="amber">Pricing</WorkspaceBadge>}
        eyebrow="Contracts"
        title="Active pricing rules"
      >
        <div className={styles.pricingGrid} id="pricing">
          {pricingRules.map((rule) => (
            <article key={rule.pricingId} className={styles.pricingCard}>
              <div className={styles.pricingDepartment}>
                {rule.departmentName || "General services"}
              </div>
              <h3 className={styles.pricingTitle}>{rule.serviceName}</h3>
              <div className={styles.pricingValue}>{formatCurrency(rule.amount)}</div>
              <div className={styles.pricingMeta}>
                Effective from {formatDate(rule.effectiveDate)}
              </div>
            </article>
          ))}
        </div>
      </WorkspacePanel>
    </BillingFrame>
  );
}

type BillingFrameProps = {
  readonly children: ReactNode;
  readonly onLogout: () => Promise<void>;
  readonly onRefresh: () => void;
  readonly refreshing: boolean;
  readonly searchQuery: string;
  readonly setSearchQuery: (value: string) => void;
  readonly userName: string;
};

function BillingFrame({
  children,
  onLogout,
  onRefresh,
  refreshing,
  searchQuery,
  setSearchQuery,
  userName
}: BillingFrameProps) {
  return (
    <WorkspaceShell
      brand="Clinical Atelier"
      screenLabel="Billing & Revenue"
      meta="Accountant workspace · Revenue snapshots · Pricing visibility"
      navItems={navItems}
      userName={userName}
      userRole="Finance operations"
      topbarLead={
        <div className={styles.toolbarCard}>
          <SearchGlyph />
          <input
            aria-label="Search billing invoices"
            className={styles.searchInput}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search patient, doctor, or department"
            type="search"
            value={searchQuery}
          />
        </div>
      }
      topbarActions={
        <>
          <WorkspaceAction onClick={onRefresh} tone="secondary">
            {refreshing ? "Refreshing..." : "Refresh data"}
          </WorkspaceAction>
          <WorkspaceAction href="/cms" tone="ghost">
            Open CMS
          </WorkspaceAction>
        </>
      }
      sidebarFooter={
        <WorkspaceAction
          ariaLabel="Sign out from finance workspace"
          onClick={() => {
            void onLogout();
          }}
          tone="primary"
        >
          Sign out
        </WorkspaceAction>
      }
    >
      {children}
    </WorkspaceShell>
  );
}

function BillingState({
  title,
  description
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className={styles.stateShell}>
      <div className={styles.stateCard}>
        <div className={styles.stateEyebrow}>Finance workspace</div>
        <h1 className={styles.stateTitle}>{title}</h1>
        <p className={styles.stateText}>{description}</p>
      </div>
    </div>
  );
}

function BillingInlineNotice({ children }: { readonly children: ReactNode }) {
  return <div className={styles.notice}>{children}</div>;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function invoiceTone(status: InvoiceStatus) {
  switch (status) {
    case "PAID":
      return "green";
    case "PENDING":
      return "amber";
    case "VOID":
      return "red";
  }
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to load the billing workspace right now.";
}

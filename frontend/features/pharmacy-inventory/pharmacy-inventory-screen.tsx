"use client";

import { useEffect, useEffectEvent, useState, type ReactNode } from "react";
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
import styles from "./pharmacy-inventory-screen.module.css";

type InventoryItem = {
  readonly itemId: string;
  readonly sku: string;
  readonly itemName: string;
  readonly category: string;
  readonly unit: string;
  readonly reorderLevel: number;
  readonly quantityOnHand: number;
  readonly status: string;
  readonly departmentName: string | null;
  readonly lastRestockedAt: string | null;
};

type InventoryLot = {
  readonly lotId: string;
  readonly itemId: string;
  readonly itemName: string;
  readonly lotCode: string;
  readonly supplierName: string | null;
  readonly quantityReceived: number;
  readonly quantityRemaining: number;
  readonly expiresOn: string | null;
};

type InventoryMovement = {
  readonly movementId: string;
  readonly itemId: string;
  readonly itemName: string;
  readonly movementType: string;
  readonly quantityDelta: number;
  readonly note: string | null;
  readonly createdAt: string;
};

const navItems: readonly WorkspaceNavItem[] = [
  { label: "Overview", href: "#overview", active: true, icon: <HomeGlyph /> },
  { label: "Items", href: "#items", icon: <ClipboardGlyph /> },
  { label: "Lots", href: "#lots", icon: <CalendarGlyph /> },
  { label: "Billing", href: "/billing-revenue", icon: <SearchGlyph /> }
] as const;

export function PharmacyInventoryScreen() {
  return (
    <FinanceRouteGuard
      fallback={
        <InventoryState
          title="Checking inventory access"
          description="Restoring the secured finance session for inventory visibility."
        />
      }
      forbiddenFallback={
        <InventoryState
          title="Finance access required"
          description="Only accountant and admin accounts can access inventory management."
        />
      }
    >
      <PharmacyInventoryContent />
    </FinanceRouteGuard>
  );
}

function PharmacyInventoryContent() {
  const { apiFetch, logout, session } = useAuth();
  const [items, setItems] = useState<readonly InventoryItem[]>([]);
  const [lots, setLots] = useState<readonly InventoryLot[]>([]);
  const [movements, setMovements] = useState<readonly InventoryMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const userName = session?.fullName ?? "Finance";

  const loadInventory = useEffectEvent(async (mode: "initial" | "refresh" = "initial") => {
    if (mode === "initial") {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const [itemResponse, lotResponse, movementResponse] = await Promise.all([
        apiFetch<InventoryItem[]>("/inventory/items"),
        apiFetch<InventoryLot[]>("/inventory/lots"),
        apiFetch<InventoryMovement[]>("/inventory/movements")
      ]);
      setItems(itemResponse);
      setLots(lotResponse);
      setMovements(movementResponse);
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
    void loadInventory("initial");
  }, []);

  async function handleLogout() {
    await logout("staff");
    window.location.assign("/login");
  }

  const lowStockItems = items.filter((item) => item.quantityOnHand <= item.reorderLevel).length;
  const expiringLots = lots.filter((lot) => {
    if (!lot.expiresOn) {
      return false;
    }
    const expiresAt = new Date(lot.expiresOn).getTime();
    return expiresAt - Date.now() <= 1000 * 60 * 60 * 24 * 120;
  }).length;

  if (loading) {
    return (
      <InventoryFrame
        onLogout={handleLogout}
        onRefresh={() => {
          void loadInventory("refresh");
        }}
        refreshing={refreshing}
        userName={userName}
      >
        <InventoryState
          title="Loading inventory workspace"
          description="Fetching inventory items, lot aging, and movement history."
        />
      </InventoryFrame>
    );
  }

  return (
    <InventoryFrame
      onLogout={handleLogout}
      onRefresh={() => {
        void loadInventory("refresh");
      }}
      refreshing={refreshing}
      userName={userName}
    >
      <WorkspacePageIntro
        eyebrow="Inventory visibility"
        title="Pharmacy & inventory management"
        summary="Keep medication and supply health visible for finance operations, including reorder risk, expiring lots, and recent stock movement."
        aside={
          <>
            <WorkspaceBadge tone={lowStockItems > 0 ? "amber" : "green"}>
              {lowStockItems} low stock items
            </WorkspaceBadge>
            <WorkspaceBadge tone="navy">{expiringLots} lots expiring soon</WorkspaceBadge>
          </>
        }
      />

      <WorkspaceMetricGrid>
        <WorkspaceMetricCard
          accent="cyan"
          label="Inventory items"
          value={items.length.toString().padStart(2, "0")}
          description="Medication and supply lines currently visible to finance operations."
        />
        <WorkspaceMetricCard
          accent="amber"
          label="Low stock"
          value={lowStockItems.toString().padStart(2, "0")}
          description="Items currently at or below their reorder threshold."
        />
        <WorkspaceMetricCard
          accent="green"
          label="Tracked lots"
          value={lots.length.toString().padStart(2, "0")}
          description="Active inventory lots with quantity and supplier context."
        />
        <WorkspaceMetricCard
          accent="slate"
          label="Recent movements"
          value={movements.length.toString().padStart(2, "0")}
          description="Most recent stock adjustments visible from the movement log."
        />
      </WorkspaceMetricGrid>

      {errorMessage ? <div className={styles.notice}>{errorMessage}</div> : null}

      <div className={styles.grid}>
        <WorkspacePanel eyebrow="Current stock" title="Inventory items">
          <div className={styles.tableWrap} id="items">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Department</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.itemId}>
                    <td>
                      <div className={styles.primaryText}>{item.itemName}</div>
                      <div className={styles.secondaryText}>{item.sku}</div>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.departmentName || "Shared"}</td>
                    <td>
                      {item.quantityOnHand} {item.unit}
                    </td>
                    <td>
                      <WorkspaceBadge tone={item.quantityOnHand <= item.reorderLevel ? "amber" : "green"}>
                        {item.status}
                      </WorkspaceBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WorkspacePanel>

        <WorkspacePanel eyebrow="Lot aging" title="Tracked lots">
          <div className={styles.lotList} id="lots">
            {lots.map((lot) => (
              <article key={lot.lotId} className={styles.lotCard}>
                <div>
                  <div className={styles.primaryText}>{lot.itemName}</div>
                  <div className={styles.secondaryText}>
                    {lot.lotCode} · {lot.supplierName || "Unknown supplier"}
                  </div>
                </div>
                <div className={styles.lotMeta}>
                  <span>{lot.quantityRemaining} remaining</span>
                  <span>{lot.expiresOn ? formatDate(lot.expiresOn) : "No expiry"}</span>
                </div>
              </article>
            ))}
          </div>
        </WorkspacePanel>
      </div>

      <WorkspacePanel eyebrow="Movement stream" title="Recent stock movement">
        <div className={styles.movementList}>
          {movements.map((movement) => (
            <article key={movement.movementId} className={styles.movementCard}>
              <div>
                <div className={styles.primaryText}>{movement.itemName}</div>
                <div className={styles.secondaryText}>{movement.note || "No note supplied"}</div>
              </div>
              <div className={styles.movementMeta}>
                <WorkspaceBadge tone={movement.quantityDelta >= 0 ? "green" : "amber"}>
                  {movement.movementType}
                </WorkspaceBadge>
                <strong>{movement.quantityDelta > 0 ? "+" : ""}{movement.quantityDelta}</strong>
              </div>
            </article>
          ))}
        </div>
      </WorkspacePanel>
    </InventoryFrame>
  );
}

type InventoryFrameProps = {
  readonly children: ReactNode;
  readonly onLogout: () => Promise<void>;
  readonly onRefresh: () => void;
  readonly refreshing: boolean;
  readonly userName: string;
};

function InventoryFrame({
  children,
  onLogout,
  onRefresh,
  refreshing,
  userName
}: InventoryFrameProps) {
  return (
    <WorkspaceShell
      brand="Clinical Atelier"
      screenLabel="Pharmacy & Inventory"
      meta="Finance workspace · Stock health · Lot visibility"
      navItems={navItems}
      userName={userName}
      userRole="Inventory oversight"
      topbarLead={
        <div className={styles.toolbarCard}>
          <SearchGlyph />
          <div>
            <div className={styles.secondaryText}>Inventory readiness</div>
            <div className={styles.primaryText}>
              Medication and consumable health visible next to recent stock movement.
            </div>
          </div>
        </div>
      }
      topbarActions={
        <WorkspaceAction onClick={onRefresh} tone="secondary">
          {refreshing ? "Refreshing..." : "Refresh inventory"}
        </WorkspaceAction>
      }
      sidebarFooter={
        <WorkspaceAction
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

function InventoryState({
  title,
  description
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className={styles.stateShell}>
      <div className={styles.stateCard}>
        <div className={styles.stateEyebrow}>Inventory workspace</div>
        <h1 className={styles.stateTitle}>{title}</h1>
        <p className={styles.stateText}>{description}</p>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(value));
}

function toMessage(error: unknown) {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to load inventory data right now.";
}

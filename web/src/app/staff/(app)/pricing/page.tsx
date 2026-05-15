"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import {
  createServicePricing,
  listServicePricing,
  updateServicePricing,
  type ServicePricingResponse,
  type ServicePricingUpsertRequest,
} from "@/lib/operations-api";

import { HcIcon } from "@/components/ui/hc-icon";
interface PricingFormState {
  departmentId: string;
  serviceName: string;
  amount: string;
  effectiveDate: string;
}

const emptyForm: PricingFormState = {
  departmentId: "",
  serviceName: "",
  amount: "",
  effectiveDate: "",
};

export default function PricingManagementPage() {
  const [pricingRules, setPricingRules] = useState<ServicePricingResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ServicePricingResponse | null>(null);
  const [form, setForm] = useState<PricingFormState>(emptyForm);

  const loadPricing = useCallback(async (isMounted: () => boolean = () => true) => {
    if (isMounted()) {
      setIsLoading(true);
    }
    try {
      const nextRules = await listServicePricing();
      if (!isMounted()) {
        return;
      }
      setPricingRules(nextRules);
      setError(null);
    } catch (caught) {
      if (!isMounted()) {
        return;
      }
      setError(errorMessage(caught, "Unable to load service pricing."));
      setPricingRules([]);
    } finally {
      if (isMounted()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void Promise.resolve().then(() => loadPricing(() => mounted));

    return () => {
      mounted = false;
    };
  }, [loadPricing]);

  const totals = useMemo(() => {
    const catalogValue = pricingRules.reduce(
      (sum, rule) => sum + (Number(rule.amount) || 0),
      0,
    );
    const activeServices = new Set(pricingRules.map((rule) => rule.serviceName)).size;
    return { catalogValue, activeServices };
  }, [pricingRules]);

  function openCreateForm() {
    setEditingRule(null);
    setForm(emptyForm);
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  function openEditForm(rule: ServicePricingResponse) {
    setEditingRule(rule);
    setForm({
      departmentId: rule.departmentId ?? "",
      serviceName: rule.serviceName,
      amount: String(rule.amount),
      effectiveDate: rule.effectiveDate,
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setSuccess(null);

    const request = toRequest(form);
    if (!request.serviceName || !request.effectiveDate || request.amount < 0 || Number.isNaN(request.amount)) {
      setFormError("Service name, non-negative amount, and effective date are required.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingRule) {
        const updated = await updateServicePricing(editingRule.pricingId, request);
        setSuccess(updated ? `Pricing rule ${updated.serviceName} updated.` : "Pricing rule updated.");
      } else {
        const created = await createServicePricing(request);
        setSuccess(created ? `Pricing rule ${created.serviceName} created.` : "Pricing rule created.");
      }
      setEditingRule(null);
      setForm(emptyForm);
      setIsFormOpen(false);
      await loadPricing();
    } catch (caught) {
      setFormError(errorMessage(caught, "Unable to save pricing rule."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main>
      <header className="mb-12 flex justify-between items-end">
        <div className="max-w-2xl">
          <span className="font-['Public_Sans'] font-semibold uppercase text-[10px] text-[#0f62fe] tracking-widest block mb-2">FINANCIAL_MODULE / PRICING</span>
          <h2 className="text-5xl font-light tracking-tighter text-on-surface mb-4">Service Catalog</h2>
          <p className="text-on-surface-variant font-body text-sm leading-relaxed opacity-80">
            Manage standard billing rates and service protocols for global billing.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="bg-surface-container-high text-on-surface px-6 py-3 font-semibold text-[10px] tracking-widest uppercase opacity-60" disabled type="button">
            EXPORT CSV
          </button>
          <button
            className="bg-[#0f62fe] text-white px-6 py-3 font-semibold text-[10px] tracking-widest uppercase hover:bg-[#004ccd] transition-all"
            onClick={openCreateForm}
            type="button"
          >
            ADD SERVICE
          </button>
        </div>
      </header>

      {error ? (
        <div className="mb-8 border border-error/30 bg-error/10 p-4 text-sm font-medium text-error" role="alert">
          {error}
        </div>
      ) : null}
      {formError ? (
        <div className="mb-8 border border-error/30 bg-error/10 p-4 text-sm font-medium text-error" role="alert">
          {formError}
        </div>
      ) : null}
      {success ? (
        <div className="mb-8 border border-primary/20 bg-primary-container/20 p-4 text-sm font-medium text-primary" role="status">
          {success}
        </div>
      ) : null}

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 xl:col-span-9 bg-surface-container-low p-1">
          <div className="bg-surface-container-lowest p-8 overflow-x-auto">
            {isLoading ? (
              <p className="text-sm font-medium text-on-surface-variant">Loading service pricing...</p>
            ) : (
              <PricingTable rules={pricingRules} onEdit={openEditForm} />
            )}
          </div>
        </div>

        <div className="col-span-12 xl:col-span-3 space-y-6">
          <div className="bg-surface-container-highest p-8">
            <span className="font-['Public_Sans'] font-semibold uppercase text-[10px] text-outline tracking-widest block mb-4">TOTAL CATALOG VALUE</span>
            <h3 className="text-4xl font-light tracking-tighter text-on-surface">{formatCurrency(totals.catalogValue)}</h3>
            <p className="mt-2 text-[10px] font-bold text-primary">{pricingRules.length} API pricing rules</p>
          </div>
          <div className="bg-surface-container-highest p-8 border-l-4 border-primary">
            <span className="font-['Public_Sans'] font-semibold uppercase text-[10px] text-outline tracking-widest block mb-4">ACTIVE SERVICES</span>
            <h3 className="text-4xl font-light tracking-tighter text-on-surface">{totals.activeServices}</h3>
            <p className="mt-2 text-[10px] font-bold text-on-surface-variant uppercase opacity-60">Derived from current API data</p>
          </div>
          <div className="bg-surface-container-low p-8 text-xs leading-relaxed text-on-surface-variant opacity-80">
            <h4 className="font-bold text-on-surface mb-2 uppercase tracking-widest">Pricing Rules</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <HcIcon name="info" className="text-primary mr-2 scale-75" />
                Department ID is optional; the backend accepts global pricing when it is empty.
              </li>
              <li className="flex items-start">
                <HcIcon name="sync" className="text-primary mr-2 scale-75" />
                Delete is not exposed by the current pricing API.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {isFormOpen ? (
        <Dialog title={editingRule ? "Edit Service" : "Add Service"} onClose={() => {
          setEditingRule(null);
          setForm(emptyForm);
          setFormError(null);
          setIsFormOpen(false);
        }}>
          <PricingForm
            form={form}
            isSaving={isSaving}
            onChange={(nextForm) => setForm(nextForm)}
            onSubmit={handleSubmit}
          />
        </Dialog>
      ) : null}
    </main>
  );
}

function PricingTable({
  rules,
  onEdit,
}: {
  rules: ServicePricingResponse[];
  onEdit: (rule: ServicePricingResponse) => void;
}) {
  if (rules.length === 0) {
    return <p className="text-sm font-medium text-on-surface-variant">No pricing rules are available.</p>;
  }

  return (
    <table className="w-full text-left">
      <thead>
        <tr className="border-b-2 border-surface-container-high">
          <HeaderCell>Department</HeaderCell>
          <HeaderCell>Internal Name</HeaderCell>
          <HeaderCell>Base Price</HeaderCell>
          <HeaderCell>Effective Date</HeaderCell>
          <HeaderCell>Status</HeaderCell>
          <HeaderCell alignRight>Actions</HeaderCell>
        </tr>
      </thead>
      <tbody className="divide-y divide-surface-container">
        {rules.map((rule) => (
          <tr className="group hover:bg-surface-container-low transition-colors" key={rule.pricingId}>
            <td className="py-6 pr-4">
              <span className="bg-primary-container/10 text-primary font-bold text-[9px] px-2 py-1 tracking-tighter">
                {rule.departmentName || "GLOBAL"}
              </span>
            </td>
            <td className="py-6 font-semibold text-sm">{rule.serviceName}</td>
            <td className="py-6 font-mono text-sm">{formatCurrency(rule.amount)}</td>
            <td className="py-6 text-xs text-on-surface-variant font-bold">{formatDate(rule.effectiveDate)}</td>
            <td className="py-6 text-center">
              <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-black bg-green-100 text-green-700 uppercase">Active</span>
            </td>
            <td className="py-6 text-right space-x-2">
              <button
                aria-label={`Edit ${rule.serviceName}`}
                className="text-outline hover:text-primary transition-colors"
                onClick={() => onEdit(rule)}
                type="button"
              >
                <HcIcon name="edit" className="text-lg" />
              </button>
              <button
                aria-label={`Delete ${rule.serviceName} unsupported`}
                className="text-outline opacity-50"
                disabled
                type="button"
              >
                <HcIcon name="delete" className="text-lg" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PricingForm({
  form,
  isSaving,
  onChange,
  onSubmit,
}: {
  form: PricingFormState;
  isSaving: boolean;
  onChange: (nextForm: PricingFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-6" noValidate onSubmit={onSubmit}>
      <FormInput
        label="Department ID"
        onChange={(value) => onChange({ ...form, departmentId: value })}
        value={form.departmentId}
      />
      <FormInput
        label="Service Name"
        onChange={(value) => onChange({ ...form, serviceName: value })}
        required
        value={form.serviceName}
      />
      <FormInput
        label="Amount"
        onChange={(value) => onChange({ ...form, amount: value })}
        required
        type="number"
        value={form.amount}
      />
      <FormInput
        label="Effective Date"
        onChange={(value) => onChange({ ...form, effectiveDate: value })}
        required
        type="date"
        value={form.effectiveDate}
      />
      <div className="flex justify-end gap-3">
        <button className="bg-[#0f62fe] text-white px-6 py-3 text-xs font-bold uppercase tracking-widest disabled:opacity-60" disabled={isSaving} type="submit">
          {isSaving ? "Saving..." : "Save Service"}
        </button>
      </div>
    </form>
  );
}

function FormInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">{label}</label>
      <input
        aria-label={label}
        className="w-full bg-surface-container-low border-b-2 border-outline focus:border-primary focus:ring-0 py-3 px-4 font-medium"
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </div>
  );
}

function HeaderCell({ children, alignRight = false }: { children: string; alignRight?: boolean }) {
  return (
    <th className={`pb-6 font-['Public_Sans'] font-semibold uppercase text-[10px] text-outline tracking-widest ${alignRight ? "text-right" : ""}`}>
      {children}
    </th>
  );
}

function Dialog({
  children,
  title,
  onClose,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-6">
      <div className="w-full max-w-lg bg-surface-container-lowest p-8 shadow-xl">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-lg font-bold uppercase tracking-widest">{title}</h3>
          <button aria-label="Close dialog" className="p-2 hover:bg-surface-container-low" onClick={onClose} type="button">
            <HcIcon name="close" className="text-lg" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function toRequest(form: PricingFormState): ServicePricingUpsertRequest {
  return {
    departmentId: form.departmentId.trim() || null,
    serviceName: form.serviceName.trim(),
    amount: Number(form.amount),
    effectiveDate: form.effectiveDate,
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function errorMessage(caught: unknown, fallback: string) {
  return caught instanceof Error ? caught.message : fallback;
}

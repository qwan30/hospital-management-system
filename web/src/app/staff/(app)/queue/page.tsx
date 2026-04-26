"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  assignQueueRoom,
  callQueuePatient,
  checkInAppointment,
  completeQueueVisit,
  getTodayAppointments,
  getTodayQueue,
  skipQueuePatient,
  startQueueConsultation,
  type ClinicalAppointmentResponse,
} from "@/lib/clinical-api";
import {
  calculateAverageWaitMinutes,
  calculatePhysicianLoads,
  calculateWaitMinutes,
  filterOptions,
  formatTime,
  formatWait,
  getErrorMessage,
  getQueueFilter,
  getQueueState,
  getWaitBadgeClass,
  maskIdentifier,
  mergeAppointments,
  removeRecordKey,
  toLocalIsoDateTime,
  toQueueError,
  type PhysicianLoad,
  type QueueError,
  type QueueFilter,
} from "@/lib/staff-queue";

const DEFAULT_CONSULT_ROOM = "Consult Room 1";

type QueueAction = "call" | "assign-room" | "skip" | "start-consultation" | "complete";

export default function QueueBoardPage() {
  const [appointments, setAppointments] = useState<ClinicalAppointmentResponse[]>([]);
  const [activeFilter, setActiveFilter] = useState<QueueFilter>("waiting");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<QueueError | null>(null);
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    appointmentId: string;
    action: QueueAction;
  } | null>(null);
  const [now, setNow] = useState(() => new Date());

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [queueAppointments, todayAppointments] = await Promise.all([
        getTodayQueue(),
        getTodayAppointments(),
      ]);

      setAppointments(mergeAppointments(todayAppointments, queueAppointments));
    } catch (loadError) {
      setAppointments([]);
      setError(toQueueError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const displayableAppointments = useMemo(
    () => appointments.filter((appointment) => getQueueFilter(appointment)),
    [appointments],
  );

  const filteredAppointments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return displayableAppointments.filter((appointment) => {
      const matchesTab = getQueueFilter(appointment) === activeFilter;
      const matchesQuery =
        !normalizedQuery ||
        [
          appointment.patientFullName,
          appointment.patientPhone,
          appointment.patientCccd,
          appointment.confirmationCode,
          appointment.doctorName,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesTab && matchesQuery;
    });
  }, [activeFilter, displayableAppointments, query]);

  const summary = useMemo(
    () => ({
      activePatients: displayableAppointments.length,
      averageWaitMinutes: calculateAverageWaitMinutes(displayableAppointments, now),
      physicianLoads: calculatePhysicianLoads(displayableAppointments),
    }),
    [displayableAppointments, now],
  );

  const handleCheckIn = async (appointment: ClinicalAppointmentResponse) => {
    setCheckingInId(appointment.appointmentId);
    setRowErrors((current) => removeRecordKey(current, appointment.appointmentId));

    try {
      const updatedAppointment = await checkInAppointment(appointment.appointmentId, {
        checkedInAt: toLocalIsoDateTime(new Date()),
      });

      setAppointments((current) =>
        mergeAppointments(
          current.map((currentAppointment) =>
            currentAppointment.appointmentId === updatedAppointment.appointmentId
              ? updatedAppointment
              : currentAppointment,
          ),
          [updatedAppointment],
        ),
      );
      setActiveFilter("ready");
    } catch (checkInError) {
      setRowErrors((current) => ({
        ...current,
        [appointment.appointmentId]: getErrorMessage(checkInError),
      }));
    } finally {
      setCheckingInId(null);
    }
  };

  const applyAppointmentUpdate = (updatedAppointment: ClinicalAppointmentResponse) => {
    setAppointments((current) => mergeAppointments(current, [updatedAppointment]));
  };

  const handleQueueAction = async (
    appointment: ClinicalAppointmentResponse,
    action: QueueAction,
    execute: () => Promise<ClinicalAppointmentResponse>,
    nextFilter?: QueueFilter,
  ) => {
    setPendingAction({ appointmentId: appointment.appointmentId, action });
    setRowErrors((current) => removeRecordKey(current, appointment.appointmentId));

    try {
      const updatedAppointment = await execute();
      applyAppointmentUpdate(updatedAppointment);
      if (nextFilter) {
        setActiveFilter(nextFilter);
      }
    } catch (queueActionError) {
      setRowErrors((current) => ({
        ...current,
        [appointment.appointmentId]: getErrorMessage(queueActionError),
      }));
    } finally {
      setPendingAction(null);
    }
  };

  if (isLoading) {
    return (
      <main className="p-8" aria-busy="true">
        <QueueHeader
          activePatients={0}
          averageWaitMinutes={0}
          onRefresh={loadQueue}
          isRefreshDisabled
        />
        <section className="mt-8 bg-hms-surface-container-low p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-hms-on-surface-variant">
            Loading today&apos;s nurse queue...
          </p>
        </section>
      </main>
    );
  }

  if (error) {
    const isAuthError = error.status === 401 || error.status === 403;

    return (
      <main className="p-8">
        <QueueHeader
          activePatients={0}
          averageWaitMinutes={0}
          onRefresh={loadQueue}
          isRefreshDisabled={isLoading}
        />
        <section
          className="mt-8 border border-hms-error-container bg-white p-8"
          data-testid={isAuthError ? "queue-unauthorized" : "queue-load-error"}
          role="alert"
        >
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-hms-error">
            {isAuthError ? "Queue access unavailable" : "Queue load failed"}
          </p>
          <h2 className="mt-3 text-2xl font-light text-hms-on-surface">
            {error.message}
          </h2>
          <button
            className="mt-6 bg-hms-primary-container px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-hms-primary"
            type="button"
            onClick={loadQueue}
          >
            Retry
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="p-8" data-testid="queue-board">
      <QueueHeader
        activePatients={summary.activePatients}
        averageWaitMinutes={summary.averageWaitMinutes}
        onRefresh={loadQueue}
        isRefreshDisabled={isLoading}
      />

      <section className="border-b border-hms-outline-variant/20 bg-hms-surface-container-low p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex bg-white">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                aria-pressed={activeFilter === option.value}
                className={`px-6 py-2 text-xs font-bold uppercase tracking-widest transition-colors ${
                  activeFilter === option.value
                    ? "bg-hms-primary-container text-white"
                    : "text-hms-on-surface hover:bg-hms-surface-container-high"
                }`}
                type="button"
                onClick={() => setActiveFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <label className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-hms-outline">
              search
            </span>
            <span className="sr-only">Filter queue</span>
            <input
              className="w-full border-0 border-b-2 border-hms-outline bg-hms-surface-container-lowest py-2 pl-10 text-xs font-medium uppercase tracking-widest outline-none transition-colors focus:border-hms-primary"
              placeholder="FILTER QUEUE..."
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="overflow-x-auto bg-white">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-hms-surface-container text-[10px] font-bold uppercase tracking-[0.2em] text-hms-outline">
              <th className="px-4 py-3">Queue #</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Checked-in at</th>
              <th className="px-4 py-3">Wait Duration</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment) => (
                <QueueRow
                  key={appointment.appointmentId}
                  appointment={appointment}
                  now={now}
                  isCheckingIn={checkingInId === appointment.appointmentId}
                  pendingAction={
                    pendingAction?.appointmentId === appointment.appointmentId
                      ? pendingAction.action
                      : null
                  }
                  rowError={rowErrors[appointment.appointmentId]}
                  onCheckIn={handleCheckIn}
                  onCall={(selectedAppointment) =>
                    handleQueueAction(selectedAppointment, "call", () =>
                      callQueuePatient(selectedAppointment.appointmentId),
                    )
                  }
                  onAssignRoom={(selectedAppointment) =>
                    handleQueueAction(selectedAppointment, "assign-room", () =>
                      assignQueueRoom(selectedAppointment.appointmentId, {
                        roomName: DEFAULT_CONSULT_ROOM,
                      }),
                    )
                  }
                  onSkip={(selectedAppointment) =>
                    handleQueueAction(selectedAppointment, "skip", () =>
                      skipQueuePatient(selectedAppointment.appointmentId),
                    )
                  }
                  onStartConsultation={(selectedAppointment) =>
                    handleQueueAction(
                      selectedAppointment,
                      "start-consultation",
                      () => startQueueConsultation(selectedAppointment.appointmentId),
                      "in_progress",
                    )
                  }
                  onCompleteVisit={(selectedAppointment) =>
                    handleQueueAction(
                      selectedAppointment,
                      "complete",
                      () => completeQueueVisit(selectedAppointment.appointmentId),
                    )
                  }
                />
              ))
            ) : (
              <tr>
                <td
                  className="px-4 py-12 text-center text-sm font-semibold text-hms-on-surface-variant"
                  colSpan={7}
                  data-testid="queue-empty"
                >
                  {displayableAppointments.length === 0
                    ? "No appointments are currently in the staff queue."
                    : "No appointments match this queue filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <footer className="mt-8 flex flex-col gap-4 text-xs font-bold uppercase tracking-widest text-hms-outline lg:flex-row lg:items-center lg:justify-between">
        <div>
          Displaying {filteredAppointments.length} of {displayableAppointments.length} queue
          patients
        </div>
        <div className="flex flex-wrap gap-4">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 bg-hms-secondary" /> Within target
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 bg-hms-tertiary" /> Review required
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 bg-hms-error" /> SLA breach
          </span>
        </div>
      </footer>

      <PhysicianAllocation loads={summary.physicianLoads} />
    </main>
  );
}

function QueueHeader({
  activePatients,
  averageWaitMinutes,
  isRefreshDisabled,
  onRefresh,
}: {
  activePatients: number;
  averageWaitMinutes: number;
  isRefreshDisabled: boolean;
  onRefresh: () => void;
}) {
  return (
    <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="mb-2 text-4xl font-light tracking-tight text-hms-on-surface">
          Queue Board
        </h1>
        <p className="text-sm font-medium uppercase tracking-widest text-hms-on-surface-variant">
          Live nurse queue - today
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col justify-center bg-hms-surface-container-highest px-6 py-4">
          <span className="text-xs font-bold uppercase tracking-tighter text-hms-outline">
            Average Wait
          </span>
          <span className="text-2xl font-semibold text-hms-primary">
            {averageWaitMinutes}m
          </span>
        </div>
        <div className="flex flex-col justify-center bg-hms-surface-container-highest px-6 py-4">
          <span className="text-xs font-bold uppercase tracking-tighter text-hms-outline">
            Active Patients
          </span>
          <span className="text-2xl font-semibold text-hms-on-surface">
            {activePatients}
          </span>
        </div>
        <button
          className="flex items-center gap-2 bg-hms-primary-container px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-hms-primary disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={onRefresh}
          disabled={isRefreshDisabled}
        >
          <span className="material-symbols-outlined text-base">refresh</span>
          Refresh
        </button>
      </div>
    </header>
  );
}

function QueueRow({
  appointment,
  isCheckingIn,
  pendingAction,
  now,
  rowError,
  onCheckIn,
  onCall,
  onAssignRoom,
  onSkip,
  onStartConsultation,
  onCompleteVisit,
}: {
  appointment: ClinicalAppointmentResponse;
  isCheckingIn: boolean;
  pendingAction: QueueAction | null;
  now: Date;
  rowError?: string;
  onCheckIn: (appointment: ClinicalAppointmentResponse) => void;
  onCall: (appointment: ClinicalAppointmentResponse) => void;
  onAssignRoom: (appointment: ClinicalAppointmentResponse) => void;
  onSkip: (appointment: ClinicalAppointmentResponse) => void;
  onStartConsultation: (appointment: ClinicalAppointmentResponse) => void;
  onCompleteVisit: (appointment: ClinicalAppointmentResponse) => void;
}) {
  const waitMinutes = calculateWaitMinutes(appointment, now);
  const state = getQueueState(appointment);
  const canCheckIn = !appointment.checkedInAt;
  const isActionPending = pendingAction !== null;
  const isReady = appointment.status === "CHECKED_IN";
  const isInProgress = appointment.status === "IN_PROGRESS";

  return (
    <>
      <tr
        className="group border-b border-hms-surface-container transition-colors hover:bg-hms-surface-container-low"
        data-testid="queue-row"
      >
        <td className="px-4 py-4 font-bold text-hms-primary">
          #{appointment.confirmationCode || appointment.appointmentId.slice(0, 8)}
        </td>
        <td className="px-4 py-4">
          <div className="flex flex-col">
            <span className="font-semibold text-hms-on-surface">
              {appointment.patientFullName}
            </span>
            <span className="text-[10px] font-bold uppercase text-hms-outline">
              ID: {maskIdentifier(appointment.patientCccd)}
            </span>
          </div>
        </td>
        <td className="px-4 py-4 font-medium text-hms-on-surface-variant">
          {appointment.doctorName}
        </td>
        <td className="px-4 py-4 text-hms-on-surface-variant">
          {appointment.checkedInAt ? formatTime(appointment.checkedInAt) : "Pending"}
        </td>
        <td className="px-4 py-4">
          <span
            className={`px-2 py-0.5 text-[10px] font-bold uppercase ${getWaitBadgeClass(
              waitMinutes,
            )}`}
          >
            {formatWait(waitMinutes)}
          </span>
        </td>
        <td className="px-4 py-4">
          <span className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest">
            <span className={`h-1.5 w-1.5 ${state.dotClass}`} />
            {state.label}
          </span>
        </td>
        <td className="px-4 py-4 text-right">
          {canCheckIn ? (
            <button
              aria-label={`Check in ${appointment.patientFullName}`}
              className="bg-hms-primary-container px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-hms-primary disabled:cursor-not-allowed disabled:opacity-60"
              type="button"
              onClick={() => onCheckIn(appointment)}
              disabled={isCheckingIn}
            >
              {isCheckingIn ? "Checking in" : "Check in"}
            </button>
          ) : null}
          {isReady ? (
            <div className="flex flex-col items-end gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-hms-on-surface-variant">
                Checked in
              </span>
              <div className="flex flex-wrap justify-end gap-2">
                <QueueActionButton
                  ariaLabel={`Call ${appointment.patientFullName}`}
                  disabled={isActionPending}
                  isPending={pendingAction === "call"}
                  onClick={() => onCall(appointment)}
                >
                  Call
                </QueueActionButton>
                <QueueActionButton
                  ariaLabel={`Assign room ${appointment.patientFullName}`}
                  disabled={isActionPending}
                  isPending={pendingAction === "assign-room"}
                  onClick={() => onAssignRoom(appointment)}
                >
                  Room
                </QueueActionButton>
                <QueueActionButton
                  ariaLabel={`Start consultation ${appointment.patientFullName}`}
                  disabled={isActionPending}
                  isPending={pendingAction === "start-consultation"}
                  onClick={() => onStartConsultation(appointment)}
                >
                  Start
                </QueueActionButton>
                <QueueActionButton
                  ariaLabel={`Skip ${appointment.patientFullName}`}
                  disabled={isActionPending}
                  isPending={pendingAction === "skip"}
                  onClick={() => onSkip(appointment)}
                >
                  Skip
                </QueueActionButton>
              </div>
            </div>
          ) : null}
          {isInProgress ? (
            <div className="flex flex-col items-end gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-hms-primary">
                In consultation
              </span>
              <QueueActionButton
                ariaLabel={`Complete visit ${appointment.patientFullName}`}
                disabled={isActionPending}
                isPending={pendingAction === "complete"}
                onClick={() => onCompleteVisit(appointment)}
              >
                Complete
              </QueueActionButton>
            </div>
          ) : null}
        </td>
      </tr>
      {rowError ? (
        <tr className="border-b border-hms-error-container bg-red-50">
          <td className="px-4 py-3 text-sm font-semibold text-hms-error" colSpan={7}>
            {rowError}
          </td>
        </tr>
      ) : null}
    </>
  );
}

function QueueActionButton({
  ariaLabel,
  children,
  disabled,
  isPending,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  disabled: boolean;
  isPending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="bg-hms-surface-container-high px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-hms-on-surface transition-colors hover:bg-hms-primary-container hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      {isPending ? "Saving" : children}
    </button>
  );
}

function PhysicianAllocation({ loads }: { loads: PhysicianLoad[] }) {
  const displayedLoads = loads.slice(0, 3);

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-sm font-extrabold uppercase tracking-[0.3em] text-hms-outline">
        Physician Allocation
      </h2>
      <div className="grid grid-cols-12 gap-0">
        {displayedLoads.length > 0 ? (
          displayedLoads.map((load) => (
            <div
              key={load.doctorId}
              className="col-span-12 border-b border-r border-hms-surface-container bg-white p-6 md:col-span-4"
            >
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase text-hms-primary">
                    {load.inProgress > 0 ? "In room" : "On duty"}
                  </p>
                  <h3 className="text-xl font-semibold uppercase">{load.doctorName}</h3>
                </div>
                <span className="material-symbols-outlined text-hms-outline">
                  clinical_notes
                </span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="uppercase tracking-wider text-hms-outline">
                    Queue Load
                  </span>
                  <span className="font-bold">{load.total} Patients</span>
                </div>
                <div className="h-1 w-full bg-hms-surface-container">
                  <div
                    className="h-full bg-hms-primary"
                    style={{ width: `${Math.min(load.total * 12, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] font-medium leading-relaxed text-hms-on-surface-variant">
                  {load.waiting} waiting, {load.ready} ready, {load.inProgress} in progress.
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-12 border border-hms-outline-variant/30 bg-white p-6 text-sm font-semibold text-hms-on-surface-variant">
            No physician queue load is available yet.
          </div>
        )}
      </div>
    </section>
  );
}

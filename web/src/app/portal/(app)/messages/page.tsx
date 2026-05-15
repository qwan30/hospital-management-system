"use client";

import { useEffect, useMemo, useState } from "react";
import {
  listPatientPortalMessages,
  type PatientPortalMessageResponse,
  type PatientPortalMessageThreadResponse,
} from "@/lib/operations-api";

import { HcIcon } from "@/components/ui/hc-icon";
function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function PatientMessagesPage() {
  const [threads, setThreads] = useState<PatientPortalMessageThreadResponse[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    listPatientPortalMessages()
      .then((result) => {
        if (isMounted) {
          setThreads(result);
          setSelectedThreadId(result[0]?.threadId ?? null);
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setThreads([]);
          setSelectedThreadId(null);
          setError(loadError instanceof Error ? loadError.message : "Unable to load messages.");
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

  const filteredThreads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return threads;
    }

    return threads.filter((thread) =>
      [thread.subject, thread.channel, thread.lastMessagePreview]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, threads]);

  const selectedThread =
    filteredThreads.find((thread) => thread.threadId === selectedThreadId) ??
    filteredThreads[0] ??
    null;

  const unreadCount = useMemo(
    () => threads.reduce((total, thread) => total + thread.unreadCount, 0),
    [threads],
  );

  return (
    <main>
      <div className="flex min-h-[calc(100vh-48px)] overflow-hidden">
        <section className="flex w-1/3 min-w-[320px] flex-col border-r border-transparent bg-surface-container-low">
          <div className="border-b border-surface-container-high bg-surface-container-low p-6">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="font-headline text-lg font-bold tracking-tight">Inbox</h1>
              <span className="bg-primary-fixed px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                {unreadCount} Unread
              </span>
            </div>
            <label className="relative block">
              <HcIcon name="filter_list" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400" />
              <span className="sr-only">Filter messages</span>
              <input
                className="w-full border-b-2 border-outline bg-white py-2 pl-10 text-xs transition-colors focus:border-primary focus:ring-0"
                placeholder="Filter by channel or subject"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-xs font-bold uppercase tracking-widest text-neutral-500">
                Loading patient messages...
              </div>
            ) : error ? (
              <div className="m-6 border border-error-container bg-white p-4 text-sm font-semibold text-error" role="alert">
                {error}
              </div>
            ) : filteredThreads.length > 0 ? (
              filteredThreads.map((thread) => (
                <button
                  key={thread.threadId}
                  className={`w-full cursor-pointer p-6 text-left transition-colors ${
                    selectedThread?.threadId === thread.threadId
                      ? "border-l-4 border-primary bg-surface-container-lowest"
                      : "border-t border-surface-container-high/50 hover:bg-surface-container"
                  }`}
                  type="button"
                  onClick={() => setSelectedThreadId(thread.threadId)}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-primary">
                      {thread.channel}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {formatDateTime(thread.updatedAt)}
                    </span>
                  </div>
                  <h2 className="mb-1 text-sm font-semibold">{thread.subject}</h2>
                  <p className="line-clamp-2 text-xs leading-relaxed text-neutral-600">
                    {thread.lastMessagePreview}
                  </p>
                  {thread.unreadCount > 0 ? (
                    <span className="mt-3 inline-block bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                      {thread.unreadCount} unread
                    </span>
                  ) : null}
                </button>
              ))
            ) : (
              <div className="p-6 text-sm font-semibold text-neutral-500">
                {threads.length === 0 ? "No messages are available." : "No messages match this filter."}
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-1 flex-col bg-surface">
          {selectedThread ? (
            <>
              <div className="border-b border-surface-container-high bg-white p-10">
                <div className="max-w-4xl">
                  <div className="mb-6 flex items-center gap-2">
                    <span className="bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neutral-600">
                      {selectedThread.channel}
                    </span>
                    {selectedThread.unreadCount > 0 ? (
                      <span className="bg-surface-container-highest px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                        Unread
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mb-8 font-headline text-[3.5rem] font-light leading-tight tracking-tighter text-on-background">
                    {selectedThread.subject}
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Last updated {formatDateTime(selectedThread.updatedAt)}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-white p-10">
                <div className="max-w-4xl space-y-8">
                  {selectedThread.messages.length > 0 ? (
                    selectedThread.messages.map((message) => (
                      <MessageBlock key={message.messageId} message={message} />
                    ))
                  ) : (
                    <p className="text-sm font-semibold text-neutral-500">
                      No message bodies were returned for this thread.
                    </p>
                  )}
                </div>
              </div>

              <footer className="flex items-center justify-between border-t border-surface-container-high bg-surface-container-low p-6">
                <div className="flex items-center gap-3 text-neutral-500">
                  <HcIcon name="info" className="text-sm" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Messages are read-only
                  </span>
                </div>
                <div className="text-[10px] italic text-neutral-400">
                  Reply/archive/flag actions are not supported by the current patient portal API.
                </div>
              </footer>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center bg-white p-10 text-sm font-semibold text-neutral-500">
              Select a message thread to view details.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function MessageBlock({ message }: { message: PatientPortalMessageResponse }) {
  return (
    <article className="space-y-3 border-b border-surface-container-high pb-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
          {message.senderRole}
        </span>
        <span className="text-[10px] text-neutral-500">{formatDateTime(message.createdAt)}</span>
      </div>
      <p className="whitespace-pre-wrap text-base leading-[1.8] text-neutral-800">
        {message.body}
      </p>
    </article>
  );
}

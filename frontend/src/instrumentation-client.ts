import { createRequestId } from "@/lib/api-client";

const CLIENT_EVENTS_PATH = "/api/client-events";

window.addEventListener("error", (event) => {
  postClientEvent({
    eventType: "browser_error",
    requestId: createRequestId(),
    path: window.location.pathname,
    message: event.message,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  postClientEvent({
    eventType: "unhandled_rejection",
    requestId: createRequestId(),
    path: window.location.pathname,
    message: reasonMessage(event.reason),
  });
});

window.addEventListener("hms:api-request", (event) => {
  if (!(event instanceof CustomEvent)) {
    return;
  }

  const detail = event.detail as {
    path?: string;
    requestId?: string;
    durationMs?: number;
    status?: number;
  };
  postClientEvent({
    eventType: "api_request",
    requestId: detail.requestId || createRequestId(),
    path: detail.path || window.location.pathname,
    durationMs: detail.durationMs,
    status: detail.status,
  });
});

try {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      postClientEvent({
        eventType: "web_vital",
        requestId: createRequestId(),
        path: window.location.pathname,
        metricName: entry.name,
        metricValue: Math.round(entry.duration || entry.startTime),
      });
    }
  });
  observer.observe({ type: "largest-contentful-paint", buffered: true });
} catch {
  // Older browsers can skip web-vital collection without affecting the app.
}

function postClientEvent(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon(CLIENT_EVENTS_PATH, new Blob([body], { type: "application/json" }));
    return;
  }

  void fetch(CLIENT_EVENTS_PATH, {
    method: "POST",
    body,
    headers: { "Content-Type": "application/json" },
    keepalive: true,
  }).catch(() => undefined);
}

function reasonMessage(reason: unknown) {
  if (reason instanceof Error) {
    return reason.message;
  }
  return typeof reason === "string" ? reason : "Unhandled browser rejection";
}

package com.hospital.core.internalassistant;

import com.hospital.shared.internalassistant.InternalAssistantCitationResponse;
import com.hospital.shared.internalassistant.InternalAssistantFeedbackValue;
import com.hospital.shared.internalassistant.InternalAssistantMode;
import com.hospital.shared.internalassistant.InternalAssistantModeMetricsResponse;
import com.hospital.shared.internalassistant.InternalAssistantMonitoringResponse;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Collection;
import java.util.Comparator;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class InternalAssistantMetricsService {
  private static final int LATENCY_SAMPLE_LIMIT = 200;

  private final Map<InternalAssistantMode, Deque<Long>> latencyByMode = new ConcurrentHashMap<>();
  private final Map<String, AtomicLong> citedDocuments = new ConcurrentHashMap<>();
  private final AtomicLong totalQueries = new AtomicLong();
  private final AtomicLong refusedQueries = new AtomicLong();
  private final AtomicLong authFailures = new AtomicLong();
  private final AtomicLong feedbackTotal = new AtomicLong();
  private final AtomicLong feedbackHelpful = new AtomicLong();

  public void recordQuery(
      InternalAssistantMode mode,
      String outcome,
      Collection<InternalAssistantCitationResponse> citations,
      long durationMs) {
    totalQueries.incrementAndGet();
    if ("refused".equalsIgnoreCase(outcome) || "missing_context".equalsIgnoreCase(outcome) || "insufficient_evidence".equalsIgnoreCase(outcome)) {
      refusedQueries.incrementAndGet();
    }
    if ("forbidden".equalsIgnoreCase(outcome) || "admin_docs_only".equalsIgnoreCase(outcome)) {
      authFailures.incrementAndGet();
    }

    latencyByMode.computeIfAbsent(mode, ignored -> new ArrayDeque<>());
    synchronized (latencyByMode.get(mode)) {
      var latencies = latencyByMode.get(mode);
      latencies.addLast(durationMs);
      while (latencies.size() > LATENCY_SAMPLE_LIMIT) {
        latencies.removeFirst();
      }
    }

    for (InternalAssistantCitationResponse citation : citations) {
      var key = citation.title() == null || citation.title().isBlank() ? citation.referenceId() : citation.title();
      if (key != null && !key.isBlank()) {
        citedDocuments.computeIfAbsent(key, ignored -> new AtomicLong()).incrementAndGet();
      }
    }
  }

  public void recordFeedback(InternalAssistantFeedbackValue value) {
    feedbackTotal.incrementAndGet();
    if (value == InternalAssistantFeedbackValue.HELPFUL) {
      feedbackHelpful.incrementAndGet();
    }
  }

  public InternalAssistantMonitoringResponse snapshot() {
    var modeMetrics = List.of(
        new InternalAssistantModeMetricsResponse(InternalAssistantMode.DOCS, p95(InternalAssistantMode.DOCS)),
        new InternalAssistantModeMetricsResponse(InternalAssistantMode.PATIENT, p95(InternalAssistantMode.PATIENT)),
        new InternalAssistantModeMetricsResponse(InternalAssistantMode.HYBRID, p95(InternalAssistantMode.HYBRID)));
    var total = totalQueries.get();
    var feedbackCount = feedbackTotal.get();
    return new InternalAssistantMonitoringResponse(
        Instant.now(),
        modeMetrics,
        total == 0 ? 0d : (double) refusedQueries.get() / total,
        authFailures.get(),
        feedbackCount == 0 ? 0d : (double) feedbackHelpful.get() / feedbackCount,
        citedDocuments.entrySet().stream()
            .sorted(Map.Entry.<String, AtomicLong>comparingByValue(Comparator.comparingLong(AtomicLong::get)).reversed())
            .limit(5)
            .map(Map.Entry::getKey)
            .toList());
  }

  private long p95(InternalAssistantMode mode) {
    var latencies = latencyByMode.get(mode);
    if (latencies == null || latencies.isEmpty()) {
      return 0L;
    }
    List<Long> snapshot;
    synchronized (latencies) {
      snapshot = latencies.stream().sorted().toList();
    }
    var index = Math.max(0, (int) Math.ceil(snapshot.size() * 0.95) - 1);
    return snapshot.get(index);
  }
}

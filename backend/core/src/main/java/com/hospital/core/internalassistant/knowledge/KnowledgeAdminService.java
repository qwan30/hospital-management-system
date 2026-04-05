package com.hospital.core.internalassistant.knowledge;

import com.hospital.core.audit.AuditLogService;
import com.hospital.core.common.NotFoundException;
import com.hospital.shared.internalassistant.InternalAssistantKnowledgeChunkResponse;
import com.hospital.shared.internalassistant.InternalAssistantKnowledgeDocumentDetailResponse;
import com.hospital.shared.internalassistant.InternalAssistantKnowledgeDocumentResponse;
import com.hospital.shared.internalassistant.InternalAssistantKnowledgeIngestionResponse;
import com.hospital.shared.internalassistant.KnowledgeDocumentStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KnowledgeAdminService {
  private final AuditLogService auditLogService;
  private final KnowledgeChunkRepository knowledgeChunkRepository;
  private final KnowledgeDocumentIngestionRepository knowledgeDocumentIngestionRepository;
  private final KnowledgeDocumentIngestionService knowledgeDocumentIngestionService;
  private final KnowledgeDocumentRepository knowledgeDocumentRepository;

  public KnowledgeAdminService(
      AuditLogService auditLogService,
      KnowledgeChunkRepository knowledgeChunkRepository,
      KnowledgeDocumentIngestionRepository knowledgeDocumentIngestionRepository,
      KnowledgeDocumentIngestionService knowledgeDocumentIngestionService,
      KnowledgeDocumentRepository knowledgeDocumentRepository) {
    this.auditLogService = auditLogService;
    this.knowledgeChunkRepository = knowledgeChunkRepository;
    this.knowledgeDocumentIngestionRepository = knowledgeDocumentIngestionRepository;
    this.knowledgeDocumentIngestionService = knowledgeDocumentIngestionService;
    this.knowledgeDocumentRepository = knowledgeDocumentRepository;
  }

  @Transactional(readOnly = true)
  public List<InternalAssistantKnowledgeDocumentResponse> listDocuments() {
    return knowledgeDocumentRepository.findAllByOrderByUpdatedAtDesc().stream()
        .map(this::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public InternalAssistantKnowledgeDocumentDetailResponse getDocumentDetail(UUID documentId) {
    var document = knowledgeDocumentRepository.findById(documentId)
        .orElseThrow(() -> new NotFoundException("Knowledge document not found"));
    var chunks = knowledgeChunkRepository.findByDocumentIdOrderByChunkIndexAsc(documentId).stream()
        .map(chunk -> new InternalAssistantKnowledgeChunkResponse(
            chunk.getId(),
            chunk.getHeading(),
            chunk.getReferenceKey(),
            chunk.getContent()))
        .toList();
    return new InternalAssistantKnowledgeDocumentDetailResponse(toResponse(document), chunks);
  }

  @Transactional(readOnly = true)
  public InternalAssistantKnowledgeIngestionResponse getLatestIngestion(UUID documentId) {
    knowledgeDocumentRepository.findById(documentId)
        .orElseThrow(() -> new NotFoundException("Knowledge document not found"));
    return knowledgeDocumentIngestionRepository.findFirstByDocumentIdOrderByCreatedAtDesc(documentId)
        .map(this::toIngestionResponse)
        .orElse(null);
  }

  @Transactional
  public InternalAssistantKnowledgeDocumentResponse uploadDocument(
      UUID actorId,
      String title,
      String category,
      String summary,
      String version,
      String owner,
      LocalDate effectiveDate,
      List<String> tags,
      String sourceFilename,
      String mimeType,
      String rawContent) {
    var now = Instant.now();
    var document = new KnowledgeDocumentEntity();
    document.setDocumentKey(buildDocumentKey(title));
    document.setTitle(title.trim());
    document.setCategory(category.trim());
    document.setSummary(blankToNull(summary));
    document.setVersion(defaultIfBlank(version, "1.0"));
    document.setOwner(defaultIfBlank(owner, "Internal Operations"));
    document.setEffectiveDate(effectiveDate == null ? LocalDate.now() : effectiveDate);
    document.setTags(String.join(",", normalizeTags(tags)));
    document.setSourceFilename(sourceFilename);
    document.setSourcePath("upload://" + sourceFilename);
    document.setMimeType(blankToNull(mimeType));
    document.setRawContent(rawContent);
    document.setStatus(KnowledgeDocumentStatus.DRAFT);
    document.setActive(false);
    document.setRevokedAt(null);
    document.setActivatedAt(null);
    document = knowledgeDocumentRepository.save(document);
    knowledgeDocumentIngestionService.ingest(document);

    auditLogService.record(actorId, "KNOWLEDGE_DOCUMENT_UPLOAD", "KNOWLEDGE_DOCUMENT", document.getId(), Map.of(
        "documentKey", document.getDocumentKey(),
        "status", document.getStatus().name(),
        "sourceFilename", sourceFilename,
        "uploadedAt", now.toString()));
    return toResponse(document);
  }

  @Transactional
  public InternalAssistantKnowledgeDocumentResponse activateDocument(UUID actorId, UUID documentId) {
    var document = requireDocument(documentId);
    document.setStatus(KnowledgeDocumentStatus.ACTIVE);
    document.setActive(true);
    document.setActivatedAt(Instant.now());
    document.setRevokedAt(null);
    auditLogService.record(actorId, "KNOWLEDGE_DOCUMENT_ACTIVATE", "KNOWLEDGE_DOCUMENT", document.getId(), Map.of(
        "documentKey", document.getDocumentKey(),
        "status", document.getStatus().name()));
    return toResponse(document);
  }

  @Transactional
  public InternalAssistantKnowledgeDocumentResponse revokeDocument(UUID actorId, UUID documentId) {
    var document = requireDocument(documentId);
    document.setStatus(KnowledgeDocumentStatus.REVOKED);
    document.setActive(false);
    document.setRevokedAt(Instant.now());
    auditLogService.record(actorId, "KNOWLEDGE_DOCUMENT_REVOKE", "KNOWLEDGE_DOCUMENT", document.getId(), Map.of(
        "documentKey", document.getDocumentKey(),
        "status", document.getStatus().name()));
    return toResponse(document);
  }

  @Transactional
  public InternalAssistantKnowledgeDocumentResponse reindexDocument(UUID actorId, UUID documentId) {
    var document = requireDocument(documentId);
    knowledgeDocumentIngestionService.ingest(document);
    auditLogService.record(actorId, "KNOWLEDGE_DOCUMENT_REINDEX", "KNOWLEDGE_DOCUMENT", document.getId(), Map.of(
        "documentKey", document.getDocumentKey(),
        "status", document.getStatus().name()));
    return toResponse(document);
  }

  private KnowledgeDocumentEntity requireDocument(UUID documentId) {
    return knowledgeDocumentRepository.findById(documentId)
        .orElseThrow(() -> new NotFoundException("Knowledge document not found"));
  }

  private InternalAssistantKnowledgeDocumentResponse toResponse(KnowledgeDocumentEntity document) {
    return new InternalAssistantKnowledgeDocumentResponse(
        document.getId(),
        document.getDocumentKey(),
        document.getTitle(),
        document.getCategory(),
        document.getStatus(),
        document.getVersion(),
        document.getOwner(),
        document.getEffectiveDate(),
        normalizeTags(document.getTags() == null ? List.of() : List.of(document.getTags().split(","))),
        document.getSourceFilename(),
        document.getSourcePath(),
        document.getSummary(),
        document.getUpdatedAt(),
        knowledgeDocumentIngestionRepository.findFirstByDocumentIdOrderByCreatedAtDesc(document.getId())
            .map(KnowledgeDocumentIngestionEntity::getStage)
            .orElse(null));
  }

  private InternalAssistantKnowledgeIngestionResponse toIngestionResponse(KnowledgeDocumentIngestionEntity ingestion) {
    return new InternalAssistantKnowledgeIngestionResponse(
        ingestion.getId(),
        ingestion.getDocument().getId(),
        ingestion.getStage(),
        ingestion.getErrorMessage(),
        ingestion.getStartedAt(),
        ingestion.getCompletedAt(),
        ingestion.getUpdatedAt());
  }

  private String buildDocumentKey(String title) {
    var slug = title.toLowerCase(Locale.ROOT)
        .replaceAll("[^\\p{L}\\p{Nd}]+", "-")
        .replaceAll("(^-|-$)", "");
    return slug + "-" + UUID.randomUUID().toString().substring(0, 8);
  }

  private List<String> normalizeTags(List<String> tags) {
    return tags.stream()
        .map(tag -> tag == null ? "" : tag.trim())
        .filter(tag -> !tag.isBlank())
        .distinct()
        .toList();
  }

  private String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }

  private String defaultIfBlank(String value, String fallback) {
    return value == null || value.isBlank() ? fallback : value.trim();
  }
}

package com.hospital.api.admin;

import com.hospital.core.internalassistant.knowledge.KnowledgeAdminService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.internalassistant.InternalAssistantKnowledgeDocumentDetailResponse;
import com.hospital.shared.internalassistant.InternalAssistantKnowledgeDocumentResponse;
import com.hospital.shared.internalassistant.InternalAssistantKnowledgeIngestionResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/knowledge-documents")
@PreAuthorize("hasRole('ADMIN')")
public class AdminKnowledgeDocumentController {
  private static final long MAX_UPLOAD_BYTES = 1_048_576L;

  private final KnowledgeAdminService knowledgeAdminService;

  public AdminKnowledgeDocumentController(KnowledgeAdminService knowledgeAdminService) {
    this.knowledgeAdminService = knowledgeAdminService;
  }

  @GetMapping
  public ApiResponse<List<InternalAssistantKnowledgeDocumentResponse>> listDocuments() {
    return ApiResponse.ok(knowledgeAdminService.listDocuments());
  }

  @GetMapping("/{documentId}")
  public ApiResponse<InternalAssistantKnowledgeDocumentDetailResponse> getDocumentDetail(@PathVariable UUID documentId) {
    return ApiResponse.ok(knowledgeAdminService.getDocumentDetail(documentId));
  }

  @GetMapping("/{documentId}/ingestion")
  public ApiResponse<InternalAssistantKnowledgeIngestionResponse> getIngestion(@PathVariable UUID documentId) {
    return ApiResponse.ok(knowledgeAdminService.getLatestIngestion(documentId));
  }

  @PostMapping
  public ApiResponse<InternalAssistantKnowledgeDocumentResponse> uploadDocument(
      @RequestParam("file") MultipartFile file,
      @RequestParam String title,
      @RequestParam String category,
      @RequestParam(required = false) String summary,
      @RequestParam(required = false) String version,
      @RequestParam(required = false) String owner,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate effectiveDate,
      @RequestParam(required = false) String tags,
      Authentication authentication) throws Exception {
    validateFile(file);
    return ApiResponse.ok(knowledgeAdminService.uploadDocument(
        UUID.fromString(authentication.getName()),
        title,
        category,
        summary,
        version,
        owner,
        effectiveDate,
        parseTags(tags),
        file.getOriginalFilename(),
        file.getContentType(),
        new String(file.getBytes(), StandardCharsets.UTF_8)));
  }

  @PostMapping("/{documentId}/activate")
  public ApiResponse<InternalAssistantKnowledgeDocumentResponse> activateDocument(
      @PathVariable UUID documentId,
      Authentication authentication) {
    return ApiResponse.ok(knowledgeAdminService.activateDocument(UUID.fromString(authentication.getName()), documentId));
  }

  @PostMapping("/{documentId}/revoke")
  public ApiResponse<InternalAssistantKnowledgeDocumentResponse> revokeDocument(
      @PathVariable UUID documentId,
      Authentication authentication) {
    return ApiResponse.ok(knowledgeAdminService.revokeDocument(UUID.fromString(authentication.getName()), documentId));
  }

  @PostMapping("/{documentId}/reindex")
  public ApiResponse<InternalAssistantKnowledgeDocumentResponse> reindexDocument(
      @PathVariable UUID documentId,
      Authentication authentication) {
    return ApiResponse.ok(knowledgeAdminService.reindexDocument(UUID.fromString(authentication.getName()), documentId));
  }

  private void validateFile(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("Knowledge document file is required");
    }
    if (file.getSize() > MAX_UPLOAD_BYTES) {
      throw new IllegalArgumentException("Knowledge document file must be 1MB or smaller");
    }
    var filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
    if (!(filename.endsWith(".md") || filename.endsWith(".markdown") || filename.endsWith(".txt"))) {
      throw new IllegalArgumentException("Knowledge document file must be .md, .markdown, or .txt");
    }
  }

  private List<String> parseTags(String tags) {
    if (tags == null || tags.isBlank()) {
      return List.of();
    }
    return Arrays.stream(tags.split(","))
        .map(String::trim)
        .filter(tag -> !tag.isBlank())
        .distinct()
        .toList();
  }
}

package com.hospital.api.admin;

import com.hospital.core.content.ContentAdminService;
import com.hospital.shared.admin.AdminNewsArticleUpsertRequest;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.publicsite.NewsArticleResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/news")
@PreAuthorize("hasRole('ADMIN')")
public class AdminNewsController {
  private final ContentAdminService contentAdminService;

  public AdminNewsController(ContentAdminService contentAdminService) {
    this.contentAdminService = contentAdminService;
  }

  @GetMapping
  public ApiResponse<List<NewsArticleResponse>> listNews() {
    return ApiResponse.ok(contentAdminService.listAllNews());
  }

  @PostMapping
  public ApiResponse<NewsArticleResponse> createNews(
      @Valid @RequestBody AdminNewsArticleUpsertRequest request) {
    return ApiResponse.ok(contentAdminService.createNews(request));
  }

  @PutMapping("/{articleId}")
  public ApiResponse<NewsArticleResponse> updateNews(
      @PathVariable UUID articleId,
      @Valid @RequestBody AdminNewsArticleUpsertRequest request) {
    return ApiResponse.ok(contentAdminService.updateNews(articleId, request));
  }
}

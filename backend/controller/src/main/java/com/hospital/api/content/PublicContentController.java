package com.hospital.api.content;

import com.hospital.core.content.PublicContentService;
import com.hospital.shared.api.ApiResponse;
import com.hospital.shared.publicsite.HomePageContentResponse;
import com.hospital.shared.publicsite.NewsArticleResponse;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class PublicContentController {
  private final PublicContentService publicContentService;

  public PublicContentController(PublicContentService publicContentService) {
    this.publicContentService = publicContentService;
  }

  @GetMapping("/content/home")
  public ApiResponse<HomePageContentResponse> getHomeContent() {
    return ApiResponse.ok(publicContentService.getHomePageContent());
  }

  @GetMapping("/news")
  public ApiResponse<List<NewsArticleResponse>> listNews() {
    return ApiResponse.ok(publicContentService.listNewsArticles());
  }

  @GetMapping("/news/{slug}")
  public ApiResponse<NewsArticleResponse> getNewsArticle(@PathVariable String slug) {
    NewsArticleResponse article = publicContentService.getNewsArticleBySlug(slug);
    if (article == null) {
      return ApiResponse.fail("NOT_FOUND", "Article not found");
    }
    return ApiResponse.ok(article);
  }

  @GetMapping("/news/archive")
  public ApiResponse<Page<NewsArticleResponse>> getArchivedNews(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    return ApiResponse.ok(publicContentService.getArchivedNews(page, size));
  }
}

package com.hospital.core.content;

import com.hospital.core.shared.HospitalProfileProperties;
import com.hospital.shared.publicsite.HomePageContentResponse;
import com.hospital.shared.publicsite.HospitalContentSectionResponse;
import com.hospital.shared.publicsite.NewsArticleResponse;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PublicContentService {
  private final HospitalContentSectionRepository hospitalContentSectionRepository;
  private final NewsArticleRepository newsArticleRepository;
  private final HospitalProfileProperties hospitalProfileProperties;

  public PublicContentService(
      HospitalContentSectionRepository hospitalContentSectionRepository,
      NewsArticleRepository newsArticleRepository,
      HospitalProfileProperties hospitalProfileProperties) {
    this.hospitalContentSectionRepository = hospitalContentSectionRepository;
    this.newsArticleRepository = newsArticleRepository;
    this.hospitalProfileProperties = hospitalProfileProperties;
  }

  @Transactional(readOnly = true)
  public HomePageContentResponse getHomePageContent() {
    var sections = hospitalContentSectionRepository.findByActiveTrueOrderBySortOrderAscTitleAsc().stream()
        .map(this::toSectionResponse)
        .toList();
    return new HomePageContentResponse(
        fallback(hospitalProfileProperties.name(), "Hospital Management System"),
        fallback(hospitalProfileProperties.address(), "123 ABC Street, District 1, Ho Chi Minh City"),
        fallback(hospitalProfileProperties.phone(), "028 1234 5678"),
        fallback(hospitalProfileProperties.mapsEmbedUrl(), "https://www.google.com/maps?q=10.7769,106.7009&z=15&output=embed"),
        fallback(hospitalProfileProperties.privacyPolicyUrl(), "/privacy"),
        fallback(hospitalProfileProperties.facebookUrl(), "https://facebook.com"),
        fallback(hospitalProfileProperties.youtubeUrl(), "https://youtube.com"),
        sections.isEmpty() ? defaultSections() : sections);
  }

  @Transactional(readOnly = true)
  public List<NewsArticleResponse> listNewsArticles() {
    var articles = newsArticleRepository.findByActiveTrueOrderByPublishedAtDesc().stream()
        .map(this::toNewsResponse)
        .toList();
    return articles.isEmpty() ? defaultNewsArticles() : articles;
  }

  HospitalContentSectionResponse toSectionResponse(HospitalContentSectionEntity entity) {
    return new HospitalContentSectionResponse(
        entity.getId(),
        entity.getSlug(),
        entity.getTitle(),
        entity.getBody(),
        entity.getImageUrl(),
        entity.getCtaLabel(),
        entity.getCtaHref(),
        entity.getSortOrder());
  }

  NewsArticleResponse toNewsResponse(NewsArticleEntity entity) {
    return new NewsArticleResponse(
        entity.getId(),
        entity.getSlug(),
        entity.getTitle(),
        entity.getSummary(),
        entity.getContent(),
        entity.getImageUrl(),
        entity.getPublishedAt());
  }

  private List<HospitalContentSectionResponse> defaultSections() {
    return List.of(
        new HospitalContentSectionResponse(null, "mission", "Trusted care for every visit",
            "Modern booking, coordinated clinical workflows, and clear follow-up communication.",
            null, "Book an appointment", "/booking", 1),
        new HospitalContentSectionResponse(null, "services", "Specialties and patient services",
            "Explore departments, doctors, preventive screening, and post-visit follow-up support.",
            null, "Explore departments", "/departments", 2));
  }

  private List<NewsArticleResponse> defaultNewsArticles() {
    return List.of(
        new NewsArticleResponse(null, "evening-clinic", "Expanded evening clinic hours",
            "Selected departments now support evening appointments for working families.",
            "Selected departments now support evening appointments for working families.",
            null,
            Instant.parse("2026-03-01T00:00:00Z")),
        new NewsArticleResponse(null, "digital-follow-up", "Digital follow-up reminders are live",
            "Patients now receive automated reminders before follow-up appointments.",
            "Patients now receive automated reminders before follow-up appointments.",
            null,
            Instant.parse("2026-03-05T00:00:00Z")));
  }

  private String fallback(String value, String fallbackValue) {
    return value == null || value.isBlank() ? fallbackValue : value;
  }
}

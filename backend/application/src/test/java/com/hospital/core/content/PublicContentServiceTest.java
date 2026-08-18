package com.hospital.core.content;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.hospital.core.shared.HospitalProfileProperties;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PublicContentServiceTest {

  @Mock
  private HospitalContentSectionRepository hospitalContentSectionRepository;

  @Mock
  private NewsArticleRepository newsArticleRepository;

  @Mock
  private HospitalProfileProperties hospitalProfileProperties;

  @InjectMocks
  private PublicContentService publicContentService;

  @BeforeEach
  void setUp() {
  }

  @Test
  void getHomePageContent_withNoSections_returnsDefaultsAndProfileProperties() {
    when(hospitalProfileProperties.name()).thenReturn("Custom Name");
    when(hospitalProfileProperties.address()).thenReturn("Custom Address");
    when(hospitalProfileProperties.phone()).thenReturn("9999");
    when(hospitalProfileProperties.mapsEmbedUrl()).thenReturn("http://maps");
    when(hospitalProfileProperties.privacyPolicyUrl()).thenReturn("/privacy-custom");
    when(hospitalProfileProperties.facebookUrl()).thenReturn("fb");
    when(hospitalProfileProperties.youtubeUrl()).thenReturn("yt");

    when(hospitalContentSectionRepository.findByActiveTrueOrderBySortOrderAscTitleAsc())
        .thenReturn(List.of());

    var content = publicContentService.getHomePageContent();

    assertThat(content.hospitalName()).isEqualTo("Custom Name");
    assertThat(content.hospitalAddress()).isEqualTo("Custom Address");
    assertThat(content.hospitalPhone()).isEqualTo("9999");
    assertThat(content.mapsEmbedUrl()).isEqualTo("http://maps");
    assertThat(content.privacyPolicyUrl()).isEqualTo("/privacy-custom");
    assertThat(content.facebookUrl()).isEqualTo("fb");
    assertThat(content.youtubeUrl()).isEqualTo("yt");
    
    assertThat(content.sections()).hasSize(2);
    assertThat(content.sections().get(0).slug()).isEqualTo("mission");
    assertThat(content.sections().get(1).slug()).isEqualTo("services");
  }

  @Test
  void getHomePageContent_withActiveSections_returnsMappedSections() {
    var section = new HospitalContentSectionEntity();
    section.setId(UUID.randomUUID());
    section.setSlug("test-slug");
    section.setTitle("Test Title");
    section.setBody("Test Body");
    section.setImageUrl("http://image");
    section.setCtaLabel("Click");
    section.setCtaHref("/href");
    section.setSortOrder(5);
    section.setActive(true);

    when(hospitalContentSectionRepository.findByActiveTrueOrderBySortOrderAscTitleAsc())
        .thenReturn(List.of(section));

    var content = publicContentService.getHomePageContent();

    assertThat(content.sections()).hasSize(1);
    var mapped = content.sections().get(0);
    assertThat(mapped.slug()).isEqualTo("test-slug");
    assertThat(mapped.title()).isEqualTo("Test Title");
    assertThat(mapped.body()).isEqualTo("Test Body");
    assertThat(mapped.imageUrl()).isEqualTo("http://image");
    assertThat(mapped.ctaLabel()).isEqualTo("Click");
    assertThat(mapped.ctaHref()).isEqualTo("/href");
    assertThat(mapped.sortOrder()).isEqualTo(5);
  }

  @Test
  void listNewsArticles_emptyReturnsDefaults() {
    when(newsArticleRepository.findByActiveTrueOrderByPublishedAtDesc()).thenReturn(List.of());

    var articles = publicContentService.listNewsArticles();
    assertThat(articles).hasSize(6);
    assertThat(articles.get(0).slug()).isEqualTo("evening-clinic");
    assertThat(articles.get(1).slug()).isEqualTo("digital-follow-up");
  }

  @Test
  void getNewsArticleBySlug_whenNotInDb_fallsBackToDefaults() {
    when(newsArticleRepository.findBySlugIgnoreCase("digital-follow-up")).thenReturn(java.util.Optional.empty());

    var article = publicContentService.getNewsArticleBySlug("digital-follow-up");
    assertThat(article).isNotNull();
    assertThat(article.slug()).isEqualTo("digital-follow-up");
    assertThat(article.title()).contains("Digital Follow-Up");
  }

  @Test
  void getNewsArticleBySlug_whenUnknown_returnsNull() {
    when(newsArticleRepository.findBySlugIgnoreCase("totally-unknown-slug")).thenReturn(java.util.Optional.empty());

    var article = publicContentService.getNewsArticleBySlug("totally-unknown-slug");
    assertThat(article).isNull();
  }

  @Test
  void getArchivedNews_whenEmptyDb_returnsPagedDefaults() {
    when(newsArticleRepository.findByActiveTrueOrderByPublishedAtDesc(org.mockito.ArgumentMatchers.any(org.springframework.data.domain.Pageable.class)))
        .thenReturn(new org.springframework.data.domain.PageImpl<>(List.of()));

    var page = publicContentService.getArchivedNews(0, 3);
    assertThat(page.getContent()).hasSize(3);
    assertThat(page.getTotalElements()).isEqualTo(6);
  }

  @Test
  void listNewsArticles_withArticlesReturnsMapped() {
    var article = new NewsArticleEntity();
    article.setId(UUID.randomUUID());
    article.setSlug("new-article");
    article.setTitle("Title");
    article.setSummary("Summary");
    article.setContent("Content");
    article.setImageUrl("http://img");
    article.setPublishedAt(Instant.parse("2026-06-23T10:00:00Z"));

    when(newsArticleRepository.findByActiveTrueOrderByPublishedAtDesc())
        .thenReturn(List.of(article));

    var articles = publicContentService.listNewsArticles();
    assertThat(articles).hasSize(1);
    var mapped = articles.get(0);
    assertThat(mapped.slug()).isEqualTo("new-article");
    assertThat(mapped.title()).isEqualTo("Title");
    assertThat(mapped.summary()).isEqualTo("Summary");
    assertThat(mapped.content()).isEqualTo("Content");
    assertThat(mapped.imageUrl()).isEqualTo("http://img");
    assertThat(mapped.publishedAt()).isEqualTo(Instant.parse("2026-06-23T10:00:00Z"));
  }

  @Test
  void getHomePageContent_withBlankProfileProperties_returnsFallbacks() {
    when(hospitalProfileProperties.name()).thenReturn(null);
    when(hospitalProfileProperties.address()).thenReturn(" ");
    when(hospitalProfileProperties.phone()).thenReturn("");
    when(hospitalProfileProperties.mapsEmbedUrl()).thenReturn(null);
    when(hospitalProfileProperties.privacyPolicyUrl()).thenReturn(null);
    when(hospitalProfileProperties.facebookUrl()).thenReturn(null);
    when(hospitalProfileProperties.youtubeUrl()).thenReturn(null);

    when(hospitalContentSectionRepository.findByActiveTrueOrderBySortOrderAscTitleAsc())
        .thenReturn(List.of());

    var content = publicContentService.getHomePageContent();

    assertThat(content.hospitalName()).isEqualTo("Hospital Management System");
    assertThat(content.hospitalAddress()).isEqualTo("123 ABC Street, District 1, Ho Chi Minh City");
    assertThat(content.hospitalPhone()).isEqualTo("028 1234 5678");
    assertThat(content.mapsEmbedUrl()).isEqualTo("https://www.google.com/maps?q=10.7769,106.7009&z=15&output=embed");
    assertThat(content.privacyPolicyUrl()).isEqualTo("/privacy");
    assertThat(content.facebookUrl()).isEqualTo("https://facebook.com");
    assertThat(content.youtubeUrl()).isEqualTo("https://youtube.com");
  }
}

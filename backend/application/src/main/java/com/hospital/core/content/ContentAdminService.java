package com.hospital.core.content;

import com.hospital.core.common.ConflictException;
import com.hospital.core.common.NotFoundException;
import com.hospital.shared.admin.AdminContentSectionUpsertRequest;
import com.hospital.shared.admin.AdminNewsArticleUpsertRequest;
import com.hospital.shared.publicsite.HospitalContentSectionResponse;
import com.hospital.shared.publicsite.NewsArticleResponse;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ContentAdminService {
  private final HospitalContentSectionRepository hospitalContentSectionRepository;
  private final NewsArticleRepository newsArticleRepository;
  private final PublicContentService publicContentService;

  public ContentAdminService(
      HospitalContentSectionRepository hospitalContentSectionRepository,
      NewsArticleRepository newsArticleRepository,
      PublicContentService publicContentService) {
    this.hospitalContentSectionRepository = hospitalContentSectionRepository;
    this.newsArticleRepository = newsArticleRepository;
    this.publicContentService = publicContentService;
  }

  @Transactional(readOnly = true)
  public List<HospitalContentSectionResponse> listSections() {
    return hospitalContentSectionRepository.findAllByOrderBySortOrderAscTitleAsc().stream()
        .map(publicContentService::toSectionResponse)
        .toList();
  }

  @Transactional
  public HospitalContentSectionResponse createSection(AdminContentSectionUpsertRequest request) {
    if (hospitalContentSectionRepository.findBySlugIgnoreCase(request.slug()).isPresent()) {
      throw new ConflictException("Content section slug already exists");
    }
    var entity = new HospitalContentSectionEntity();
    applySection(entity, request);
    return publicContentService.toSectionResponse(hospitalContentSectionRepository.save(entity));
  }

  @Transactional
  public HospitalContentSectionResponse updateSection(UUID sectionId, AdminContentSectionUpsertRequest request) {
    var entity = hospitalContentSectionRepository.findById(sectionId)
        .orElseThrow(() -> new NotFoundException("Content section not found"));
    applySection(entity, request);
    return publicContentService.toSectionResponse(entity);
  }

  @Transactional(readOnly = true)
  public List<NewsArticleResponse> listAllNews() {
    return newsArticleRepository.findAllByOrderByPublishedAtDesc().stream()
        .map(publicContentService::toNewsResponse)
        .toList();
  }

  @Transactional
  public NewsArticleResponse createNews(AdminNewsArticleUpsertRequest request) {
    if (newsArticleRepository.findBySlugIgnoreCase(request.slug()).isPresent()) {
      throw new ConflictException("News article slug already exists");
    }
    var entity = new NewsArticleEntity();
    applyNews(entity, request);
    return publicContentService.toNewsResponse(newsArticleRepository.save(entity));
  }

  @Transactional
  public NewsArticleResponse updateNews(UUID articleId, AdminNewsArticleUpsertRequest request) {
    var entity = newsArticleRepository.findById(articleId)
        .orElseThrow(() -> new NotFoundException("News article not found"));
    applyNews(entity, request);
    return publicContentService.toNewsResponse(entity);
  }

  private void applySection(HospitalContentSectionEntity entity, AdminContentSectionUpsertRequest request) {
    entity.setSlug(request.slug().trim().toLowerCase());
    entity.setTitle(request.title().trim());
    entity.setBody(request.body());
    entity.setImageUrl(request.imageUrl());
    entity.setCtaLabel(request.ctaLabel());
    entity.setCtaHref(request.ctaHref());
    entity.setSortOrder(request.sortOrder());
    entity.setActive(request.active() == null ? true : request.active());
  }

  private void applyNews(NewsArticleEntity entity, AdminNewsArticleUpsertRequest request) {
    entity.setSlug(request.slug().trim().toLowerCase());
    entity.setTitle(request.title().trim());
    entity.setSummary(request.summary().trim());
    entity.setContent(request.content());
    entity.setImageUrl(request.imageUrl());
    entity.setPublishedAt(request.publishedAt() == null ? Instant.now() : request.publishedAt());
    entity.setActive(request.active() == null ? true : request.active());
  }
}

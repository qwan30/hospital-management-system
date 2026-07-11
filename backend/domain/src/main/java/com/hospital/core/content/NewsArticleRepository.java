package com.hospital.core.content;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsArticleRepository extends JpaRepository<NewsArticleEntity, UUID> {
  List<NewsArticleEntity> findByActiveTrueOrderByPublishedAtDesc();
  org.springframework.data.domain.Page<NewsArticleEntity> findByActiveTrueOrderByPublishedAtDesc(org.springframework.data.domain.Pageable pageable);

  List<NewsArticleEntity> findAllByOrderByPublishedAtDesc();

  Optional<NewsArticleEntity> findBySlugIgnoreCase(String slug);
}

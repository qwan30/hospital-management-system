package com.hospital.core.content;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NewsArticleRepository extends JpaRepository<NewsArticleEntity, UUID> {
  List<NewsArticleEntity> findByActiveTrueOrderByPublishedAtDesc();

  List<NewsArticleEntity> findAllByOrderByPublishedAtDesc();

  Optional<NewsArticleEntity> findBySlugIgnoreCase(String slug);
}

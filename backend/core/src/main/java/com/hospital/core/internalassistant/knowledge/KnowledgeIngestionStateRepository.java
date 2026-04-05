package com.hospital.core.internalassistant.knowledge;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KnowledgeIngestionStateRepository extends JpaRepository<KnowledgeIngestionStateEntity, UUID> {
  Optional<KnowledgeIngestionStateEntity> findByCorpusVersion(String corpusVersion);
}

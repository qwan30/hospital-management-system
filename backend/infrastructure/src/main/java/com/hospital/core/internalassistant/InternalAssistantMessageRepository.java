package com.hospital.core.internalassistant;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternalAssistantMessageRepository extends JpaRepository<InternalAssistantMessageEntity, UUID> {
  @EntityGraph(attributePaths = {"session"})
  List<InternalAssistantMessageEntity> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);

  @EntityGraph(attributePaths = {"session", "session.actor"})
  Optional<InternalAssistantMessageEntity> findById(UUID messageId);
}

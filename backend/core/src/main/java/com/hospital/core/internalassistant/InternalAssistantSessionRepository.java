package com.hospital.core.internalassistant;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternalAssistantSessionRepository extends JpaRepository<InternalAssistantSessionEntity, UUID> {
  Optional<InternalAssistantSessionEntity> findBySessionKey(String sessionKey);

  @EntityGraph(attributePaths = {"actor"})
  Optional<InternalAssistantSessionEntity> findByIdAndActorId(UUID sessionId, UUID actorId);
}

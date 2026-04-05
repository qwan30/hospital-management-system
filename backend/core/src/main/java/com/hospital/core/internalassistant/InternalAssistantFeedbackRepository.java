package com.hospital.core.internalassistant;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InternalAssistantFeedbackRepository extends JpaRepository<InternalAssistantFeedbackEntity, UUID> {
  @EntityGraph(attributePaths = {"message", "actor"})
  Optional<InternalAssistantFeedbackEntity> findByMessageId(UUID messageId);
}

package com.hospital.core.internalassistant.knowledge;

import com.hospital.shared.internalassistant.KnowledgeDocumentStatus;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KnowledgeCorpusSeeder {
  private final KnowledgeDocumentIngestionService knowledgeDocumentIngestionService;
  private final KnowledgeDocumentRepository knowledgeDocumentRepository;

  public KnowledgeCorpusSeeder(
      KnowledgeDocumentIngestionService knowledgeDocumentIngestionService,
      KnowledgeDocumentRepository knowledgeDocumentRepository) {
    this.knowledgeDocumentIngestionService = knowledgeDocumentIngestionService;
    this.knowledgeDocumentRepository = knowledgeDocumentRepository;
  }

  @Transactional
  public void seedIfEmpty() {
    if (knowledgeDocumentRepository.count() > 0) {
      return;
    }

    for (KnowledgeSeed seed : defaultSeeds()) {
      var document = new KnowledgeDocumentEntity();
      document.setDocumentKey(seed.documentKey());
      document.setTitle(seed.title());
      document.setCategory(seed.category());
      document.setSourcePath(seed.resourcePath());
      document.setSourceFilename(seed.resourcePath());
      document.setSummary(seed.summary());
      document.setVersion("seed-v1");
      document.setOwner("System Seed");
      document.setTags(String.join(",", seed.tags()));
      document.setStatus(KnowledgeDocumentStatus.ACTIVE);
      document.setActive(true);
      document.setRawContent(read(seed.resourcePath()));
      document = knowledgeDocumentRepository.save(document);
      knowledgeDocumentIngestionService.ingest(document);
    }
  }

  private List<KnowledgeSeed> defaultSeeds() {
    return List.of(
        new KnowledgeSeed(
            "medical-record-completion",
            "Medical Record Completion Policy",
            "policy",
            "knowledge/medical-record-completion.md",
            "How clinicians complete diagnoses, SOAP notes, prescriptions, and follow-up plans.",
            List.of("medical record", "diagnosis", "prescription", "follow-up", "emr", "clinical note")),
        new KnowledgeSeed(
            "follow-up-reminders",
            "Follow-up Reminder Workflow",
            "workflow",
            "knowledge/follow-up-reminders.md",
            "Operational flow for confirming follow-up appointments and scheduling reminders.",
            List.of("follow-up", "reminder", "appointment", "workflow", "tai kham")),
        new KnowledgeSeed(
            "patient-portal-communications",
            "Patient Portal Communication SOP",
            "sop",
            "knowledge/patient-portal-communications.md",
            "Guidance for reviewing lab results, patient messages, and portal communications.",
            List.of("patient portal", "lab result", "patient message", "portal communications", "xet nghiem")));
  }

  private String read(String resourcePath) {
    try {
      return new ClassPathResource(resourcePath).getContentAsString(StandardCharsets.UTF_8);
    } catch (IOException exception) {
      throw new IllegalStateException("Unable to read knowledge resource " + resourcePath, exception);
    }
  }

  private record KnowledgeSeed(
      String documentKey,
      String title,
      String category,
      String resourcePath,
      String summary,
      List<String> tags
  ) {}
}

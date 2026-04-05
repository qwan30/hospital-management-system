package com.hospital.core.internalassistant.knowledge;

import com.hospital.shared.internalassistant.KnowledgeIngestionStage;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class KnowledgeDocumentIngestionService {
  private final KnowledgeChunkRepository knowledgeChunkRepository;
  private final KnowledgeDocumentIngestionRepository knowledgeDocumentIngestionRepository;
  private final KnowledgeEdgeRepository knowledgeEdgeRepository;
  private final KnowledgeNodeRepository knowledgeNodeRepository;

  public KnowledgeDocumentIngestionService(
      KnowledgeChunkRepository knowledgeChunkRepository,
      KnowledgeDocumentIngestionRepository knowledgeDocumentIngestionRepository,
      KnowledgeEdgeRepository knowledgeEdgeRepository,
      KnowledgeNodeRepository knowledgeNodeRepository) {
    this.knowledgeChunkRepository = knowledgeChunkRepository;
    this.knowledgeDocumentIngestionRepository = knowledgeDocumentIngestionRepository;
    this.knowledgeEdgeRepository = knowledgeEdgeRepository;
    this.knowledgeNodeRepository = knowledgeNodeRepository;
  }

  @Transactional
  public KnowledgeDocumentIngestionEntity ingest(KnowledgeDocumentEntity document) {
    var ingestion = new KnowledgeDocumentIngestionEntity();
    ingestion.setDocument(document);
    ingestion.setStage(KnowledgeIngestionStage.UPLOADED);
    ingestion.setStartedAt(Instant.now());
    knowledgeDocumentIngestionRepository.save(ingestion);

    try {
      var content = document.getRawContent();
      if (content == null || content.isBlank()) {
        throw new IllegalArgumentException("Knowledge document content is required");
      }

      knowledgeChunkRepository.deleteByDocumentId(document.getId());
      knowledgeNodeRepository.deleteByDocumentId(document.getId());

      var sections = parseSections(content);
      for (int index = 0; index < sections.size(); index++) {
        var section = sections.get(index);
        var chunk = new KnowledgeChunkEntity();
        chunk.setDocument(document);
        chunk.setChunkIndex(index);
        chunk.setHeading(section.heading());
        chunk.setContent(section.content());
        chunk.setCitationLabel(document.getTitle() + " - " + section.heading());
        chunk.setReferenceKey(document.getDocumentKey() + "#chunk-" + index);
        knowledgeChunkRepository.save(chunk);
      }
      ingestion.setStage(KnowledgeIngestionStage.CHUNKED);
      knowledgeDocumentIngestionRepository.save(ingestion);

      var documentNode = saveNode(document, document.getDocumentKey() + ":document", document.getTitle(), "document", tags(document));
      var categoryNode = saveNode(
          document,
          document.getDocumentKey() + ":category:" + slugify(document.getCategory()),
          document.getCategory(),
          "category",
          List.of(document.getCategory()));
      saveEdge(documentNode, categoryNode, "categorized_as", 4);

      var tagNodes = new ArrayList<KnowledgeNodeEntity>();
      for (String tag : tags(document)) {
        var tagNode = saveNode(
            document,
            document.getDocumentKey() + ":tag:" + slugify(tag),
            tag,
            "tag",
            List.of(tag));
        saveEdge(documentNode, tagNode, "tagged_as", 5);
        tagNodes.add(tagNode);
      }
      ingestion.setStage(KnowledgeIngestionStage.ENTITIES_EXTRACTED);
      knowledgeDocumentIngestionRepository.save(ingestion);

      for (int index = 0; index < sections.size(); index++) {
        var section = sections.get(index);
        var headingNode = saveNode(
            document,
            document.getDocumentKey() + ":heading:" + index,
            section.heading(),
            "section",
            List.of(section.heading()));
        saveEdge(documentNode, headingNode, "contains", 4);
        for (KnowledgeNodeEntity tagNode : tagNodes) {
          saveEdge(headingNode, tagNode, "references", 2);
        }
      }
      ingestion.setStage(KnowledgeIngestionStage.EDGES_BUILT);
      ingestion.setCompletedAt(Instant.now());
      ingestion.setStage(KnowledgeIngestionStage.INDEXED);
      knowledgeDocumentIngestionRepository.save(ingestion);
      return ingestion;
    } catch (RuntimeException exception) {
      ingestion.setStage(KnowledgeIngestionStage.FAILED);
      ingestion.setErrorMessage(exception.getMessage());
      ingestion.setCompletedAt(Instant.now());
      knowledgeDocumentIngestionRepository.save(ingestion);
      throw exception;
    }
  }

  private KnowledgeNodeEntity saveNode(
      KnowledgeDocumentEntity document,
      String nodeKey,
      String name,
      String nodeType,
      List<String> aliases) {
    var node = new KnowledgeNodeEntity();
    node.setDocument(document);
    node.setNodeKey(nodeKey);
    node.setName(name);
    node.setNodeType(nodeType);
    node.setAliases(String.join(",", aliases));
    node.setDescription(name);
    return knowledgeNodeRepository.save(node);
  }

  private void saveEdge(KnowledgeNodeEntity source, KnowledgeNodeEntity target, String relationType, int weight) {
    var edge = new KnowledgeEdgeEntity();
    edge.setSourceNode(source);
    edge.setTargetNode(target);
    edge.setRelationType(relationType);
    edge.setWeight(weight);
    knowledgeEdgeRepository.save(edge);
  }

  private List<String> tags(KnowledgeDocumentEntity document) {
    if (document.getTags() == null || document.getTags().isBlank()) {
      return List.of(document.getCategory(), document.getTitle());
    }

    Set<String> tags = new LinkedHashSet<>();
    for (String tag : document.getTags().split(",")) {
      var normalized = tag.trim();
      if (!normalized.isBlank()) {
        tags.add(normalized);
      }
    }
    tags.add(document.getCategory());
    return List.copyOf(tags);
  }

  private List<KnowledgeSection> parseSections(String markdown) {
    List<KnowledgeSection> sections = new ArrayList<>();
    String currentHeading = "Overview";
    StringBuilder currentContent = new StringBuilder();

    for (String rawLine : markdown.split("\\R")) {
      var line = rawLine.trim();
      if (line.startsWith("## ")) {
        flushSection(sections, currentHeading, currentContent);
        currentHeading = line.substring(3).trim();
        currentContent = new StringBuilder();
        continue;
      }
      if (line.startsWith("# ")) {
        currentHeading = line.substring(2).trim();
        continue;
      }
      if (!line.isBlank()) {
        if (!currentContent.isEmpty()) {
          currentContent.append(' ');
        }
        currentContent.append(line.replace("- ", ""));
      }
    }

    flushSection(sections, currentHeading, currentContent);
    return sections.isEmpty() ? List.of(new KnowledgeSection("Overview", markdown.trim())) : sections;
  }

  private void flushSection(List<KnowledgeSection> sections, String heading, StringBuilder content) {
    if (!content.isEmpty()) {
      sections.add(new KnowledgeSection(heading, content.toString()));
    }
  }

  private String slugify(String value) {
    return value == null
        ? "unknown"
        : value.toLowerCase(Locale.ROOT)
            .replaceAll("[^\\p{L}\\p{Nd}]+", "-")
            .replaceAll("(^-|-$)", "");
  }

  private record KnowledgeSection(String heading, String content) {}
}

package com.hospital.shared.internalassistant;

public enum KnowledgeIngestionStage {
  UPLOADED,
  CHUNKED,
  ENTITIES_EXTRACTED,
  EDGES_BUILT,
  INDEXED,
  FAILED
}

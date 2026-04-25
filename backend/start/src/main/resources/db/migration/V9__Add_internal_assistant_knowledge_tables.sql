CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_key VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  source_path VARCHAR(255) NOT NULL,
  summary TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  heading VARCHAR(255),
  content TEXT NOT NULL,
  citation_label VARCHAR(255) NOT NULL,
  reference_key VARCHAR(160) NOT NULL UNIQUE,
  embedding vector(8),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  node_key VARCHAR(160) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  node_type VARCHAR(80) NOT NULL,
  aliases VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  relation_type VARCHAR(80) NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS knowledge_ingestion_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  corpus_version VARCHAR(80) NOT NULL UNIQUE,
  status VARCHAR(40) NOT NULL,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document
  ON knowledge_chunks(document_id, chunk_index);

CREATE INDEX IF NOT EXISTS idx_knowledge_nodes_document
  ON knowledge_nodes(document_id, node_type);

CREATE INDEX IF NOT EXISTS idx_knowledge_edges_source_target
  ON knowledge_edges(source_node_id, target_node_id);

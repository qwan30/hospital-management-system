package com.hospital.api.seed;

import com.hospital.core.internalassistant.knowledge.KnowledgeCorpusSeeder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KnowledgeSeedConfiguration {
  @Bean
  CommandLineRunner knowledgeSeedRunner(KnowledgeCorpusSeeder knowledgeCorpusSeeder) {
    return args -> knowledgeCorpusSeeder.seedIfEmpty();
  }
}

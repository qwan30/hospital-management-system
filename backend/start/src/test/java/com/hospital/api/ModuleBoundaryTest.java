package com.hospital.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Path;
import java.util.List;
import javax.xml.parsers.DocumentBuilderFactory;
import org.junit.jupiter.api.Test;
import org.w3c.dom.Element;

class ModuleBoundaryTest {
  private static final List<String> HMS_MODULES = List.of(
      "domain",
      "infrastructure",
      "application",
      "controller",
      "start");

  @Test
  void modulesKeepTheExpectedDirectDependencyGraph() throws Exception {
    assertThat(hmsDependencies("domain")).isEmpty();
    assertThat(hmsDependencies("infrastructure")).containsExactly("domain");
    assertThat(hmsDependencies("application")).containsExactly("domain", "infrastructure");
    assertThat(hmsDependencies("controller")).containsExactly("application");
    assertThat(hmsDependencies("start")).containsExactly("controller");
  }

  private List<String> hmsDependencies(String module) throws Exception {
    var pom = Path.of("..", module, "pom.xml").toAbsolutePath().normalize().toFile();
    var documentBuilder = DocumentBuilderFactory.newInstance().newDocumentBuilder();
    var document = documentBuilder.parse(pom);
    var dependencies = document.getElementsByTagName("dependency");
    var artifactIds = new java.util.ArrayList<String>();
    for (var index = 0; index < dependencies.getLength(); index++) {
      var dependency = (Element) dependencies.item(index);
      if (!"com.hospital".equals(text(dependency, "groupId"))) {
        continue;
      }
      var artifactId = text(dependency, "artifactId");
      if (HMS_MODULES.contains(artifactId)) {
        artifactIds.add(artifactId);
      }
    }
    return artifactIds;
  }

  private String text(Element dependency, String tagName) {
    var nodes = dependency.getElementsByTagName(tagName);
    return nodes.getLength() == 0 ? "" : nodes.item(0).getTextContent().trim();
  }
}

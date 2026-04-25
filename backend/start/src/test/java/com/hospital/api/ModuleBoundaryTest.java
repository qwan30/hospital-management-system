package com.hospital.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
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

  private static final Map<String, Set<String>> ALLOWED_SOURCE_IMPORTS = Map.of(
      "domain", Set.of("domain"),
      "infrastructure", Set.of("domain", "infrastructure"),
      "application", Set.of("domain", "infrastructure", "application"),
      "controller", Set.of("domain", "application", "controller"),
      "start", Set.of("domain", "infrastructure", "application", "controller", "start"));

  private static final Pattern PACKAGE_PATTERN = Pattern.compile("(?m)^package\\s+([\\w.]+);");
  private static final Pattern TYPE_PATTERN =
      Pattern.compile("(?m)^(?:public\\s+)?(?:final\\s+|abstract\\s+|sealed\\s+|non-sealed\\s+)?(?:class|interface|enum|record)\\s+(\\w+)");
  private static final Pattern IMPORT_PATTERN = Pattern.compile("(?m)^import\\s+(com\\.hospital\\.[\\w.]+);");

  @Test
  void modulesKeepTheExpectedDirectDependencyGraph() throws Exception {
    assertThat(hmsDependencies("domain")).isEmpty();
    assertThat(hmsDependencies("infrastructure")).containsExactly("domain");
    assertThat(hmsDependencies("application")).containsExactly("domain", "infrastructure");
    assertThat(hmsDependencies("controller")).containsExactly("domain", "application");
    assertThat(hmsDependencies("start")).containsExactly("domain", "infrastructure", "application", "controller");
  }

  @Test
  void sourceImportsStayWithinAllowedModuleBoundaries() throws Exception {
    var typeModules = typeModules();
    var violations = new java.util.ArrayList<String>();
    for (var module : HMS_MODULES) {
      var allowedImports = ALLOWED_SOURCE_IMPORTS.get(module);
      for (var sourceFile : sourceFiles(module)) {
        var source = Files.readString(sourceFile, StandardCharsets.UTF_8);
        var imports = IMPORT_PATTERN.matcher(source);
        while (imports.find()) {
          var importedType = resolveImportedType(imports.group(1), typeModules);
          if (importedType == null) {
            continue;
          }
          var importedModule = typeModules.get(importedType);
          if (!allowedImports.contains(importedModule)) {
            violations.add("%s imports %s from %s".formatted(
                sourceFile.getFileName(), importedType, importedModule));
          }
        }
      }
    }
    assertThat(violations).isEmpty();
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

  private Map<String, String> typeModules() throws IOException {
    var typeModules = new HashMap<String, String>();
    for (var module : HMS_MODULES) {
      for (var sourceFile : sourceFiles(module)) {
        var source = Files.readString(sourceFile, StandardCharsets.UTF_8);
        var packageMatcher = PACKAGE_PATTERN.matcher(source);
        var typeMatcher = TYPE_PATTERN.matcher(source);
        if (packageMatcher.find() && typeMatcher.find()) {
          typeModules.put(packageMatcher.group(1) + "." + typeMatcher.group(1), module);
        }
      }
    }
    return typeModules;
  }

  private List<Path> sourceFiles(String module) throws IOException {
    var roots = new HashSet<Path>();
    roots.add(Path.of("..", module, "src", "main", "java").toAbsolutePath().normalize());
    if ("start".equals(module)) {
      roots.add(Path.of("..", module, "src", "test", "java").toAbsolutePath().normalize());
    }
    var files = new java.util.ArrayList<Path>();
    for (var root : roots) {
      if (!Files.exists(root)) {
        continue;
      }
      try (var walk = Files.walk(root)) {
        walk.filter(path -> path.toString().endsWith(".java")).forEach(files::add);
      }
    }
    return files;
  }

  private String resolveImportedType(String importedName, Map<String, String> typeModules) {
    var candidate = importedName;
    while (candidate.contains(".")) {
      if (typeModules.containsKey(candidate)) {
        return candidate;
      }
      candidate = candidate.substring(0, candidate.lastIndexOf('.'));
    }
    return null;
  }

  private String text(Element dependency, String tagName) {
    var nodes = dependency.getElementsByTagName(tagName);
    return nodes.getLength() == 0 ? "" : nodes.item(0).getTextContent().trim();
  }
}

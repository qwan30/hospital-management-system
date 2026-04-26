import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { sideEffectRoutes, smokeRoutes, type RouteCase } from "../helpers/routes";

const appDir = path.join(process.cwd(), "src", "app");

const shellNavigationFiles = [
  "src/components/shells/public-top-nav.tsx",
  "src/components/shells/top-nav.tsx",
  "src/components/shells/side-nav.tsx",
  "src/components/shells/footer.tsx",
  "src/app/admin/(app)/layout.tsx",
];

function routeFromSegments(segments: string[]) {
  const routeSegments = segments.filter(
    (segment) => !(segment.startsWith("(") && segment.endsWith(")")),
  );

  return routeSegments.length === 0 ? "/" : `/${routeSegments.join("/")}`;
}

function collectAppRoutePatterns(directory: string, segments: string[] = []): string[] {
  const entries = readdirSync(directory);
  const routes = entries.includes("page.tsx") ? [routeFromSegments(segments)] : [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry);

    if (!statSync(entryPath).isDirectory()) {
      continue;
    }

    routes.push(...collectAppRoutePatterns(entryPath, [...segments, entry]));
  }

  return [...new Set(routes)].sort();
}

function normalizeRoute(route: string) {
  const [withoutHash] = route.split("#");
  const [withoutQuery] = withoutHash.split("?");
  const withoutTrailingSlash =
    withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, "") : withoutQuery;

  return withoutTrailingSlash || "/";
}

function routeSegments(route: string) {
  return route === "/" ? [] : route.replace(/^\/|\/$/g, "").split("/");
}

function matchesRoutePattern(pattern: string, route: string) {
  const patternSegments = routeSegments(pattern);
  const candidateSegments = routeSegments(normalizeRoute(route));

  if (patternSegments.length !== candidateSegments.length) {
    return false;
  }

  return patternSegments.every((segment, index) => {
    if (segment.startsWith("[") && segment.endsWith("]")) {
      return candidateSegments[index].length > 0;
    }

    return segment === candidateSegments[index];
  });
}

function missingRoutesFromPatterns(routes: RouteCase[], patterns: string[]) {
  return routes
    .map((route) => normalizeRoute(route.path))
    .filter((route) => !patterns.some((pattern) => matchesRoutePattern(pattern, route)))
    .sort();
}

function missingPatternsFromRoutes(patterns: string[], routes: RouteCase[]) {
  return patterns
    .filter((pattern) => !routes.some((route) => matchesRoutePattern(pattern, route.path)))
    .sort();
}

function extractInternalHrefRoutes(filePath: string) {
  if (!existsSync(filePath)) {
    return [];
  }

  const source = readFileSync(filePath, "utf8");
  const routes = new Set<string>();
  const hrefPattern = /\bhref(?:\s*=\s*|\s*:\s*)["'](\/[^"']*)["']/g;

  for (const match of source.matchAll(hrefPattern)) {
    routes.add(normalizeRoute(match[1]));
  }

  return [...routes];
}

test.describe("@ui route inventory audit", () => {
  test("route metadata covers every App Router page without stale smoke routes", () => {
    const appRoutePatterns = collectAppRoutePatterns(appDir);
    const metadataRoutes = [...smokeRoutes, ...sideEffectRoutes];

    expect(
      missingPatternsFromRoutes(appRoutePatterns, metadataRoutes),
      "App Router pages missing from route metadata",
    ).toEqual([]);
    expect(
      missingRoutesFromPatterns(smokeRoutes, appRoutePatterns),
      "smoke routes without matching App Router pages",
    ).toEqual([]);
    expect(
      missingRoutesFromPatterns(sideEffectRoutes, appRoutePatterns),
      "side-effect routes without matching App Router pages",
    ).toEqual([]);
    expect(
      smokeRoutes.filter((route) =>
        sideEffectRoutes.some((sideEffectRoute) => sideEffectRoute.path === route.path),
      ),
      "side-effect routes should not run in generic smoke tests",
    ).toEqual([]);
  });

  test("shell navigation hrefs point to implemented and covered routes", () => {
    const appRoutePatterns = collectAppRoutePatterns(appDir);
    const metadataRoutes = [...smokeRoutes, ...sideEffectRoutes];
    const shellRoutes = [
      ...new Set(
        shellNavigationFiles.flatMap((relativePath) =>
          extractInternalHrefRoutes(path.join(process.cwd(), relativePath)),
        ),
      ),
    ].sort();

    expect(
      shellRoutes.filter(
        (route) => !appRoutePatterns.some((pattern) => matchesRoutePattern(pattern, route)),
      ),
      "shell navigation hrefs without matching App Router pages",
    ).toEqual([]);
    expect(
      shellRoutes.filter(
        (route) => !metadataRoutes.some((metadataRoute) => matchesRoutePattern(route, metadataRoute.path)),
      ),
      "shell navigation hrefs missing from route metadata",
    ).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { optimizeImageUrl } from "../image-utils";

describe("optimizeImageUrl", () => {
  it("returns empty string for null, undefined, or empty values", () => {
    expect(optimizeImageUrl(null)).toBe("");
    expect(optimizeImageUrl(undefined)).toBe("");
    expect(optimizeImageUrl("")).toBe("");
    expect(optimizeImageUrl("   ")).toBe("");
  });

  it("dynamically optimizes unsplash URLs without query parameters", () => {
    const rawUrl = "https://images.unsplash.com/photo-1576091160550-2173dba999ef";
    const optimized = optimizeImageUrl(rawUrl, { width: 400, quality: 70 });

    expect(optimized).toContain("images.unsplash.com/photo-1576091160550-2173dba999ef");
    expect(optimized).toContain("auto=format");
    expect(optimized).toContain("fit=crop");
    expect(optimized).toContain("w=400");
    expect(optimized).toContain("q=70");
  });

  it("updates existing query parameters on unsplash URLs", () => {
    const existingUrl = "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1200&q=90";
    const optimized = optimizeImageUrl(existingUrl, { width: 300, quality: 60 });

    expect(optimized).toContain("w=300");
    expect(optimized).toContain("q=60");
    expect(optimized).toContain("auto=format");
  });

  it("preserves non-unsplash URLs as-is", () => {
    const localUrl = "/images/default-avatar.png";
    const externalUrl = "https://res.cloudinary.com/demo/image/upload/v1234/sample.jpg";

    expect(optimizeImageUrl(localUrl)).toBe(localUrl);
    expect(optimizeImageUrl(externalUrl)).toBe(externalUrl);
  });
});

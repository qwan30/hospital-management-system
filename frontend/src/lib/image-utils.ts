export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: string;
}

/**
 * Dynamically optimizes image URLs (e.g. Unsplash, Cloudinary, etc.)
 * by appending dimension, compression, and modern WebP/AVIF parameters.
 * If URL is empty or null, returns empty string.
 */
export function optimizeImageUrl(
  url: string | null | undefined,
  options: ImageOptimizationOptions = {}
): string {
  if (!url || typeof url !== "string") {
    return "";
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }

  const { width = 600, quality = 75 } = options;

  // Optimize Unsplash URLs dynamically
  if (trimmed.includes("images.unsplash.com")) {
    try {
      const parsedUrl = new URL(trimmed);
      parsedUrl.searchParams.set("auto", "format");
      parsedUrl.searchParams.set("fit", "crop");
      parsedUrl.searchParams.set("w", String(width));
      parsedUrl.searchParams.set("q", String(quality));
      if (options.height) {
        parsedUrl.searchParams.set("h", String(options.height));
      }
      return parsedUrl.toString();
    } catch {
      const baseUrl = trimmed.split("?")[0];
      const heightParam = options.height ? `&h=${options.height}` : "";
      return `${baseUrl}?auto=format&fit=crop&w=${width}&q=${quality}${heightParam}`;
    }
  }

  return trimmed;
}

/**
 * Generate page URL from pageId
 */
export function generatePageUrl(pageId: string, baseUrl?: string): string {
  const base = baseUrl || "";
  return `${base}/${pageId}`;
}

/**
 * Generate admin edit URL for a page
 */
export function generateAdminEditUrl(pageId: string): string {
  return `/admin/pages/${pageId}`;
}

/**
 * Generate preview URL for a page
 */
export function generatePreviewUrl(pageId: string): string {
  return `/${pageId}?preview=true`;
}

/**
 * Extract pageId from URL path
 */
export function extractPageIdFromPath(path: string): string | null {
  const segments = path.split("/").filter(Boolean);
  return segments.length > 0 ? segments[segments.length - 1] : null;
}

/**
 * Validate pageId format
 */
export function isValidPageId(pageId: string): boolean {
  const pattern = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  return pattern.test(pageId) && pageId.length >= 1 && pageId.length <= 100;
}

/**
 * Generate SEO-friendly slug from title
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Build query string from parameters
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Check if URL is external
 */
export function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Normalize URL (add protocol if missing)
 */
export function normalizeUrl(url: string): string {
  if (!url) return "";

  if (url.startsWith("/") || url.startsWith("#")) {
    return url;
  }

  if (!url.match(/^https?:\/\//)) {
    return `https://${url}`;
  }

  return url;
}

/**
 * Get domain from URL
 */
export function getDomainFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(normalizeUrl(url));
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(normalizeUrl(url));
    return true;
  } catch {
    return false;
  }
}

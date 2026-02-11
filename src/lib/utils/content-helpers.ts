import type { PageContent } from "@/lib/types/page";

/**
 * Extract text content from page sections for search
 */
export function extractSearchableText(content: PageContent): string {
  const textParts: string[] = [];

  textParts.push(content.title, content.description);

  Object.entries(content).forEach(([, section]) => {
    if (typeof section === "object" && section !== null) {
      extractTextFromSection(section, textParts);
    }
  });

  return textParts.filter(Boolean).join(" ").toLowerCase();
}

/**
 * Recursively extract text from section objects
 */
function extractTextFromSection(obj: unknown, textParts: string[]): void {
  if (typeof obj === "string") {
    textParts.push(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((item) => extractTextFromSection(item, textParts));
  } else if (typeof obj === "object" && obj !== null) {
    Object.values(obj).forEach((value) => {
      if (typeof value === "string") {
        textParts.push(value);
      } else if (typeof value === "object") {
        extractTextFromSection(value, textParts);
      }
    });
  }
}

/**
 * Count words in content
 */
export function countWords(content: PageContent): number {
  const text = extractSearchableText(content);
  return text.split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Estimate reading time in minutes
 */
export function estimateReadingTime(content: PageContent): number {
  const wordCount = countWords(content);
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Generate content summary
 */
export function generateContentSummary(
  content: PageContent,
  maxLength: number = 150
): string {
  const text = extractSearchableText(content);

  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + "...";
  }

  return truncated + "...";
}

/**
 * Check if content has specific section
 */
export function hasSection(content: PageContent, sectionKey: string): boolean {
  return (
    sectionKey in content &&
    content[sectionKey] !== null &&
    content[sectionKey] !== undefined
  );
}

/**
 * Get section count
 */
export function getSectionCount(content: PageContent): number {
  const excludedKeys = [
    "pageId",
    "title",
    "description",
    "lastModified",
    "published",
  ];
  return Object.keys(content).filter((key) => !excludedKeys.includes(key))
    .length;
}

/**
 * Validate content structure
 */
export function validateContentStructure(content: unknown): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!content || typeof content !== "object" || Array.isArray(content)) {
    errors.push("Content must be an object");
    return { isValid: false, errors };
  }

  const contentRecord = content as Record<string, unknown>;

  const requiredFields = [
    "pageId",
    "title",
    "description",
    "lastModified",
    "published",
  ];
  requiredFields.forEach((field) => {
    if (!(field in contentRecord)) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  if (
    contentRecord.pageId !== undefined &&
    typeof contentRecord.pageId !== "string"
  ) {
    errors.push("pageId must be a string");
  }

  if (
    contentRecord.title !== undefined &&
    typeof contentRecord.title !== "string"
  ) {
    errors.push("title must be a string");
  }

  if (
    contentRecord.description !== undefined &&
    typeof contentRecord.description !== "string"
  ) {
    errors.push("description must be a string");
  }

  if (
    contentRecord.published !== undefined &&
    typeof contentRecord.published !== "boolean"
  ) {
    errors.push("published must be a boolean");
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Clean content (remove empty sections)
 */
export function cleanContent(content: PageContent): PageContent {
  const cleaned: Record<string, unknown> = { ...content };

  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key];

    if (value === null || value === undefined) {
      delete cleaned[key];
    } else if (typeof value === "object" && !Array.isArray(value)) {
      const hasContent = Object.values(value as Record<string, unknown>).some(
        (v) => v !== null && v !== undefined && v !== ""
      );

      if (!hasContent) {
        delete cleaned[key];
      }
    } else if (Array.isArray(value) && value.length === 0) {
      delete cleaned[key];
    }
  });

  return cleaned as PageContent;
}

/**
 * Deep clone content
 */
export function cloneContent(content: PageContent): PageContent {
  return JSON.parse(JSON.stringify(content));
}

/**
 * Merge content objects
 */
export function mergeContent(
  base: PageContent,
  updates: Partial<PageContent>
): PageContent {
  const merged = cloneContent(base);
  const mutableMerged = merged as Record<string, unknown>;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      mutableMerged[key] = value;
    }
  });

  return merged;
}

/**
 * Get content version hash (for change detection)
 */
export function getContentHash(content: PageContent): string {
  const contentString = JSON.stringify(content, Object.keys(content).sort());

  let hash = 0;
  for (let i = 0; i < contentString.length; i++) {
    const char = contentString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  return Math.abs(hash).toString(36);
}

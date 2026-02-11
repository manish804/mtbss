/**
 * Type consistency checker for JSON files
 * Ensures all JSON files follow consistent patterns and structures
 */

import {
  validateTypeConsistency,
} from "@/lib/utils/json-validation";
import type { ValidationError } from "@/lib/types/json-schemas";

export interface ConsistencyCheckResult {
  isConsistent: boolean;
  errors: ValidationError[];
  warnings: ConsistencyWarning[];
  suggestions: ConsistencySuggestion[];
  summary: ConsistencySummary;
}

export interface ConsistencyWarning {
  type: "styling" | "structure" | "naming" | "content";
  message: string;
  files: string[];
  severity: "low" | "medium" | "high";
}

export interface ConsistencySuggestion {
  type: "standardize" | "optimize" | "improve";
  message: string;
  action: string;
  files: string[];
}

export interface ConsistencySummary {
  totalFiles: number;
  validFiles: number;
  filesWithErrors: number;
  filesWithWarnings: number;
  overallScore: number;
}

type JsonRecord = Record<string, unknown>;

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Expected patterns for consistency checking
 */
const CONSISTENCY_PATTERNS = {
  sectionPadding: ["py-10 md:py-12", "py-12 md:py-16", "py-16 md:py-20"],
  buttonVariants: ["primary", "secondary", "outline"],
  buttonSizes: ["sm", "md", "lg"],

  backgroundColors: ["bg-background", "bg-card", "bg-muted", "bg-primary"],
  textColors: [
    "text-foreground",
    "text-card-foreground",
    "text-muted-foreground",
  ],

  imageHintPatterns: [
    "professional",
    "business",
    "office",
    "team",
    "service",
    "technology",
  ],

  titleLengthRange: { min: 10, max: 100 },
  descriptionLengthRange: { min: 50, max: 500 },
  ctaTextLengthRange: { min: 5, max: 30 },
};

/**
 * Check consistency across all JSON files
 */
export async function checkTypeConsistency(jsonFiles: {
  home?: unknown;
  about?: unknown;
  services?: unknown;
  contact?: unknown;
  jobs?: unknown;
  contentData?: unknown;
}): Promise<ConsistencyCheckResult> {
  const errors: ValidationError[] = [];
  const warnings: ConsistencyWarning[] = [];
  const suggestions: ConsistencySuggestion[] = [];

  const validationResult = validateTypeConsistency(jsonFiles);
  if (!validationResult.isValid) {
    errors.push(...validationResult.errors);
  }

  const structuralWarnings = checkStructuralConsistency(jsonFiles);
  warnings.push(...structuralWarnings);

  const stylingWarnings = checkStylingConsistency(jsonFiles);
  warnings.push(...stylingWarnings);

  const contentWarnings = checkContentConsistency(jsonFiles);
  warnings.push(...contentWarnings);

  const namingWarnings = checkNamingConsistency(jsonFiles);
  warnings.push(...namingWarnings);

  const generatedSuggestions = generateConsistencySuggestions(warnings);
  suggestions.push(...generatedSuggestions);

  const summary = calculateConsistencySummary(jsonFiles, errors, warnings);

  return {
    isConsistent:
      errors.length === 0 &&
      warnings.filter((w) => w.severity === "high").length === 0,
    errors,
    warnings,
    suggestions,
    summary,
  };
}

/**
 * Check structural consistency across files
 */
function checkStructuralConsistency(
  jsonFiles: Record<string, unknown>
): ConsistencyWarning[] {
  const warnings: ConsistencyWarning[] = [];

  const requiredBaseFields = [
    "pageId",
    "title",
    "description",
    "lastModified",
    "published",
  ];

  const fileEntries = Object.entries(jsonFiles);

  fileEntries.forEach(([fileName, content]) => {
    if (fileName === "contentData") return;

    const contentRecord = content as Record<string, unknown> | undefined;

    requiredBaseFields.forEach((field) => {
      if (!contentRecord || !contentRecord[field]) {
        warnings.push({
          type: "structure",
          message: `Missing required base field: ${field}`,
          files: [fileName],
          severity: "high",
        });
      }
    });
  });

  const pageFiles = fileEntries.filter(([name]) => name !== "contentData");
  const filesWithoutHero = pageFiles
    .filter(
      ([, content]) => !(content as { hero?: unknown } | undefined)?.hero
    )
    .map(([name]) => name);

  if (filesWithoutHero.length > 0) {
    warnings.push({
      type: "structure",
      message: "Pages missing hero section",
      files: filesWithoutHero,
      severity: "medium",
    });
  }

  return warnings;
}

/**
 * Check styling consistency across files
 */
function checkStylingConsistency(
  jsonFiles: Record<string, unknown>
): ConsistencyWarning[] {
  const warnings: ConsistencyWarning[] = [];

  const stylingObjects: { file: string; section: string; styling: JsonRecord }[] =
    [];

  Object.entries(jsonFiles).forEach(([fileName, content]) => {
    if (fileName === "contentData") return;

    findStylingObjects(content, fileName, "", stylingObjects);
  });

  const buttonStyles = stylingObjects
    .map((obj) => {
      const buttonStyle = obj.styling.buttonStyle;
      return isJsonRecord(buttonStyle) ? { ...obj, buttonStyle } : null;
    })
    .filter(
      (
        obj
      ): obj is {
        file: string;
        section: string;
        styling: JsonRecord;
        buttonStyle: JsonRecord;
      } => obj !== null
    );

  if (buttonStyles.length > 1) {
    const variants = new Set(
      buttonStyles
        .map((bs) =>
          typeof bs.buttonStyle.variant === "string"
            ? bs.buttonStyle.variant
            : ""
        )
        .filter(Boolean)
    );
    const sizes = new Set(
      buttonStyles
        .map((bs) =>
          typeof bs.buttonStyle.size === "string" ? bs.buttonStyle.size : ""
        )
        .filter(Boolean)
    );

    if (variants.size > 3) {
      warnings.push({
        type: "styling",
        message: `Too many button variants (${variants.size}). Consider standardizing to 2-3 variants.`,
        files: [...new Set(buttonStyles.map((bs) => bs.file))],
        severity: "medium",
      });
    }

    if (sizes.size > 3) {
      warnings.push({
        type: "styling",
        message: `Too many button sizes (${sizes.size}). Consider standardizing to 2-3 sizes.`,
        files: [...new Set(buttonStyles.map((bs) => bs.file))],
        severity: "low",
      });
    }
  }

  const backgroundColors = stylingObjects
    .map((obj) => obj.styling.backgroundColor)
    .filter((color): color is string => typeof color === "string");

  const uniqueBackgroundColors = new Set(backgroundColors);
  if (uniqueBackgroundColors.size > 10) {
    warnings.push({
      type: "styling",
      message: `Too many different background colors (${uniqueBackgroundColors.size}). Consider using a consistent color palette.`,
      files: [...new Set(stylingObjects.map((obj) => obj.file))],
      severity: "medium",
    });
  }

  return warnings;
}

/**
 * Recursively find styling objects in content
 */
function findStylingObjects(
  obj: unknown,
  fileName: string,
  path: string,
  results: { file: string; section: string; styling: JsonRecord }[]
): void {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const newPath = path ? `${path}.${index}` : `${index}`;
      findStylingObjects(item, fileName, newPath, results);
    });
    return;
  }

  if (!isJsonRecord(obj)) return;

  if (isJsonRecord(obj.styling)) {
    results.push({
      file: fileName,
      section: path,
      styling: obj.styling,
    });
  }

  Object.entries(obj).forEach(([key, value]) => {
    const newPath = path ? `${path}.${key}` : key;
    findStylingObjects(value, fileName, newPath, results);
  });
}

/**
 * Check content consistency across files
 */
function checkContentConsistency(
  jsonFiles: Record<string, unknown>
): ConsistencyWarning[] {
  const warnings: ConsistencyWarning[] = [];

  const titles: {
    file: string;
    section: string;
    title: string;
    length: number;
  }[] = [];

  Object.entries(jsonFiles).forEach(([fileName, content]) => {
    if (fileName === "contentData") return;

    findTitles(content, fileName, "", titles);
  });

  const shortTitles = titles.filter(
    (t) => t.length < CONSISTENCY_PATTERNS.titleLengthRange.min
  );
  const longTitles = titles.filter(
    (t) => t.length > CONSISTENCY_PATTERNS.titleLengthRange.max
  );

  if (shortTitles.length > 0) {
    warnings.push({
      type: "content",
      message: `${shortTitles.length} titles are too short (less than ${CONSISTENCY_PATTERNS.titleLengthRange.min} characters)`,
      files: [...new Set(shortTitles.map((t) => t.file))],
      severity: "low",
    });
  }

  if (longTitles.length > 0) {
    warnings.push({
      type: "content",
      message: `${longTitles.length} titles are too long (more than ${CONSISTENCY_PATTERNS.titleLengthRange.max} characters)`,
      files: [...new Set(longTitles.map((t) => t.file))],
      severity: "medium",
    });
  }

  const sectionsWithoutDescription = titles.filter((t) => {
    const section = getNestedValue(jsonFiles[t.file], t.section.split("."));
    if (!isJsonRecord(section)) {
      return true;
    }

    const description = section.description;
    const subtitle = section.subtitle;
    return (
      (typeof description !== "string" || description.trim() === "") &&
      (typeof subtitle !== "string" || subtitle.trim() === "")
    );
  });

  if (sectionsWithoutDescription.length > 0) {
    warnings.push({
      type: "content",
      message: `${sectionsWithoutDescription.length} sections missing descriptions or subtitles`,
      files: [...new Set(sectionsWithoutDescription.map((t) => t.file))],
      severity: "medium",
    });
  }

  return warnings;
}

/**
 * Recursively find titles in content
 */
function findTitles(
  obj: unknown,
  fileName: string,
  path: string,
  results: { file: string; section: string; title: string; length: number }[]
): void {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const newPath = path ? `${path}.${index}` : `${index}`;
      findTitles(item, fileName, newPath, results);
    });
    return;
  }

  if (!isJsonRecord(obj)) return;

  if (typeof obj.title === "string") {
    results.push({
      file: fileName,
      section: path,
      title: obj.title,
      length: obj.title.length,
    });
  }

  Object.entries(obj).forEach(([key, value]) => {
    const newPath = path ? `${path}.${key}` : key;
    findTitles(value, fileName, newPath, results);
  });
}

/**
 * Check naming consistency across files
 */
function checkNamingConsistency(
  jsonFiles: Record<string, unknown>
): ConsistencyWarning[] {
  const warnings: ConsistencyWarning[] = [];

  const allFields = new Set<string>();

  Object.entries(jsonFiles).forEach(([, content]) => {
    collectFieldNames(content, "", allFields);
  });

  const camelCaseFields = Array.from(allFields).filter((field) =>
    /^[a-z][a-zA-Z0-9]*$/.test(field)
  );
  const snake_caseFields = Array.from(allFields).filter(
    (field) => /^[a-z][a-z0-9_]*$/.test(field) && field.includes("_")
  );
  const kebab_caseFields = Array.from(allFields).filter(
    (field) => /^[a-z][a-z0-9-]*$/.test(field) && field.includes("-")
  );

  if (snake_caseFields.length > 0 && camelCaseFields.length > 0) {
    warnings.push({
      type: "naming",
      message: "Mixed naming conventions detected (camelCase and snake_case)",
      files: Object.keys(jsonFiles),
      severity: "medium",
    });
  }

  if (kebab_caseFields.length > 0 && camelCaseFields.length > 0) {
    warnings.push({
      type: "naming",
      message: "Mixed naming conventions detected (camelCase and kebab-case)",
      files: Object.keys(jsonFiles),
      severity: "medium",
    });
  }

  return warnings;
}

/**
 * Recursively collect field names
 */
function collectFieldNames(
  obj: unknown,
  path: string,
  results: Set<string>
): void {
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      collectFieldNames(item, path ? `${path}.${index}` : `${index}`, results);
    });
    return;
  }

  if (!isJsonRecord(obj)) return;

  Object.entries(obj).forEach(([key, value]) => {
    results.add(key);
    if (isJsonRecord(value) || Array.isArray(value)) {
      collectFieldNames(value, path ? `${path}.${key}` : key, results);
    }
  });
}

/**
 * Generate suggestions based on warnings
 */
function generateConsistencySuggestions(
  warnings: ConsistencyWarning[]
): ConsistencySuggestion[] {
  const suggestions: ConsistencySuggestion[] = [];

  const warningsByType = warnings.reduce((acc, warning) => {
    if (!acc[warning.type]) acc[warning.type] = [];
    acc[warning.type].push(warning);
    return acc;
  }, {} as Record<string, ConsistencyWarning[]>);

  if (warningsByType.styling) {
    suggestions.push({
      type: "standardize",
      message:
        "Create a design system with consistent colors, typography, and spacing",
      action: "Define standard color palette and component styles",
      files: [...new Set(warningsByType.styling.flatMap((w) => w.files))],
    });
  }

  if (warningsByType.content) {
    suggestions.push({
      type: "improve",
      message:
        "Review content length and ensure all sections have appropriate descriptions",
      action: "Add missing descriptions and optimize title lengths",
      files: [...new Set(warningsByType.content.flatMap((w) => w.files))],
    });
  }

  if (warningsByType.naming) {
    suggestions.push({
      type: "standardize",
      message: "Standardize field naming conventions across all files",
      action: "Convert all field names to consistent camelCase format",
      files: [...new Set(warningsByType.naming.flatMap((w) => w.files))],
    });
  }

  return suggestions;
}

/**
 * Calculate consistency summary
 */
function calculateConsistencySummary(
  jsonFiles: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ConsistencyWarning[]
): ConsistencySummary {
  const totalFiles = Object.keys(jsonFiles).length;
  const filesWithErrors = new Set(errors.map((e) => e.field.split(".")[0]))
    .size;
  const filesWithWarnings = new Set(warnings.flatMap((w) => w.files)).size;
  const validFiles = totalFiles - filesWithErrors;

  let score = 100;

  score -= errors.length * 10;

  warnings.forEach((warning) => {
    switch (warning.severity) {
      case "high":
        score -= 5;
        break;
      case "medium":
        score -= 3;
        break;
      case "low":
        score -= 1;
        break;
    }
  });

  score = Math.max(0, score);

  return {
    totalFiles,
    validFiles,
    filesWithErrors,
    filesWithWarnings,
    overallScore: score,
  };
}

/**
 * Get nested value from object using path array
 */
function getNestedValue(obj: unknown, path: string[]): unknown {
  return path.reduce<unknown>((current, key) => {
    if (Array.isArray(current)) {
      const index = Number(key);
      return Number.isInteger(index) ? current[index] : undefined;
    }

    if (!isJsonRecord(current)) {
      return undefined;
    }

    return current[key];
  }, obj);
}

/**
 * Export main functions
 */
export { checkTypeConsistency as default, CONSISTENCY_PATTERNS };

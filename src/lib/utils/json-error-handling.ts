/**
 * Error handling and user feedback utilities for JSON validation
 * Provides comprehensive error handling with user-friendly messages
 */

import type {
  ValidationError,
} from "@/lib/types/json-schemas";

/**
 * Map validation error codes to user-friendly messages
 */
const ERROR_MESSAGE_MAP: Record<string, string> = {
  required: "This field is required",
  invalid_type: "Invalid data type provided",

  too_small: "Value is too short",
  too_big: "Value is too long",
  invalid_string: "Invalid text format",

  too_small_number: "Number is too small",
  too_big_number: "Number is too large",
  invalid_number: "Must be a valid number",

  invalid_url: "Must be a valid URL (e.g., https://example.com)",

  invalid_email: "Must be a valid email address",

  too_small_array: "At least one item is required",
  too_big_array: "Too many items provided",

  invalid_enum_value: "Invalid option selected",

  invalid_date: "Must be a valid date",
  invalid_datetime: "Must be a valid date and time",

  invalid_hex_color: "Must be a valid hex color (e.g., #ff0000)",
  invalid_tailwind_class: "Must be a valid Tailwind CSS class",
  invalid_slug: "Must contain only lowercase letters, numbers, and hyphens",

  custom: "Validation failed",
  unrecognized_keys: "Unknown fields provided",
};

/**
 * Field name mapping for better user experience
 */
const FIELD_NAME_MAP: Record<string, string> = {
  pageId: "Page ID",
  title: "Title",
  description: "Description",
  lastModified: "Last Modified Date",
  published: "Published Status",

  "hero.title": "Hero Title",
  "hero.subtitle": "Hero Subtitle",
  "hero.description": "Hero Description",
  "hero.ctaText": "Call-to-Action Text",
  "hero.ctaLink": "Call-to-Action Link",

  imageUrl: "Image URL",
  imageHint: "Image Description",

  phone: "Phone Number",
  email: "Email Address",
  address: "Address",

  shortDescription: "Short Description",
  features: "Features",
  ctaText: "Call-to-Action Text",
  ctaLink: "Call-to-Action Link",

  teamImages: "Team Images",

  statistics: "Statistics",
  number: "Number",
  label: "Label",

  styling: "Styling",
  backgroundColor: "Background Color",
  textColor: "Text Color",
  buttonStyle: "Button Style",
  cardStyle: "Card Style",
};

/**
 * Get user-friendly field name
 */
function getFriendlyFieldName(fieldPath: string): string {
  if (FIELD_NAME_MAP[fieldPath]) {
    return FIELD_NAME_MAP[fieldPath];
  }

  for (const [key, value] of Object.entries(FIELD_NAME_MAP)) {
    if (fieldPath.endsWith(key) || fieldPath.includes(key)) {
      return value;
    }
  }

  return (
    fieldPath
      .split(".")
      .pop()
      ?.replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, " ")
      .trim() || fieldPath
  );
}

/**
 * Get user-friendly error message
 */
function getFriendlyErrorMessage(error: ValidationError): string {
  const fieldName = getFriendlyFieldName(error.field);

  if (error.message && !ERROR_MESSAGE_MAP[error.code || ""]) {
    return `${fieldName}: ${error.message}`;
  }

  const mappedMessage =
    ERROR_MESSAGE_MAP[error.code || "custom"] ||
    error.message ||
    "Validation failed";

  return `${fieldName}: ${mappedMessage}`;
}

/**
 * Format validation errors for display
 */
function formatValidationErrors(errors: ValidationError[]): {
  summary: string;
  details: string[];
  fieldErrors: Record<string, string[]>;
} {
  const details = errors.map(getFriendlyErrorMessage);
  const fieldErrors: Record<string, string[]> = {};

  errors.forEach((error) => {
    const fieldName = error.field;
    if (!fieldErrors[fieldName]) {
      fieldErrors[fieldName] = [];
    }
    fieldErrors[fieldName].push(getFriendlyErrorMessage(error));
  });

  const errorCount = errors.length;
  const fieldCount = Object.keys(fieldErrors).length;

  let summary = "";
  if (errorCount === 1) {
    summary = "There is 1 validation error that needs to be fixed.";
  } else if (fieldCount === 1) {
    summary = `There are ${errorCount} validation errors in 1 field that need to be fixed.`;
  } else {
    summary = `There are ${errorCount} validation errors in ${fieldCount} fields that need to be fixed.`;
  }

  return {
    summary,
    details,
    fieldErrors,
  };
}

/**
 * Add context to validation errors
 */
function addErrorContext(
  errors: ValidationError[],
  context: { pageId?: string; sectionKey?: string; itemIndex?: number }
): ValidationError[] {
  return errors.map((error) => {
    let contextualField = error.field;

    if (context.itemIndex !== undefined) {
      contextualField = `Item ${context.itemIndex + 1}: ${contextualField}`;
    }

    if (context.sectionKey) {
      contextualField = `${context.sectionKey}: ${contextualField}`;
    }

    if (context.pageId) {
      contextualField = `${context.pageId} Page: ${contextualField}`;
    }

    return {
      ...error,
      field: contextualField,
    };
  });
}

/**
 * Filter errors by severity
 */
function filterErrorsBySeverity(errors: ValidationError[]): {
  critical: ValidationError[];
  warning: ValidationError[];
  info: ValidationError[];
} {
  const critical: ValidationError[] = [];
  const warning: ValidationError[] = [];
  const info: ValidationError[] = [];

  errors.forEach((error) => {
    if (
      error.code === "required" ||
      error.code === "invalid_type" ||
      error.code === "invalid_url"
    ) {
      critical.push(error);
    } else if (error.code === "too_small" || error.code === "too_big") {
      warning.push(error);
    } else {
      info.push(error);
    }
  });

  return { critical, warning, info };
}

/**
 * Generate success message for validation
 */
function getSuccessMessage(context: {
  action: "create" | "update" | "delete";
  itemType: string;
  itemName?: string;
}): string {
  const { action, itemType, itemName } = context;
  const name = itemName ? ` "${itemName}"` : "";

  switch (action) {
    case "create":
      return `${itemType}${name} has been created successfully.`;
    case "update":
      return `${itemType}${name} has been updated successfully.`;
    case "delete":
      return `${itemType}${name} has been deleted successfully.`;
    default:
      return `${itemType}${name} operation completed successfully.`;
  }
}

/**
 * Generate progress message for validation
 */
function getProgressMessage(context: {
  current: number;
  total: number;
  action: string;
}): string {
  const { current, total, action } = context;
  const percentage = Math.round((current / total) * 100);

  return `${action}... ${current}/${total} (${percentage}%)`;
}

/**
 * Generate validation summary for multiple items
 */
function getValidationSummary(results: {
  valid: number;
  invalid: number;
  total: number;
}): string {
  const { valid, invalid, total } = results;

  if (invalid === 0) {
    return `All ${total} items are valid and ready to save.`;
  }

  if (valid === 0) {
    return `All ${total} items have validation errors that need to be fixed.`;
  }

  return `${valid} of ${total} items are valid. ${invalid} items have validation errors that need to be fixed.`;
}

/**
 * Get suggestions for fixing validation errors
 */
function getErrorSuggestions(error: ValidationError): string[] {
  const suggestions: string[] = [];

  switch (error.code) {
    case "required":
      suggestions.push("Please provide a value for this field.");
      break;

    case "invalid_url":
      suggestions.push("Make sure the URL starts with http:// or https://");
      suggestions.push("Example: https://example.com");
      break;

    case "invalid_email":
      suggestions.push("Make sure the email address is in the correct format");
      suggestions.push("Example: user@example.com");
      break;

    case "too_small":
      suggestions.push("Please provide more content for this field.");
      break;

    case "too_big":
      suggestions.push("Please shorten the content for this field.");
      break;

    case "invalid_hex_color":
      suggestions.push("Use a valid hex color format like #ff0000 for red");
      suggestions.push("You can use a color picker tool to get the hex value");
      break;

    case "invalid_slug":
      suggestions.push("Use only lowercase letters, numbers, and hyphens");
      suggestions.push("Example: my-page-title");
      break;

    default:
      suggestions.push("Please check the format and try again.");
  }

  return suggestions;
}

/**
 * Get auto-fix suggestions for common errors
 */
function getAutoFixSuggestions(
  error: ValidationError,
  currentValue: unknown
): {
  canAutoFix: boolean;
  suggestedValue?: unknown;
  description?: string;
} {
  switch (error.code) {
    case "invalid_slug":
      if (typeof currentValue === "string") {
        const fixed = currentValue
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim();

        return {
          canAutoFix: true,
          suggestedValue: fixed,
          description: "Convert to lowercase and replace spaces with hyphens",
        };
      }
      break;

    case "too_small":
      if (typeof currentValue === "string" && currentValue.trim() === "") {
        return {
          canAutoFix: false,
          description: "Please provide content for this field",
        };
      }
      break;

    case "invalid_url":
      if (
        typeof currentValue === "string" &&
        !currentValue.startsWith("http")
      ) {
        return {
          canAutoFix: true,
          suggestedValue: `https://${currentValue}`,
          description: "Add https:// prefix to the URL",
        };
      }
      break;
  }

  return { canAutoFix: false };
}

export {
  formatValidationErrors as default,
  getFriendlyFieldName,
  getFriendlyErrorMessage,
  addErrorContext,
  filterErrorsBySeverity,
  getSuccessMessage,
  getProgressMessage,
  getValidationSummary,
  getErrorSuggestions,
  getAutoFixSuggestions,
};

/**
 * JSON validation utilities for runtime validation and error handling
 * Provides comprehensive validation for all JSON content with user-friendly error messages
 */

import { z } from "zod";
import {
  homePageContentSchema,
  aboutPageContentSchema,
  servicesPageContentSchema,
  contactPageContentSchema,
  jobsPageContentSchema,
  contentDataSchema,
  pageContentSchema,
  teamImageFormDataSchema,
  serviceFormDataSchema,
  departmentFormDataSchema,
  benefitFormDataSchema,
  companyCultureFormDataSchema,
} from "@/lib/validation/json-schemas";
import type {
  ValidationError,
  ValidationResult,
} from "@/lib/types/json-schemas";

type ShapeAwareSchema = z.ZodObject<Record<string, z.ZodTypeAny>>;

function isShapeAwareSchema(schema: z.ZodSchema): schema is ShapeAwareSchema {
  return schema instanceof z.ZodObject;
}

/**
 * Create a successful validation result
 */
function createSuccessResult<T>(data: T): ValidationResult {
  return {
    isValid: true,
    errors: [],
    data,
  };
}

/**
 * Create a failed validation result
 */
function createErrorResult(errors: ValidationError[]): ValidationResult {
  return {
    isValid: false,
    errors,
    data: null,
  };
}

/**
 * Convert Zod errors to ValidationError format
 */
function formatZodErrors(zodError: z.ZodError): ValidationError[] {
  return zodError.errors.map((error) => ({
    field: error.path.join("."),
    message: error.message,
    code: error.code,
  }));
}

/**
 * Validate any page content based on pageId
 */
export function validatePageContent(content: unknown): ValidationResult {
  try {
    const validatedContent = pageContentSchema.parse(content);
    return createSuccessResult(validatedContent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: "Invalid page content structure",
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate home page content
 */
export function validateHomePageContent(content: unknown): ValidationResult {
  try {
    const validatedContent = homePageContentSchema.parse(content);
    return createSuccessResult(validatedContent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: "Invalid home page content structure",
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate about page content
 */
export function validateAboutPageContent(content: unknown): ValidationResult {
  try {
    const validatedContent = aboutPageContentSchema.parse(content);
    return createSuccessResult(validatedContent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: "Invalid about page content structure",
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate services page content
 */
export function validateServicesPageContent(
  content: unknown
): ValidationResult {
  try {
    const validatedContent = servicesPageContentSchema.parse(content);
    return createSuccessResult(validatedContent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: "Invalid services page content structure",
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate contact page content
 */
export function validateContactPageContent(content: unknown): ValidationResult {
  try {
    const validatedContent = contactPageContentSchema.parse(content);
    return createSuccessResult(validatedContent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: "Invalid contact page content structure",
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate jobs page content
 */
export function validateJobsPageContent(content: unknown): ValidationResult {
  try {
    const validatedContent = jobsPageContentSchema.parse(content);
    return createSuccessResult(validatedContent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: "Invalid jobs page content structure",
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate content data
 */
export function validateContentData(content: unknown): ValidationResult {
  try {
    const validatedContent = contentDataSchema.parse(content);
    return createSuccessResult(validatedContent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: "Invalid content data structure",
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate a specific section within page content
 */
export function validatePageSection(
  pageId: string,
  sectionKey: string,
  sectionData: unknown
): ValidationResult {
  try {
    let pageSchema: z.ZodSchema;

    switch (pageId) {
      case "home":
        pageSchema = homePageContentSchema;
        break;
      case "about":
        pageSchema = aboutPageContentSchema;
        break;
      case "services":
        pageSchema = servicesPageContentSchema;
        break;
      case "contact":
        pageSchema = contactPageContentSchema;
        break;
      case "jobs":
        pageSchema = jobsPageContentSchema;
        break;
      default:
        return createErrorResult([
          {
            field: "pageId",
            message: `Unknown page ID: ${pageId}`,
            code: "invalid_enum_value",
          },
        ]);
    }

    if (!isShapeAwareSchema(pageSchema)) {
      return createErrorResult([
        {
          field: "pageId",
          message: `Page schema for '${pageId}' is not object-based`,
          code: "invalid_type",
        },
      ]);
    }

    const sectionSchema = pageSchema.shape[sectionKey];
    if (!sectionSchema) {
      return createErrorResult([
        {
          field: "sectionKey",
          message: `Unknown section: ${sectionKey} for page: ${pageId}`,
          code: "invalid_enum_value",
        },
      ]);
    }

    const validatedSection = sectionSchema.parse(sectionData);
    return createSuccessResult(validatedSection);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: `Invalid section data for ${sectionKey}`,
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate team image form data
 */
export function validateTeamImageFormData(data: unknown): ValidationResult {
  try {
    const validatedData = teamImageFormDataSchema.parse(data);
    return createSuccessResult(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: "Invalid team image form data",
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate service form data
 */
export function validateServiceFormData(data: unknown): ValidationResult {
  try {
    const validatedData = serviceFormDataSchema.parse(data);
    return createSuccessResult(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: "Invalid service form data",
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate department form data
 */
export function validateDepartmentFormData(data: unknown): ValidationResult {
  try {
    const validatedData = departmentFormDataSchema.parse(data);
    return createSuccessResult(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: "Invalid department form data",
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate benefit form data
 */
export function validateBenefitFormData(data: unknown): ValidationResult {
  try {
    const validatedData = benefitFormDataSchema.parse(data);
    return createSuccessResult(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: "Invalid benefit form data",
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate company culture form data
 */
export function validateCompanyCultureFormData(
  data: unknown
): ValidationResult {
  try {
    const validatedData = companyCultureFormDataSchema.parse(data);
    return createSuccessResult(validatedData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createErrorResult(formatZodErrors(error));
    }
    return createErrorResult([
      {
        field: "general",
        message: "Invalid company culture form data",
        code: "invalid_type",
      },
    ]);
  }
}

/**
 * Validate multiple items at once
 */
export function validateBatch<T>(
  items: unknown[],
  validator: (item: unknown) => ValidationResult
): { validItems: T[]; errors: { index: number; errors: ValidationError[] }[] } {
  const validItems: T[] = [];
  const errors: { index: number; errors: ValidationError[] }[] = [];

  items.forEach((item, index) => {
    const result = validator(item);
    if (result.isValid && result.data) {
      validItems.push(result.data as T);
    } else {
      errors.push({ index, errors: result.errors });
    }
  });

  return { validItems, errors };
}

/**
 * Validate type consistency across all JSON files
 */
export function validateTypeConsistency(jsonFiles: {
  home?: unknown;
  about?: unknown;
  services?: unknown;
  contact?: unknown;
  jobs?: unknown;
  contentData?: unknown;
}): ValidationResult {
  const errors: ValidationError[] = [];
  const validatedData: Record<string, unknown> = {};

  if (jsonFiles.home) {
    const homeResult = validateHomePageContent(jsonFiles.home);
    if (!homeResult.isValid) {
      errors.push(
        ...homeResult.errors.map((err) => ({
          ...err,
          field: `home.${err.field}`,
        }))
      );
    } else {
      validatedData.home = homeResult.data;
    }
  }

  if (jsonFiles.about) {
    const aboutResult = validateAboutPageContent(jsonFiles.about);
    if (!aboutResult.isValid) {
      errors.push(
        ...aboutResult.errors.map((err) => ({
          ...err,
          field: `about.${err.field}`,
        }))
      );
    } else {
      validatedData.about = aboutResult.data;
    }
  }

  if (jsonFiles.services) {
    const servicesResult = validateServicesPageContent(jsonFiles.services);
    if (!servicesResult.isValid) {
      errors.push(
        ...servicesResult.errors.map((err) => ({
          ...err,
          field: `services.${err.field}`,
        }))
      );
    } else {
      validatedData.services = servicesResult.data;
    }
  }

  if (jsonFiles.contact) {
    const contactResult = validateContactPageContent(jsonFiles.contact);
    if (!contactResult.isValid) {
      errors.push(
        ...contactResult.errors.map((err) => ({
          ...err,
          field: `contact.${err.field}`,
        }))
      );
    } else {
      validatedData.contact = contactResult.data;
    }
  }

  if (jsonFiles.jobs) {
    const jobsResult = validateJobsPageContent(jsonFiles.jobs);
    if (!jobsResult.isValid) {
      errors.push(
        ...jobsResult.errors.map((err) => ({
          ...err,
          field: `jobs.${err.field}`,
        }))
      );
    } else {
      validatedData.jobs = jobsResult.data;
    }
  }

  if (jsonFiles.contentData) {
    const contentDataResult = validateContentData(jsonFiles.contentData);
    if (!contentDataResult.isValid) {
      errors.push(
        ...contentDataResult.errors.map((err) => ({
          ...err,
          field: `contentData.${err.field}`,
        }))
      );
    } else {
      validatedData.contentData = contentDataResult.data;
    }
  }

  if (errors.length > 0) {
    return createErrorResult(errors);
  }

  return createSuccessResult(validatedData);
}

/**
 * Get user-friendly error messages for display
 */
export function getErrorMessages(errors: ValidationError[]): string[] {
  return errors.map((error) => {
    const fieldName = error.field.split(".").pop() || error.field;
    return `${fieldName}: ${error.message}`;
  });
}

/**
 * Group errors by field for form display
 */
export function groupErrorsByField(
  errors: ValidationError[]
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  errors.forEach((error) => {
    if (!grouped[error.field]) {
      grouped[error.field] = [];
    }
    grouped[error.field].push(error.message);
  });

  return grouped;
}

/**
 * Check if a specific field has errors
 */
export function hasFieldError(
  errors: ValidationError[],
  fieldName: string
): boolean {
  return errors.some(
    (error) =>
      error.field === fieldName || error.field.startsWith(`${fieldName}.`)
  );
}

/**
 * Get errors for a specific field
 */
export function getFieldErrors(
  errors: ValidationError[],
  fieldName: string
): ValidationError[] {
  return errors.filter(
    (error) =>
      error.field === fieldName || error.field.startsWith(`${fieldName}.`)
  );
}

/**
 * Validate required fields are present
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  requiredFields.forEach((field) => {
    if (
      !data[field] ||
      (typeof data[field] === "string" && data[field].trim() === "")
    ) {
      errors.push({
        field,
        message: `${field} is required`,
        code: "required",
      });
    }
  });

  return errors;
}

/**
 * Sanitize and validate JSON data before saving
 */
export function sanitizeJsonData(data: unknown): unknown {
  const sanitized = JSON.parse(
    JSON.stringify(data, (key, value) => {
      if (value === undefined) return null;
      if (typeof value === "string") return value.trim();
      return value;
    })
  );

  return sanitized;
}

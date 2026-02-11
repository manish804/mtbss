/**
 * Simplified Content Management
 * 
 * Replaces the complex content-management.ts with a streamlined version
 * focused on validation and type checking without complex caching
 */

import { 
  JobContent, 
  ServiceContent, 
  PageContent, 
  SiteContent,
  Department
} from './content-types';
import { validateStyling } from './styling-utils';

type UnknownRecord = Record<string, unknown>;

function isUnknownRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export class ContentManagementError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ContentManagementError';
  }
}

export class ContentValidationError extends ContentManagementError {
  constructor(message: string, public field?: string, public value?: unknown) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'ContentValidationError';
  }
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
  severity: 'error';
}

export interface ValidationWarning {
  field: string;
  message: string;
  value?: unknown;
  severity: 'warning';
}

/**
 * Content validation schemas
 */
export const VALIDATION_SCHEMAS = {
  job: {
    required: ['id', 'title', 'department', 'location', 'jobType', 'description', 'responsibilities', 'requirements'],
    optional: ['experience', 'salaryRange', 'benefits', 'styling', 'published', 'lastModified'],
  },
  service: {
    required: ['id', 'slug', 'title', 'description', 'shortDescription'],
    optional: ['features', 'image', 'ctaText', 'ctaLink', 'styling', 'published', 'lastModified'],
  },
  page: {
    required: ['id', 'pageId', 'sections'],
    optional: ['styling', 'published', 'lastModified'],
  }
};

/**
 * Validate content item against schema
 */
export function validateContentItem(
  item: unknown,
  type: keyof typeof VALIDATION_SCHEMAS
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const schema = VALIDATION_SCHEMAS[type];

  if (!isUnknownRecord(item)) {
    errors.push({
      field: 'root',
      message: `Content item must be an object, got ${typeof item}`,
      value: item,
      severity: 'error'
    });
    return { isValid: false, errors, warnings };
  }

  const record = item;

  // Check required fields
  for (const field of schema.required) {
    if (!(field in record) || record[field] === null || record[field] === undefined) {
      errors.push({
        field,
        message: `Required field "${field}" is missing`,
        value: record[field],
        severity: 'error'
      });
    }
  }

  // Validate styling if present
  if (isUnknownRecord(record.styling)) {
    const stylingValidation = validateStyling(record.styling);
    if (!stylingValidation.isValid) {
      stylingValidation.errors.forEach(error => {
        errors.push({
          field: `styling.${error}`,
          message: `Invalid styling: ${error}`,
          severity: 'error'
        });
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Type guards for content validation
 */
export const ContentTypeGuards = {
  isJobContent(item: unknown): item is JobContent {
    const validation = validateContentItem(item, 'job');
    return validation.isValid;
  },

  isServiceContent(item: unknown): item is ServiceContent {
    const validation = validateContentItem(item, 'service');
    return validation.isValid;
  },

  isPageContent(item: unknown): item is PageContent {
    const validation = validateContentItem(item, 'page');
    return validation.isValid;
  },

  isSiteContent(item: unknown): item is SiteContent {
    if (!isUnknownRecord(item)) return false;
    
    const requiredProps = ['jobOpenings', 'services', 'pages', 'departments'];
    for (const prop of requiredProps) {
      if (!(prop in item) || !Array.isArray(item[prop])) {
        return false;
      }
    }

    return true;
  },

  isDepartment(item: unknown): item is Department {
    return isUnknownRecord(item) && 
           typeof item.key === 'string' && 
           typeof item.label === 'string';
  }
};

/**
 * Runtime type checking with detailed error reporting
 */
export function checkContentType<T>(
  item: unknown,
  typeName: string,
  typeGuard: (item: unknown) => item is T
): { isValid: boolean; item?: T; errors: string[] } {
  const errors: string[] = [];
  
  try {
    if (typeGuard(item)) {
      return { isValid: true, item: item as T, errors: [] };
    } else {
      errors.push(`Item does not match expected type: ${typeName}`);
      return { isValid: false, errors };
    }
  } catch (error) {
    errors.push(`Type checking failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors };
  }
}

const simpleContentManagement = {
  validate: validateContentItem,
  typeGuards: ContentTypeGuards,
  checkType: checkContentType,
  errors: {
    ContentManagementError,
    ContentValidationError
  }
};

export default simpleContentManagement;

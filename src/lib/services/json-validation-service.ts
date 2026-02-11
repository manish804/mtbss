/**
 * JSON Validation Service
 * Centralized service for validating and managing JSON content with comprehensive error handling
 */

import {
  validatePageContent,
  validateHomePageContent,
  validateAboutPageContent,
  validateServicesPageContent,
  validateContactPageContent,
  validateJobsPageContent,
  validateContentData,
  validatePageSection,
  validateTeamImageFormData,
  validateServiceFormData,
  validateDepartmentFormData,
  validateBenefitFormData,
  validateCompanyCultureFormData,
  validateTypeConsistency,
  sanitizeJsonData,
} from "@/lib/utils/json-validation";

import formatValidationErrors, {
  getFriendlyErrorMessage,
  addErrorContext,
  filterErrorsBySeverity,
  getSuccessMessage,
  getValidationSummary,
  getErrorSuggestions,
  getAutoFixSuggestions,
} from "@/lib/utils/json-error-handling";

import checkTypeConsistency from "@/lib/utils/type-consistency-checker";

import type {
  ValidationResult,
  ValidationError,
  JsonUpdateResponse,
  JsonSectionUpdateRequest,
} from "@/lib/types/json-schemas";

export class JsonValidationService {
  /**
   * Validate any page content with enhanced error reporting
   */
  static async validatePage(
    content: unknown,
    pageId?: string
  ): Promise<ValidationResult> {
    try {
      const result = validatePageContent(content);

      if (!result.isValid && pageId) {
        result.errors = addErrorContext(result.errors, { pageId });
      }

      return result;
    } catch (error) {
      return {
        isValid: false,
        errors: [
          {
            field: "general",
            message:
              error instanceof Error
                ? error.message
                : "Unknown validation error",
            code: "validation_error",
          },
        ],
        data: null,
      };
    }
  }

  /**
   * Validate specific page type with detailed feedback
   */
  static async validateSpecificPage(
    content: unknown,
    pageType: "home" | "about" | "services" | "contact" | "jobs"
  ): Promise<ValidationResult> {
    let result: ValidationResult;

    switch (pageType) {
      case "home":
        result = validateHomePageContent(content);
        break;
      case "about":
        result = validateAboutPageContent(content);
        break;
      case "services":
        result = validateServicesPageContent(content);
        break;
      case "contact":
        result = validateContactPageContent(content);
        break;
      case "jobs":
        result = validateJobsPageContent(content);
        break;
      default:
        return {
          isValid: false,
          errors: [
            {
              field: "pageType",
              message: `Unknown page type: ${pageType}`,
              code: "invalid_enum_value",
            },
          ],
          data: null,
        };
    }

    if (!result.isValid) {
      result.errors = addErrorContext(result.errors, { pageId: pageType });
    }

    return result;
  }

  /**
   * Validate page section with context
   */
  static async validateSection(
    pageId: string,
    sectionKey: string,
    sectionData: unknown
  ): Promise<ValidationResult> {
    const result = validatePageSection(pageId, sectionKey, sectionData);

    if (!result.isValid) {
      result.errors = addErrorContext(result.errors, { pageId, sectionKey });
    }

    return result;
  }

  /**
   * Validate content data with detailed error reporting
   */
  static async validateContentData(
    content: unknown
  ): Promise<ValidationResult> {
    const result = validateContentData(content);

    if (!result.isValid) {
      result.errors = addErrorContext(result.errors, { pageId: "contentData" });
    }

    return result;
  }

  /**
   * Validate team image form data
   */
  static async validateTeamImageForm(data: unknown): Promise<ValidationResult> {
    return validateTeamImageFormData(data);
  }

  /**
   * Validate service form data
   */
  static async validateServiceForm(data: unknown): Promise<ValidationResult> {
    return validateServiceFormData(data);
  }

  /**
   * Validate department form data
   */
  static async validateDepartmentForm(
    data: unknown
  ): Promise<ValidationResult> {
    return validateDepartmentFormData(data);
  }

  /**
   * Validate benefit form data
   */
  static async validateBenefitForm(data: unknown): Promise<ValidationResult> {
    return validateBenefitFormData(data);
  }

  /**
   * Validate company culture form data
   */
  static async validateCompanyCultureForm(
    data: unknown
  ): Promise<ValidationResult> {
    return validateCompanyCultureFormData(data);
  }

  /**
   * Validate multiple items with progress tracking
   */
  static async validateMultipleItems<T>(
    items: unknown[],
    validator: (item: unknown) => ValidationResult,
    onProgress?: (current: number, total: number) => void
  ): Promise<{
    validItems: T[];
    errors: { index: number; errors: ValidationError[] }[];
  }> {
    const result = {
      validItems: [] as T[],
      errors: [] as { index: number; errors: ValidationError[] }[],
    };

    for (let i = 0; i < items.length; i++) {
      const validationResult = validator(items[i]);

      if (validationResult.isValid && validationResult.data) {
        result.validItems.push(validationResult.data as T);
      } else {
        result.errors.push({
          index: i,
          errors: addErrorContext(validationResult.errors, { itemIndex: i }),
        });
      }

      if (onProgress) {
        onProgress(i + 1, items.length);
      }
    }

    return result;
  }

  /**
   * Validate type consistency across all JSON files
   */
  static async validateAllFiles(jsonFiles: {
    home?: unknown;
    about?: unknown;
    services?: unknown;
    contact?: unknown;
    jobs?: unknown;
    contentData?: unknown;
  }): Promise<ValidationResult> {
    const result = validateTypeConsistency(jsonFiles);

    if (!result.isValid) {
      const errorsByFile: Record<string, ValidationError[]> = {};

      result.errors.forEach((error) => {
        const fileName = error.field.split(".")[0];
        if (!errorsByFile[fileName]) {
          errorsByFile[fileName] = [];
        }
        errorsByFile[fileName].push(error);
      });
    }

    return result;
  }

  /**
   * Perform comprehensive consistency check
   */
  static async performConsistencyCheck(jsonFiles: {
    home?: unknown;
    about?: unknown;
    services?: unknown;
    contact?: unknown;
    jobs?: unknown;
    contentData?: unknown;
  }) {
    return await checkTypeConsistency(jsonFiles);
  }

  /**
   * Format validation errors for user display
   */
  static formatErrors(errors: ValidationError[]) {
    return formatValidationErrors(errors);
  }

  /**
   * Get user-friendly error message
   */
  static getFriendlyMessage(error: ValidationError): string {
    return getFriendlyErrorMessage(error);
  }

  /**
   * Filter errors by severity
   */
  static filterBySeverity(errors: ValidationError[]) {
    return filterErrorsBySeverity(errors);
  }

  /**
   * Get suggestions for fixing errors
   */
  static getFixSuggestions(error: ValidationError): string[] {
    return getErrorSuggestions(error);
  }

  /**
   * Get auto-fix suggestions
   */
  static getAutoFix(error: ValidationError, currentValue: unknown) {
    return getAutoFixSuggestions(error, currentValue);
  }

  /**
   * Generate success message
   */
  static getSuccessMessage(context: {
    action: "create" | "update" | "delete";
    itemType: string;
    itemName?: string;
  }): string {
    return getSuccessMessage(context);
  }

  /**
   * Generate validation summary
   */
  static getValidationSummary(results: {
    valid: number;
    invalid: number;
    total: number;
  }): string {
    return getValidationSummary(results);
  }

  /**
   * Sanitize JSON data before validation/saving
   */
  static sanitizeData(data: unknown): unknown {
    return sanitizeJsonData(data);
  }

  /**
   * Complete validation workflow for updating JSON content
   */
  static async validateForUpdate(
    request: JsonSectionUpdateRequest
  ): Promise<JsonUpdateResponse> {
    try {
      const sanitizedData = this.sanitizeData(request.sectionData);

      if (request.validate !== false) {
        const validationResult = await this.validateSection(
          "unknown",
          request.sectionKey,
          sanitizedData
        );

        if (!validationResult.isValid) {
          const formattedErrors = this.formatErrors(validationResult.errors);

          return {
            success: false,
            message: formattedErrors.summary,
            errors: validationResult.errors,
          };
        }
      }

      return {
        success: true,
        message: "Validation passed successfully",
        data: sanitizedData,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown validation error",
        errors: [
          {
            field: "general",
            message: error instanceof Error ? error.message : "Unknown error",
            code: "validation_error",
          },
        ],
      };
    }
  }

  /**
   * Validate and prepare data for saving
   */
  static async prepareForSave(
    data: unknown,
    validationType: "page" | "contentData" | "section",
    context?: { pageId?: string; sectionKey?: string }
  ): Promise<JsonUpdateResponse> {
    try {
      const sanitizedData = this.sanitizeData(data);

      let validationResult: ValidationResult;

      switch (validationType) {
        case "page":
          validationResult = await this.validatePage(
            sanitizedData,
            context?.pageId
          );
          break;
        case "contentData":
          validationResult = await this.validateContentData(sanitizedData);
          break;
        case "section":
          if (!context?.pageId || !context?.sectionKey) {
            throw new Error(
              "Page ID and section key required for section validation"
            );
          }
          validationResult = await this.validateSection(
            context.pageId,
            context.sectionKey,
            sanitizedData
          );
          break;
        default:
          throw new Error(`Unknown validation type: ${validationType}`);
      }

      if (!validationResult.isValid) {
        const formattedErrors = this.formatErrors(validationResult.errors);

        return {
          success: false,
          message: formattedErrors.summary,
          errors: validationResult.errors,
        };
      }

      return {
        success: true,
        message: "Data is valid and ready to save",
        data: sanitizedData,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Validation preparation failed",
        errors: [
          {
            field: "general",
            message: error instanceof Error ? error.message : "Unknown error",
            code: "preparation_error",
          },
        ],
      };
    }
  }
}

export default JsonValidationService;

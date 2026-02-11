/**
 * Content Management Utilities
 * 
 * This module provides comprehensive utilities for managing dynamic content,
 * including validation, type checking, development tools, error handling,
 * and performance optimization through caching.
 */

import { 
  JobContent, 
  ServiceContent, 
  PageContent, 
  SiteContent,
  Department,
  ButtonStyling,
  CardStyling,
  SectionStyling
} from './content-types';
import { validateStyling } from './styling-utils';

type UnknownRecord = Record<string, unknown>;

function isUnknownRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toUnknownRecord(value: unknown): UnknownRecord {
  return isUnknownRecord(value) ? value : {};
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

export class ContentCacheError extends ContentManagementError {
  constructor(message: string, public cacheKey?: string) {
    super(message, 'CACHE_ERROR', { cacheKey });
    this.name = 'ContentCacheError';
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
    types: {
      id: 'string',
      title: 'string',
      department: 'string',
      location: 'string',
      jobType: 'string',
      experience: 'string',
      description: 'string',
      responsibilities: 'array',
      requirements: 'array',
      salaryRange: 'string',
      benefits: 'array',
      styling: 'object',
      published: 'boolean',
      lastModified: 'string'
    }
  },
  service: {
    required: ['id', 'slug', 'title', 'description', 'shortDescription'],
    optional: ['features', 'image', 'ctaText', 'ctaLink', 'styling', 'published', 'lastModified'],
    types: {
      id: 'string',
      slug: 'string',
      title: 'string',
      description: 'string',
      shortDescription: 'string',
      features: 'array',
      image: 'object',
      ctaText: 'string',
      ctaLink: 'string',
      styling: 'object',
      published: 'boolean',
      lastModified: 'string'
    }
  },
  page: {
    required: ['id', 'pageId', 'sections'],
    optional: ['styling', 'published', 'lastModified'],
    types: {
      id: 'string',
      pageId: 'string',
      sections: 'array',
      styling: 'object',
      published: 'boolean',
      lastModified: 'string'
    }
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

  
  for (const [field, expectedType] of Object.entries(schema.types)) {
    if (field in record && record[field] !== null && record[field] !== undefined) {
      const actualType = Array.isArray(record[field]) ? 'array' : typeof record[field];
      
      if (actualType !== expectedType) {
        errors.push({
          field,
          message: `Field "${field}" should be ${expectedType}, got ${actualType}`,
          value: record[field],
          severity: 'error'
        });
      }
    }
  }

  
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

  
  if (type === 'job') {
    validateJobSpecific(record, errors, warnings);
  } else if (type === 'service') {
    validateServiceSpecific(record, errors, warnings);
  } else if (type === 'page') {
    validatePageSpecific(record, errors, warnings);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Job-specific validation
 */
function validateJobSpecific(
  job: UnknownRecord,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const responsibilities = job.responsibilities;
  
  if (Array.isArray(responsibilities)) {
    if (responsibilities.length === 0) {
      warnings.push({
        field: 'responsibilities',
        message: 'Job should have at least one responsibility',
        severity: 'warning'
      });
    }
    
    responsibilities.forEach((resp: unknown, index: number) => {
      if (typeof resp !== 'string') {
        errors.push({
          field: `responsibilities[${index}]`,
          message: 'Responsibility must be a string',
          value: resp,
          severity: 'error'
        });
      }
    });
  }

  const requirements = job.requirements;
  
  if (Array.isArray(requirements)) {
    if (requirements.length === 0) {
      warnings.push({
        field: 'requirements',
        message: 'Job should have at least one requirement',
        severity: 'warning'
      });
    }
    
    requirements.forEach((req: unknown, index: number) => {
      if (typeof req !== 'string') {
        errors.push({
          field: `requirements[${index}]`,
          message: 'Requirement must be a string',
          value: req,
          severity: 'error'
        });
      }
    });
  }

  const salaryRange = job.salaryRange;
  
  if (typeof salaryRange === 'string') {
    const salaryPattern = /^\$[\d,]+ - \$[\d,]+$|^\$[\d,]+ per hour$|^Competitive$/i;
    if (!salaryPattern.test(salaryRange)) {
      warnings.push({
        field: 'salaryRange',
        message: 'Salary range format may not be standard',
        value: salaryRange,
        severity: 'warning'
      });
    }
  }

  
  const validDepartments = ['finance', 'hr', 'technology', 'marketing', 'operations'];
  const department = job.department;
  if (typeof department === 'string' && !validDepartments.includes(department)) {
    warnings.push({
      field: 'department',
      message: `Department "${department}" is not in the standard list`,
      value: department,
      severity: 'warning'
    });
  }
}

/**
 * Service-specific validation
 */
function validateServiceSpecific(
  service: UnknownRecord,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const slug = service.slug;
  
  if (typeof slug === 'string') {
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      errors.push({
        field: 'slug',
        message: 'Slug must be lowercase with hyphens only',
        value: slug,
        severity: 'error'
      });
    }
  }

  const description = service.description;
  
  if (typeof description === 'string' && description.length < 50) {
    warnings.push({
      field: 'description',
      message: 'Service description should be at least 50 characters for SEO',
      value: description.length,
      severity: 'warning'
    });
  }

  const ctaLink = service.ctaLink;
  
  if (typeof ctaLink === 'string') {
    const linkPattern = /^(\/|https?:\/\/)/;
    if (!linkPattern.test(ctaLink)) {
      warnings.push({
        field: 'ctaLink',
        message: 'CTA link should be a relative path or full URL',
        value: ctaLink,
        severity: 'warning'
      });
    }
  }
}

/**
 * Page-specific validation
 */
function validatePageSpecific(
  page: UnknownRecord,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  const pageId = page.pageId;
  
  if (typeof pageId === 'string') {
    const pageIdPattern = /^[a-z0-9-]+$/;
    if (!pageIdPattern.test(pageId)) {
      errors.push({
        field: 'pageId',
        message: 'Page ID must be lowercase with hyphens only',
        value: pageId,
        severity: 'error'
      });
    }
  }

  const sections = page.sections;
  
  if (Array.isArray(sections)) {
    if (sections.length === 0) {
      warnings.push({
        field: 'sections',
        message: 'Page should have at least one section',
        severity: 'warning'
      });
    }

    sections.forEach((section: unknown, index: number) => {
      const sectionRecord = isUnknownRecord(section) ? section : null;

      if (!sectionRecord || typeof sectionRecord.id !== 'string') {
        errors.push({
          field: `sections[${index}].id`,
          message: 'Section must have a string ID',
          value: sectionRecord?.id,
          severity: 'error'
        });
      }

      if (!sectionRecord || typeof sectionRecord.type !== 'string') {
        errors.push({
          field: `sections[${index}].type`,
          message: 'Section must have a string type',
          value: sectionRecord?.type,
          severity: 'error'
        });
      }
    });
  }
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
  },

  isButtonStyling(item: unknown): item is ButtonStyling {
    if (!isUnknownRecord(item)) return false;
    
    const validation = validateStyling(item);
    return validation.isValid;
  },

  isCardStyling(item: unknown): item is CardStyling {
    if (!isUnknownRecord(item)) return false;
    
    const validation = validateStyling(item);
    return validation.isValid;
  },

  isSectionStyling(item: unknown): item is SectionStyling {
    if (!isUnknownRecord(item)) return false;
    
    const validation = validateStyling(item);
    return validation.isValid;
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





interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; 
  hits: number;
}

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
}

/**
 * Simple in-memory cache for content data
 */
export class ContentCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private stats = {
    hits: 0,
    misses: 0
  };

  constructor(private defaultTTL: number = 5 * 60 * 1000) {} 

  /**
   * Get item from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    this.stats.hits++;
    return entry.data as T;
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists in cache and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete item from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    
    
    let memoryUsage = 0;
    for (const [key, entry] of this.cache.entries()) {
      memoryUsage += key.length * 2; 
      memoryUsage += JSON.stringify(entry.data).length * 2;
      memoryUsage += 32; 
    }

    return {
      totalEntries: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let removedCount = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    return removedCount;
  }

  /**
   * Get or set with a factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      const data = await factory();
      this.set(key, data, ttl);
      return data;
    } catch {
      throw new ContentCacheError(
        `Failed to generate cache data for key: ${key}`,
        key
      );
    }
  }
}


export const contentCache = new ContentCache();





/**
 * Development utilities for content management
 */
export class ContentDevUtils {
  /**
   * Validate entire site content structure
   */
  static validateSiteContent(siteContent: unknown): {
    isValid: boolean;
    summary: {
      totalItems: number;
      validItems: number;
      invalidItems: number;
      warnings: number;
    };
    details: {
      jobs: ValidationResult[];
      services: ValidationResult[];
      pages: ValidationResult[];
    };
  } {
    const details = {
      jobs: [] as ValidationResult[],
      services: [] as ValidationResult[],
      pages: [] as ValidationResult[]
    };

    let totalItems = 0;
    let validItems = 0;
    let invalidItems = 0;
    let totalWarnings = 0;

    
    const siteRecord = toUnknownRecord(siteContent);

    if (Array.isArray(siteRecord.jobOpenings)) {
      for (const job of siteRecord.jobOpenings) {
        const result = validateContentItem(job, 'job');
        details.jobs.push(result);
        totalItems++;
        
        if (result.isValid) {
          validItems++;
        } else {
          invalidItems++;
        }
        
        totalWarnings += result.warnings.length;
      }
    }

    
    if (Array.isArray(siteRecord.services)) {
      for (const service of siteRecord.services) {
        const result = validateContentItem(service, 'service');
        details.services.push(result);
        totalItems++;
        
        if (result.isValid) {
          validItems++;
        } else {
          invalidItems++;
        }
        
        totalWarnings += result.warnings.length;
      }
    }

    
    if (Array.isArray(siteRecord.pages)) {
      for (const page of siteRecord.pages) {
        const result = validateContentItem(page, 'page');
        details.pages.push(result);
        totalItems++;
        
        if (result.isValid) {
          validItems++;
        } else {
          invalidItems++;
        }
        
        totalWarnings += result.warnings.length;
      }
    }

    return {
      isValid: invalidItems === 0,
      summary: {
        totalItems,
        validItems,
        invalidItems,
        warnings: totalWarnings
      },
      details
    };
  }

  /**
   * Generate content validation report
   */
  static generateValidationReport(siteContent: unknown): string {
    const validation = this.validateSiteContent(siteContent);
    const { summary, details } = validation;
    
    let report = '# Content Validation Report\n\n';
    report += `## Summary\n`;
    report += `- Total Items: ${summary.totalItems}\n`;
    report += `- Valid Items: ${summary.validItems}\n`;
    report += `- Invalid Items: ${summary.invalidItems}\n`;
    report += `- Warnings: ${summary.warnings}\n`;
    report += `- Overall Status: ${validation.isValid ? '✅ VALID' : '❌ INVALID'}\n\n`;

    
    if (details.jobs.length > 0) {
      report += `## Job Openings (${details.jobs.length} items)\n`;
      details.jobs.forEach((result, index) => {
        const status = result.isValid ? '✅' : '❌';
        report += `${status} Job ${index + 1}\n`;
        
        if (result.errors.length > 0) {
          report += '  **Errors:**\n';
          result.errors.forEach(error => {
            report += `  - ${error.field}: ${error.message}\n`;
          });
        }
        
        if (result.warnings.length > 0) {
          report += '  **Warnings:**\n';
          result.warnings.forEach(warning => {
            report += `  - ${warning.field}: ${warning.message}\n`;
          });
        }
        
        report += '\n';
      });
    }

    
    if (details.services.length > 0) {
      report += `## Services (${details.services.length} items)\n`;
      details.services.forEach((result, index) => {
        const status = result.isValid ? '✅' : '❌';
        report += `${status} Service ${index + 1}\n`;
        
        if (result.errors.length > 0) {
          report += '  **Errors:**\n';
          result.errors.forEach(error => {
            report += `  - ${error.field}: ${error.message}\n`;
          });
        }
        
        if (result.warnings.length > 0) {
          report += '  **Warnings:**\n';
          result.warnings.forEach(warning => {
            report += `  - ${warning.field}: ${warning.message}\n`;
          });
        }
        
        report += '\n';
      });
    }

    
    if (details.pages.length > 0) {
      report += `## Pages (${details.pages.length} items)\n`;
      details.pages.forEach((result, index) => {
        const status = result.isValid ? '✅' : '❌';
        report += `${status} Page ${index + 1}\n`;
        
        if (result.errors.length > 0) {
          report += '  **Errors:**\n';
          result.errors.forEach(error => {
            report += `  - ${error.field}: ${error.message}\n`;
          });
        }
        
        if (result.warnings.length > 0) {
          report += '  **Warnings:**\n';
          result.warnings.forEach(warning => {
            report += `  - ${warning.field}: ${warning.message}\n`;
          });
        }
        
        report += '\n';
      });
    }

    return report;
  }

  /**
   * Preview styling changes without applying them
   */
  static previewStyling(
    originalStyling: object,
    newStyling: object
  ): {
    preview: Record<string, unknown>;
    changes: {
      added: string[];
      modified: string[];
      removed: string[];
    };
    validation: ValidationResult;
  } {
    const original = toUnknownRecord(originalStyling);
    const updated = toUnknownRecord(newStyling);
    const preview = { ...original, ...updated };
    const changes = {
      added: [] as string[],
      modified: [] as string[],
      removed: [] as string[]
    };

    
    for (const key in updated) {
      if (!(key in original)) {
        changes.added.push(key);
      } else if (original[key] !== updated[key]) {
        changes.modified.push(key);
      }
    }

    for (const key in original) {
      if (!(key in updated)) {
        changes.removed.push(key);
      }
    }

    
    const validation = validateStyling(preview);

    return {
      preview,
      changes,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors.map(error => ({
          field: 'styling',
          message: error,
          severity: 'error' as const
        })),
        warnings: []
      }
    };
  }

  /**
   * Generate sample content for testing
   */
  static generateSampleContent(): {
    job: JobContent;
    service: ServiceContent;
    page: PageContent;
  } {
    return {
      job: {
        id: 'sample-job-001',
        type: 'job',
        title: 'Sample Job Title',
        department: 'technology',
        location: 'Remote',
        jobType: 'Full-time',
        experience: '2-4 years',
        description: 'This is a sample job description for testing purposes.',
        responsibilities: [
          'Sample responsibility 1',
          'Sample responsibility 2'
        ],
        requirements: [
          'Sample requirement 1',
          'Sample requirement 2'
        ],
        salaryRange: '$50,000 - $70,000',
        benefits: ['Health insurance', 'Remote work'],
        styling: {
          cardStyle: {
            backgroundColor: 'bg-white',
            textColor: 'text-gray-900',
            borderColor: 'border-blue-200'
          }
        },
        published: true,
        lastModified: new Date().toISOString()
      },
      service: {
        id: 'sample-service-001',
        type: 'service',
        slug: 'sample-service',
        title: 'Sample Service',
        description: 'This is a sample service description for testing purposes.',
        shortDescription: 'Sample service',
        features: ['Feature 1', 'Feature 2'],
        image: {
          id: 'sample-service-image',
          description: 'Sample service image',
          imageUrl: 'https://picsum.photos/seed/sample/400/300',
          imageHint: 'sample service'
        },
        ctaText: 'Learn More',
        ctaLink: '/contact',
        published: true,
        lastModified: new Date().toISOString()
      },
      page: {
        id: 'sample-page-001',
        type: 'page',
        pageId: 'sample',
        sections: [
          {
            id: 'hero',
            type: 'hero',
            title: 'Sample Page Title',
            subtitle: 'Sample subtitle'
          }
        ],
        published: true,
        lastModified: new Date().toISOString()
      }
    };
  }

  /**
   * Analyze content performance and suggest optimizations
   */
  static analyzeContentPerformance(siteContent: unknown): {
    analysis: {
      totalSize: number;
      itemCounts: Record<string, number>;
      averageSizes: Record<string, number>;
      largestItems: Array<{ type: string; id: string; size: number }>;
    };
    suggestions: string[];
  } {
    const analysis = {
      totalSize: 0,
      itemCounts: {} as Record<string, number>,
      averageSizes: {} as Record<string, number>,
      largestItems: [] as Array<{ type: string; id: string; size: number }>
    };

    const suggestions: string[] = [];
    const allItems: Array<{ type: string; id: string; size: number; item: unknown }> = [];
    const siteRecord = toUnknownRecord(siteContent);

    
    const contentTypes = ['jobOpenings', 'services', 'pages'];
    
    for (const contentType of contentTypes) {
      if (Array.isArray(siteRecord[contentType])) {
        const items = siteRecord[contentType];
        analysis.itemCounts[contentType] = items.length;
        
        let totalTypeSize = 0;
        
        for (const item of items) {
          const itemSize = JSON.stringify(item).length;
          totalTypeSize += itemSize;
          const itemRecord = toUnknownRecord(item);
          const id = typeof itemRecord.id === 'string' ? itemRecord.id : 'unknown';
          allItems.push({ type: contentType, id, size: itemSize, item });
        }
        
        analysis.averageSizes[contentType] = items.length > 0 ? totalTypeSize / items.length : 0;
        analysis.totalSize += totalTypeSize;
      }
    }

    
    analysis.largestItems = allItems
      .sort((a, b) => b.size - a.size)
      .slice(0, 10)
      .map(({ type, id, size }) => ({ type, id, size }));

    
    if (analysis.totalSize > 100000) { 
      suggestions.push('Consider splitting large content into separate files or implementing lazy loading');
    }

    if (analysis.itemCounts.jobOpenings > 50) {
      suggestions.push('Consider implementing pagination for job listings');
    }

    if (analysis.averageSizes.jobOpenings > 2000) {
      suggestions.push('Job descriptions are quite large - consider summarizing or using expandable sections');
    }

    if (analysis.largestItems.length > 0 && analysis.largestItems[0].size > 5000) {
      suggestions.push(`Largest content item (${analysis.largestItems[0].type}:${analysis.largestItems[0].id}) is ${analysis.largestItems[0].size} bytes - consider optimization`);
    }

    return { analysis, suggestions };
  }
}





/**
 * Safe content loader with comprehensive error handling and fallbacks
 */
export class ContentLoader {
  private static cache = contentCache;

  /**
   * Load content with error handling and caching
   */
  static async loadContent<T>(
    key: string,
    loader: () => Promise<T> | T,
    options: {
      useCache?: boolean;
      cacheTTL?: number;
      fallback?: T;
      retries?: number;
      retryDelay?: number;
    } = {}
  ): Promise<{ data?: T; error?: ContentManagementError; fromCache: boolean }> {
    const {
      useCache = true,
      cacheTTL,
      fallback,
      retries = 3,
      retryDelay = 1000
    } = options;

    
    if (useCache) {
      const cached = this.cache.get<T>(key);
      if (cached !== null) {
        return { data: cached, fromCache: true };
      }
    }

    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const data = await loader();
        
        
        if (useCache) {
          this.cache.set(key, data, cacheTTL);
        }
        
        return { data, fromCache: false };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    
    const contentError = new ContentManagementError(
      `Failed to load content after ${retries} attempts: ${lastError?.message}`,
      'LOAD_ERROR',
      { key, attempts: retries, lastError: lastError?.message }
    );

    
    if (fallback !== undefined) {
      return { data: fallback, error: contentError, fromCache: false };
    }

    return { error: contentError, fromCache: false };
  }

  /**
   * Load multiple content items in parallel
   */
  static async loadMultiple(
    loaders: Array<{
      key: string;
      loader: () => Promise<unknown> | unknown;
      options?: Parameters<typeof ContentLoader.loadContent>[2];
    }>
  ): Promise<Array<{ key: string; data?: unknown; error?: ContentManagementError; fromCache: boolean }>> {
    const promises = loaders.map(async ({ key, loader, options }) => {
      const result = await this.loadContent(key, loader, options);
      return { key, ...result };
    });

    return Promise.all(promises);
  }

  /**
   * Preload content for better performance
   */
  static async preloadContent<T>(
    key: string,
    loader: () => Promise<T> | T,
    cacheTTL?: number
  ): Promise<void> {
    try {
      const data = await loader();
      this.cache.set(key, data, cacheTTL);
    } catch (error) {
      console.warn(`Failed to preload content for key: ${key}`, error);
    }
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): CacheStats {
    return this.cache.getStats();
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Clean up expired cache entries
   */
  static cleanupCache(): number {
    return this.cache.cleanup();
  }
}






const contentManagement = {
  validate: validateContentItem,
  typeGuards: ContentTypeGuards,
  checkType: checkContentType,
  cache: contentCache,
  dev: ContentDevUtils,
  loader: ContentLoader,
  errors: {
    ContentManagementError,
    ContentValidationError,
    ContentCacheError
  }
};

export default contentManagement;

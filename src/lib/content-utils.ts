import { 
  JobContent, 
  Department, 
  JobType,
  Location,
  ExperienceLevel,
  ServiceContent, 
  PageContent, 
  TeamMember, 
  Testimonial,
  Benefit,
  CompanyCulture,
  SiteContent,
  ButtonStyling,
  CardStyling,
  SectionStyling
} from './content-types';
import { 
  PageContentUtils,
  HomePageContent,
  AboutPageContent,
  ServicesPageContent,
  ContactPageContent,
  PageContent as PageSpecificContent
} from './page-content-utils';
import { 
  applyButtonStyling, 
  applyCardStyling, 
  applySectionStyling,
  applyJobCardStyling,
  applyServiceCardStyling,
  validateStyling,
  STYLING_PRESETS
} from './styling-utils';


import contentData from './content-data.json' with { type: 'json' };


const siteContent: SiteContent = contentData as SiteContent;


export class ContentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ContentError';
  }
}

export class ContentValidationError extends ContentError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ContentValidationError';
  }
}

export class ContentNotFoundError extends ContentError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
    this.name = 'ContentNotFoundError';
  }
}


export interface ContentResult<T> {
  data?: T;
  error?: ContentError;
  isLoading: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateJobContent(job: unknown): job is JobContent {
  if (!isRecord(job)) return false;
  
  const requiredFields = ['id', 'title', 'department', 'location', 'jobType', 'description'];
  for (const field of requiredFields) {
    if (!job[field] || typeof job[field] !== 'string') {
      throw new ContentValidationError(`Invalid or missing field: ${field}`, field);
    }
  }
  
  if (!Array.isArray(job.responsibilities) || !Array.isArray(job.requirements)) {
    throw new ContentValidationError('Responsibilities and requirements must be arrays');
  }
  
  return true;
}

function validateDepartment(dept: unknown): dept is Department {
  if (!isRecord(dept)) return false;
  if (!dept.key || !dept.label || typeof dept.key !== 'string' || typeof dept.label !== 'string') {
    throw new ContentValidationError('Department must have key and label strings');
  }
  return true;
}


function safeContentAccess<T>(
  accessor: () => T,
  errorMessage: string = 'Failed to access content'
): ContentResult<T> {
  try {
    const data = accessor();
    return { data, isLoading: false };
  } catch (error) {
    console.error('Content access error:', error);
    const contentError = error instanceof ContentError 
      ? error 
      : new ContentError(errorMessage, 'ACCESS_ERROR');
    return { error: contentError, isLoading: false };
  }
}

/**
 * Content utility functions for accessing job data and other content
 */
export class ContentUtils {
  /**
   * Get all published job openings with error handling
   */
  static getAllJobs(): ContentResult<JobContent[]> {
    return safeContentAccess(() => {
      if (!siteContent?.jobOpenings) {
        throw new ContentNotFoundError('Job openings data not found');
      }
      
      const jobs = siteContent.jobOpenings.filter(job => {
        if (!job.published) return false;
        try {
          validateJobContent(job);
          return true;
        } catch (error) {
          console.warn(`Invalid job content for ID ${job.id}:`, error);
          return false;
        }
      });
      
      return jobs;
    }, 'Failed to load job openings');
  }

  /**
   * Get all published job openings (legacy method for backward compatibility)
   */
  static getAllJobsSync(): JobContent[] {
    const result = this.getAllJobs();
    if (result.error) {
      console.error('Error loading jobs:', result.error);
      return [];
    }
    return result.data || [];
  }

  /**
   * Get jobs filtered by department with error handling
   * @param department - Department key to filter by, or 'all' for all jobs
   */
  static getJobsByDepartment(department: string): ContentResult<JobContent[]> {
    return safeContentAccess(() => {
      if (department === 'all') {
        const allJobsResult = this.getAllJobs();
        if (allJobsResult.error) throw allJobsResult.error;
        return allJobsResult.data || [];
      }
      
      if (!siteContent?.jobOpenings) {
        throw new ContentNotFoundError('Job openings data not found');
      }
      
      const jobs = siteContent.jobOpenings.filter(job => {
        if (!job.published || job.department !== department) return false;
        try {
          validateJobContent(job);
          return true;
        } catch (error) {
          console.warn(`Invalid job content for ID ${job.id}:`, error);
          return false;
        }
      });
      
      return jobs;
    }, `Failed to load jobs for department: ${department}`);
  }

  /**
   * Get jobs filtered by department (legacy method for backward compatibility)
   * @param department - Department key to filter by, or 'all' for all jobs
   */
  static getJobsByDepartmentSync(department: string): JobContent[] {
    const result = this.getJobsByDepartment(department);
    if (result.error) {
      console.error('Error loading jobs by department:', result.error);
      return [];
    }
    return result.data || [];
  }

  /**
   * Get jobs filtered by job type
   * @param jobType - Job type to filter by, or 'all' for all jobs
   */
  static getJobsByType(jobType: string): JobContent[] {
    if (jobType === 'all') {
      return this.getAllJobsSync();
    }
    return siteContent.jobOpenings.filter(
      job => job.published && job.jobType === jobType
    );
  }

  /**
   * Get jobs filtered by location
   * @param location - Location to filter by, or 'all' for all jobs
   */
  static getJobsByLocation(location: string): JobContent[] {
    if (location === 'all') {
      return this.getAllJobsSync();
    }
    return siteContent.jobOpenings.filter(
      job => job.published && job.location === location
    );
  }

  /**
   * Get jobs filtered by multiple criteria
   * @param filters - Object containing filter criteria
   */
  static getJobsByFilters(filters: {
    department?: string;
    jobType?: string;
    location?: string;
    experience?: string;
  }): JobContent[] {
    let jobs = this.getAllJobsSync();

    if (filters.department && filters.department !== 'all') {
      jobs = jobs.filter(job => job.department === filters.department);
    }

    if (filters.jobType && filters.jobType !== 'all') {
      jobs = jobs.filter(job => job.jobType === filters.jobType);
    }

    if (filters.location && filters.location !== 'all') {
      jobs = jobs.filter(job => job.location === filters.location);
    }

    if (filters.experience && filters.experience !== 'all') {
      
      
      jobs = jobs.filter(job => 
        job.experience.toLowerCase().includes(filters.experience!.toLowerCase())
      );
    }

    return jobs;
  }

  /**
   * Get a specific job by ID
   * @param id - Job ID to search for
   */
  static getJobById(id: string): JobContent | undefined {
    return siteContent.jobOpenings.find(
      job => job.published && job.id === id
    );
  }

  /**
   * Get all available departments with error handling
   */
  static getDepartments(): ContentResult<Department[]> {
    return safeContentAccess(() => {
      if (!siteContent?.departments) {
        throw new ContentNotFoundError('Departments data not found');
      }
      
      const departments = siteContent.departments.filter(dept => {
        try {
          validateDepartment(dept);
          return true;
        } catch (error) {
          console.warn(`Invalid department:`, error);
          return false;
        }
      });
      
      return departments;
    }, 'Failed to load departments');
  }

  /**
   * Get all available departments (legacy method for backward compatibility)
   */
  static getDepartmentsSync(): Department[] {
    const result = this.getDepartments();
    if (result.error) {
      console.error('Error loading departments:', result.error);
      
      return [{ key: 'all', label: 'All Departments' }];
    }
    return result.data || [];
  }

  /**
   * Get department label by key
   * @param key - Department key
   */
  static getDepartmentLabel(key: string): string {
    const department = siteContent.departments.find(dept => dept.key === key);
    return department?.label || key;
  }

  /**
   * Get count of jobs by department with error handling
   * @param department - Department key to count, or 'all' for total count
   */
  static getJobCount(department: string = 'all'): number {
    const result = this.getJobsByDepartment(department);
    if (result.error) {
      console.error('Error counting jobs:', result.error);
      return 0;
    }
    return result.data?.length || 0;
  }

  /**
   * Get all job types
   */
  static getJobTypes(): JobType[] {
    return siteContent.jobTypes || [];
  }

  /**
   * Get all job locations
   */
  static getLocations(): Location[] {
    return siteContent.locations || [];
  }

  /**
   * Get all experience levels
   */
  static getExperienceLevels(): ExperienceLevel[] {
    return siteContent.experienceLevels || [];
  }

  /**
   * Get all unique job locations from actual job data
   */
  static getUniqueJobLocations(): string[] {
    const locations = siteContent.jobOpenings
      .filter(job => job.published)
      .map(job => job.location);
    return [...new Set(locations)];
  }

  /**
   * Get all unique job types from actual job data
   */
  static getUniqueJobTypes(): string[] {
    const jobTypes = siteContent.jobOpenings
      .filter(job => job.published)
      .map(job => job.jobType);
    return [...new Set(jobTypes)];
  }

  /**
   * Search jobs by title or description
   * @param query - Search query string
   */
  static searchJobs(query: string): JobContent[] {
    const searchTerm = query.toLowerCase();
    return siteContent.jobOpenings.filter(job => 
      job.published && (
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.responsibilities.some(resp => resp.toLowerCase().includes(searchTerm)) ||
        job.requirements.some(req => req.toLowerCase().includes(searchTerm))
      )
    );
  }

  

  /**
   * Get all published services
   */
  static getAllServices(): ServiceContent[] {
    return siteContent.services?.filter(service => service.published) || [];
  }

  /**
   * Get service by slug
   * @param slug - Service slug to search for
   */
  static getServiceBySlug(slug: string): ServiceContent | undefined {
    return siteContent.services?.find(
      service => service.published && service.slug === slug
    );
  }

  /**
   * Get page content by page ID
   * @param pageId - Page ID to search for
   */
  static getPageContent(pageId: string): PageContent | undefined {
    return siteContent.pages?.find(
      page => page.published && page.pageId === pageId
    );
  }

  /**
   * Get all team members
   */
  static getTeamMembers(): TeamMember[] {
    return siteContent.teamMembers?.filter(member => member.published) || [];
  }

  /**
   * Get all testimonials
   */
  static getTestimonials(): Testimonial[] {
    return siteContent.testimonials?.filter(testimonial => testimonial.published) || [];
  }

  /**
   * Get all benefits
   */
  static getBenefits(): Benefit[] {
    return siteContent.benefits || [];
  }

  /**
   * Get all company culture values
   */
  static getCompanyCulture(): CompanyCulture[] {
    return siteContent.companyCulture || [];
  }

  

  /**
   * Apply button styling with fallbacks
   * @param styling - Button styling configuration
   * @param baseClasses - Base CSS classes
   * @param overrideClasses - Override CSS classes
   */
  static applyButtonStyling(
    styling?: ButtonStyling,
    baseClasses?: string,
    overrideClasses?: string
  ): string {
    return applyButtonStyling(styling, baseClasses, overrideClasses);
  }

  /**
   * Apply card styling with fallbacks
   * @param styling - Card styling configuration
   * @param baseClasses - Base CSS classes
   * @param overrideClasses - Override CSS classes
   */
  static applyCardStyling(
    styling?: CardStyling,
    baseClasses?: string,
    overrideClasses?: string
  ): string {
    return applyCardStyling(styling, baseClasses, overrideClasses);
  }

  /**
   * Apply section styling with fallbacks
   * @param styling - Section styling configuration
   * @param baseClasses - Base CSS classes
   * @param overrideClasses - Override CSS classes
   */
  static applySectionStyling(
    styling?: SectionStyling,
    baseClasses?: string,
    overrideClasses?: string
  ): string {
    return applySectionStyling(styling, baseClasses, overrideClasses);
  }

  /**
   * Apply job card styling with fallbacks
   * @param styling - Job styling configuration
   * @param baseClasses - Base CSS classes
   */
  static applyJobCardStyling(
    styling?: {
      cardStyle?: CardStyling;
      buttonStyle?: ButtonStyling;
      badgeStyle?: CardStyling;
    },
    baseClasses?: string
  ) {
    return applyJobCardStyling(styling, baseClasses);
  }

  /**
   * Apply service card styling with fallbacks
   * @param styling - Service styling configuration
   * @param baseClasses - Base CSS classes
   */
  static applyServiceCardStyling(
    styling?: {
      cardStyle?: CardStyling;
      buttonStyle?: ButtonStyling;
    },
    baseClasses?: string
  ) {
    return applyServiceCardStyling(styling, baseClasses);
  }

  /**
   * Validate styling data
   * @param styling - Styling object to validate
   */
  static validateStyling(styling: unknown): boolean {
    const result = validateStyling(styling);
    return result.isValid;
  }

  /**
   * Get styling presets
   * @param preset - Preset name (primary, secondary, success, warning)
   */
  static getStylingPreset(preset: keyof typeof STYLING_PRESETS) {
    return STYLING_PRESETS[preset];
  }

  

  /**
   * Get home page content
   */
  static getHomePageContent(): HomePageContent | null {
    return PageContentUtils.getHomeContentSync();
  }

  /**
   * Get about page content
   */
  static getAboutPageContent(): AboutPageContent | null {
    return PageContentUtils.getAboutContentSync();
  }

  /**
   * Get services page content
   */
  static getServicesPageContent(): ServicesPageContent | null {
    return PageContentUtils.getServicesContentSync();
  }

  /**
   * Get contact page content
   */
  static getContactPageContent(): ContactPageContent | null {
    return PageContentUtils.getContactContentSync();
  }

  /**
   * Get page content by page ID
   * @param pageId - Page ID to search for ('home', 'about', 'services', 'contact')
   */
  static getPageContentById(pageId: string): PageSpecificContent | null {
    return PageContentUtils.getPageContentSync(pageId);
  }

  /**
   * Check if a page is published
   * @param pageId - Page ID to check
   */
  static isPagePublished(pageId: string): boolean {
    return PageContentUtils.isPagePublished(pageId);
  }

  /**
   * Get page title by page ID
   * @param pageId - Page ID to get title for
   */
  static getPageTitle(pageId: string): string | null {
    return PageContentUtils.getPageTitle(pageId);
  }

  /**
   * Get page description by page ID
   * @param pageId - Page ID to get description for
   */
  static getPageDescription(pageId: string): string | null {
    return PageContentUtils.getPageDescription(pageId);
  }
}

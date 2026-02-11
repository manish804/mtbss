import type { 
  PageContent,
  HomePageContent, 
  AboutPageContent, 
  ServicesPageContent, 
  ContactPageContent,
  JobsPageContent
} from '@/lib/types/json-schemas';
import { 
  validateHomePageContent,
  validateAboutPageContent,
  validateServicesPageContent,
  validateContactPageContent,
  validateJobsPageContent
} from '@/lib/utils/json-validation';


export type {
  PageContent,
  HomePageContent,
  AboutPageContent,
  ServicesPageContent,
  ContactPageContent,
  JobsPageContent
};


export interface PageContentCollection {
  home: HomePageContent;
  about: AboutPageContent;
  services: ServicesPageContent;
  contact: ContactPageContent;
  jobs: JobsPageContent;
}


import homeData from '@/lib/pages/home.json' with { type: 'json' };
import aboutData from '@/lib/pages/about.json' with { type: 'json' };
import servicesData from '@/lib/pages/services.json' with { type: 'json' };
import contactData from '@/lib/pages/contact.json' with { type: 'json' };
import jobsData from '@/lib/pages/jobs.json' with { type: 'json' };


const homeContent: HomePageContent = homeData as HomePageContent;
const aboutContent: AboutPageContent = aboutData as AboutPageContent;
const servicesContent: ServicesPageContent = servicesData as ServicesPageContent;
const contactContent: ContactPageContent = contactData as ContactPageContent;
const jobsContent: JobsPageContent = jobsData as JobsPageContent;


export class PageContentError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PageContentError';
  }
}

export class PageContentNotFoundError extends PageContentError {
  constructor(pageId: string) {
    super(`Page content not found for: ${pageId}`, 'NOT_FOUND');
    this.name = 'PageContentNotFoundError';
  }
}

export class PageContentValidationError extends PageContentError {
  constructor(message: string, public pageId?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'PageContentValidationError';
  }
}


export interface PageContentResult<T> {
  data?: T;
  error?: PageContentError;
  isLoading: boolean;
}


function validatePageContent(content: unknown, expectedPageId: string): boolean {
  let validationResult;
  
  switch (expectedPageId) {
    case 'home':
      validationResult = validateHomePageContent(content);
      break;
    case 'about':
      validationResult = validateAboutPageContent(content);
      break;
    case 'services':
      validationResult = validateServicesPageContent(content);
      break;
    case 'contact':
      validationResult = validateContactPageContent(content);
      break;
    case 'jobs':
      validationResult = validateJobsPageContent(content);
      break;
    default:
      throw new PageContentValidationError(`Unknown page ID: ${expectedPageId}`, expectedPageId);
  }
  
  if (!validationResult.isValid) {
    const errorMessages = validationResult.errors.map(e => e.message).join(', ');
    throw new PageContentValidationError(
      `Validation failed for ${expectedPageId}: ${errorMessages}`, 
      expectedPageId
    );
  }
  
  const contentWithPublishState = content as { published?: boolean };
  if (contentWithPublishState.published === false) {
    throw new PageContentValidationError(`Page is not published: ${expectedPageId}`, expectedPageId);
  }
  
  return true;
}


function safePageContentAccess<T>(
  accessor: () => T,
  pageId: string
): PageContentResult<T> {
  try {
    const data = accessor();
    return { data, isLoading: false };
  } catch (error) {
    console.error(`Page content access error for ${pageId}:`, error);
    const contentError = error instanceof PageContentError 
      ? error 
      : new PageContentError(`Failed to access content for page: ${pageId}`, 'ACCESS_ERROR');
    return { error: contentError, isLoading: false };
  }
}

/**
 * Page content utility functions for accessing page-specific data
 */
export class PageContentUtils {
  /**
   * Get home page content with error handling
   */
  static getHomeContent(): PageContentResult<HomePageContent> {
    return safePageContentAccess(() => {
      validatePageContent(homeContent, 'home');
      return homeContent;
    }, 'home');
  }

  /**
   * Get home page content (legacy method for backward compatibility)
   */
  static getHomeContentSync(): HomePageContent | null {
    const result = this.getHomeContent();
    if (result.error) {
      console.error('Error loading home page content:', result.error);
      return null;
    }
    return result.data || null;
  }

  /**
   * Get about page content with error handling
   */
  static getAboutContent(): PageContentResult<AboutPageContent> {
    return safePageContentAccess(() => {
      validatePageContent(aboutContent, 'about');
      return aboutContent;
    }, 'about');
  }

  /**
   * Get about page content (legacy method for backward compatibility)
   */
  static getAboutContentSync(): AboutPageContent | null {
    const result = this.getAboutContent();
    if (result.error) {
      console.error('Error loading about page content:', result.error);
      return null;
    }
    return result.data || null;
  }

  /**
   * Get services page content with error handling
   */
  static getServicesContent(): PageContentResult<ServicesPageContent> {
    return safePageContentAccess(() => {
      validatePageContent(servicesContent, 'services');
      return servicesContent;
    }, 'services');
  }

  /**
   * Get services page content (legacy method for backward compatibility)
   */
  static getServicesContentSync(): ServicesPageContent | null {
    const result = this.getServicesContent();
    if (result.error) {
      console.error('Error loading services page content:', result.error);
      return null;
    }
    return result.data || null;
  }

  /**
   * Get contact page content with error handling
   */
  static getContactContent(): PageContentResult<ContactPageContent> {
    return safePageContentAccess(() => {
      validatePageContent(contactContent, 'contact');
      return contactContent;
    }, 'contact');
  }

  /**
   * Get contact page content (legacy method for backward compatibility)
   */
  static getContactContentSync(): ContactPageContent | null {
    const result = this.getContactContent();
    if (result.error) {
      console.error('Error loading contact page content:', result.error);
      return null;
    }
    return result.data || null;
  }

  /**
   * Get jobs page content with error handling
   */
  static getJobsContent(): PageContentResult<JobsPageContent> {
    return safePageContentAccess(() => {
      validatePageContent(jobsContent, 'jobs');
      return jobsContent;
    }, 'jobs');
  }

  /**
   * Get jobs page content (legacy method for backward compatibility)
   */
  static getJobsContentSync(): JobsPageContent | null {
    const result = this.getJobsContent();
    if (result.error) {
      console.error('Error loading jobs page content:', result.error);
      return null;
    }
    return result.data || null;
  }

  /**
   * Get page content by page ID with error handling
   * @param pageId - Page ID to search for ('home', 'about', 'services', 'contact', 'jobs')
   */
  static getPageContent(pageId: string): PageContentResult<PageContent> {
    switch (pageId) {
      case 'home':
        return this.getHomeContent();
      case 'about':
        return this.getAboutContent();
      case 'services':
        return this.getServicesContent();
      case 'contact':
        return this.getContactContent();
      case 'jobs':
        return this.getJobsContent();
      default:
        return {
          error: new PageContentNotFoundError(pageId),
          isLoading: false
        };
    }
  }

  /**
   * Get page content by page ID (legacy method for backward compatibility)
   * @param pageId - Page ID to search for ('home', 'about', 'services', 'contact', 'jobs')
   */
  static getPageContentSync(pageId: string): PageContent | null {
    const result = this.getPageContent(pageId);
    if (result.error) {
      console.error(`Error loading page content for ${pageId}:`, result.error);
      return null;
    }
    return result.data || null;
  }

  /**
   * Get all page content as a collection
   */
  static getAllPageContent(): PageContentResult<PageContentCollection> {
    return safePageContentAccess(() => {
      const homeResult = this.getHomeContent();
      const aboutResult = this.getAboutContent();
      const servicesResult = this.getServicesContent();
      const contactResult = this.getContactContent();
      const jobsResult = this.getJobsContent();

      
      const errors = [homeResult.error, aboutResult.error, servicesResult.error, contactResult.error, jobsResult.error]
        .filter(Boolean);
      
      if (errors.length > 0) {
        throw new PageContentError(
          `Failed to load some page content: ${errors.map(e => e?.message).join(', ')}`,
          'PARTIAL_LOAD_ERROR'
        );
      }

      return {
        home: homeResult.data!,
        about: aboutResult.data!,
        services: servicesResult.data!,
        contact: contactResult.data!,
        jobs: jobsResult.data!
      };
    }, 'all');
  }

  /**
   * Get all page content as a collection (legacy method for backward compatibility)
   */
  static getAllPageContentSync(): PageContentCollection | null {
    const result = this.getAllPageContent();
    if (result.error) {
      console.error('Error loading all page content:', result.error);
      return null;
    }
    return result.data || null;
  }

  /**
   * Check if a page exists and is published
   * @param pageId - Page ID to check
   */
  static isPagePublished(pageId: string): boolean {
    const result = this.getPageContent(pageId);
    return !result.error && result.data?.published === true;
  }

  /**
   * Get page title by page ID
   * @param pageId - Page ID to get title for
   */
  static getPageTitle(pageId: string): string | null {
    const result = this.getPageContent(pageId);
    return result.data?.title || null;
  }

  /**
   * Get page description by page ID
   * @param pageId - Page ID to get description for
   */
  static getPageDescription(pageId: string): string | null {
    const result = this.getPageContent(pageId);
    return result.data?.description || null;
  }

  /**
   * Get last modified date for a page
   * @param pageId - Page ID to get last modified date for
   */
  static getPageLastModified(pageId: string): string | null {
    const result = this.getPageContent(pageId);
    return result.data?.lastModified || null;
  }

  /**
   * Get all available page IDs
   */
  static getAvailablePageIds(): string[] {
    return ['home', 'about', 'services', 'contact', 'jobs'];
  }

  /**
   * Get all published page IDs
   */
  static getPublishedPageIds(): string[] {
    return this.getAvailablePageIds().filter(pageId => this.isPagePublished(pageId));
  }
}

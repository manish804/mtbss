/**
 * TypeScript interfaces for content-data.json structure
 */

export interface ContentDataService {
  id: string;
  type: "service";
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  features: string[];
  image: {
    id: string;
    description: string;
    imageUrl: string;
    imageHint: string;
  };
  ctaText: string;
  ctaLink: string;
  styling: {
    cardStyle: {
      backgroundColor: string;
      textColor: string;
      borderColor: string;
      hoverBackgroundColor: string;
      hoverBorderColor: string;
      shadowColor: string;
      hoverShadowColor: string;
    };
    buttonStyle: {
      backgroundColor: string;
      textColor: string;
      hoverBackgroundColor: string;
      variant: string;
    };
  };
  published: boolean;
  lastModified: string;
}

export interface ContentDataDepartment {
  key: string;
  label: string;
}

export interface ContentDataJobType {
  key: string;
  label: string;
}

export interface ContentDataLocation {
  key: string;
  label: string;
}

export interface ContentDataExperienceLevel {
  key: string;
  label: string;
}

export interface ContentDataBenefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  color: string;
}

export interface ContentDataCompanyCulture {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface ContentDataPage {
  id: string;
  type: "page";
  pageId: string;
  sections: Array<{
    id: string;
    type: string;
    title?: string;
    subtitle?: string;
    content?: string;
    image?: {
      id: string;
      description: string;
      imageUrl: string;
      imageHint: string;
    };
    styling?: Record<string, unknown>;
  }>;
  published: boolean;
  lastModified: string;
}

export interface ContentData {
  services: ContentDataService[];
  pages: ContentDataPage[];
  departments: ContentDataDepartment[];
  jobTypes: ContentDataJobType[];
  locations: ContentDataLocation[];
  experienceLevels: ContentDataExperienceLevel[];
  benefits: ContentDataBenefit[];
  companyCulture: ContentDataCompanyCulture[];
}

export interface ServiceFormData {
  title: string;
  description: string;
  shortDescription: string;
  features: string[];
  imageUrl: string;
  imageDescription: string;
  imageHint: string;
  ctaText: string;
  ctaLink: string;
  published: boolean;
}

export interface DepartmentFormData {
  key: string;
  label: string;
}

export interface BenefitFormData {
  title: string;
  description: string;
  icon: string;
  category: string;
  color: string;
}

export interface CompanyCultureFormData {
  title: string;
  description: string;
  icon: string;
  color: string;
}

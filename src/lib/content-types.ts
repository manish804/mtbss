import { ImagePlaceholder } from "@/lib/placeholder-images";

export interface ButtonStyling {
  backgroundColor?: string;
  textColor?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
  borderColor?: string;
  hoverBorderColor?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export interface CardStyling {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;
  shadowColor?: string;
  hoverShadowColor?: string;
  borderRadius?: string;
  padding?: string;
}

export interface SectionStyling {
  backgroundColor?: string;
  textColor?: string;
  hoverColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?:
    | "to-r"
    | "to-l"
    | "to-t"
    | "to-b"
    | "to-br"
    | "to-bl"
    | "to-tr"
    | "to-tl";
  padding?: string;
  margin?: string;
  buttonStyle?: ButtonStyling;
  cardStyle?: CardStyling;
}

export interface BaseContent {
  id: string;
  type: string;
  lastModified: string;
  published: boolean;
}

export interface JobContent extends BaseContent {
  type: "job";
  title: string;
  department: string;
  location: string;
  jobType: string;
  experience: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  salaryRange?: string;
  benefits?: string[];
  styling?: {
    cardStyle?: CardStyling;
    buttonStyle?: ButtonStyling;
    badgeStyle?: CardStyling;
  };
}

export interface Department {
  key: string;
  label: string;
}

export interface JobType {
  key: string;
  label: string;
}

export interface Location {
  key: string;
  label: string;
}

export interface ExperienceLevel {
  key: string;
  label: string;
}

export interface ServiceContent extends BaseContent {
  type: "service";
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  features: string[];
  image: ImagePlaceholder;
  ctaText: string;
  ctaLink: string;
  styling?: {
    cardStyle?: CardStyling;
    buttonStyle?: ButtonStyling;
  };
}

export interface PageSection {
  id: string;
  type: "hero" | "text" | "features" | "testimonial" | "contact";
  title?: string;
  subtitle?: string;
  content?: string;
  image?: ImagePlaceholder;
  items?: unknown[];
  styling?: SectionStyling;
}

export interface PageContent extends BaseContent {
  type: "page";
  pageId: string;
  sections: PageSection[];
}

export interface TeamMember extends BaseContent {
  type: "team";
  name: string;
  position: string;
  bio: string;
  image: ImagePlaceholder;
  email?: string;
  linkedin?: string;
}

export interface Testimonial extends BaseContent {
  type: "testimonial";
  name: string;
  company: string;
  position: string;
  content: string;
  rating: number;
  image?: ImagePlaceholder;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  color: string;
}

export interface CompanyCulture {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface SiteContent {
  jobOpenings: JobContent[];
  services?: ServiceContent[];
  pages?: PageContent[];
  teamMembers?: TeamMember[];
  testimonials?: Testimonial[];
  departments: Department[];
  jobTypes?: JobType[];
  locations?: Location[];
  experienceLevels?: ExperienceLevel[];
  benefits?: Benefit[];
  companyCulture?: CompanyCulture[];
  siteSettings?: SiteSettings;
}

export type {
  PageSpecificContent,
  HomePageContent,
  AboutPageContent,
  ServicesPageContent,
  ContactPageContent,
  PageContentCollection,
  ContactInfo,
  Statistic,
  ValueItem,
  ServiceHighlight,
  TeamMemberPreview,
} from "./page-content-types";

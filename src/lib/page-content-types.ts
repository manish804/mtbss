import { ImagePlaceholder } from "@/lib/placeholder-images";
import { SectionStyling } from "./content-types";

export interface BasePageContent {
  pageId: string;
  title: string;
  description: string;
  lastModified: string;
  published: boolean;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  businessHours: {
    days: string;
    hours: string;
  }[];
}

export interface Statistic {
  number: string;
  label: string;
}

export interface ValueItem {
  number?: number;
  title: string;
  description: string;
  icon?: string;
}

export interface ServiceHighlight {
  icon: string;
  title: string;
  description: string;
  link?: string;
}

export interface TeamMemberPreview {
  name: string;
  position: string;
  image: ImagePlaceholder;
}

export interface HomePageContent extends BasePageContent {
  pageId: "home";
  hero: {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    backgroundImage: ImagePlaceholder;
    styling?: SectionStyling;
  };
  aboutServices: {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    styling?: SectionStyling;
  };
  industries: {
    title: string;
    subtitle: string;
    items: ValueItem[];
    styling?: SectionStyling;
  };
  trust: {
    title: string;
    subtitle: string;
    statistics: Statistic[];
    styling?: SectionStyling;
  };
  customers: {
    title: string;
    subtitle: string;
    testimonials: {
      name: string;
      company: string;
      content: string;
      rating: number;
    }[];
    styling?: SectionStyling;
  };
  callToAction: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    styling?: SectionStyling;
  };
}

export interface AboutPageContent extends BasePageContent {
  pageId: "about";
  hero: {
    title: string;
    styling?: SectionStyling;
  };
  introduction: {
    title: string;
    description: string;
    styling?: SectionStyling;
  };
  chooseUs: {
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    image: ImagePlaceholder;
    statistics: Statistic[];
    styling?: SectionStyling;
  };
  values: {
    title: string;
    subtitle: string;
    items: ValueItem[];
    styling?: SectionStyling;
  };
  team: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
    teamImages: ImagePlaceholder[];
    styling?: SectionStyling;
  };
  contact: {
    title: string;
    subtitle: string;
    styling?: SectionStyling;
  };
}

export interface ServicesPageContent extends BasePageContent {
  pageId: "services";
  hero: {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    image: ImagePlaceholder;
    statistics: Statistic[];
    styling?: SectionStyling;
  };
  serviceHighlights: {
    title?: string;
    items: ServiceHighlight[];
    styling?: SectionStyling;
  };
}

export interface ContactPageContent extends BasePageContent {
  pageId: "contact";
  hero: {
    title: string;
    subtitle: string;
    styling?: SectionStyling;
  };
  contactInfo: ContactInfo;
  form: {
    title: string;
    styling?: SectionStyling;
  };
  testimonial: {
    enabled: boolean;
    styling?: SectionStyling;
  };
}

export type PageSpecificContent =
  | HomePageContent
  | AboutPageContent
  | ServicesPageContent
  | ContactPageContent;

export interface PageContentCollection {
  home: HomePageContent;
  about: AboutPageContent;
  services: ServicesPageContent;
  contact: ContactPageContent;
}

export interface PageData {
  id: string;
  pageId: string;
  title: string;
  description: string;
  lastModified: Date;
  isPublished: boolean;
  content: PageContent;
  createdAt: Date;
  updatedAt: Date;
}

export interface PageContent {
  pageId: string;
  title: string;
  description: string;
  lastModified: string;
  published: boolean;

  hero?: HeroSection;
  aboutServices?: AboutServicesSection;
  industries?: IndustriesSection;
  trust?: TrustSection;
  customers?: CustomersSection;
  callToAction?: CallToActionSection;
  introduction?: IntroductionSection;
  chooseUs?: ChooseUsSection;
  values?: ValuesSection;
  team?: TeamSection;
  contact?: ContactSection;
  serviceHighlights?: ServiceHighlightsSection;
  contactInfo?: ContactInfoSection;
  form?: FormSection;
  testimonial?: TestimonialSection;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface HeroSection {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImage?: ImageData;
  image?: ImageData;
  statistics?: StatisticItem[];
  styling: SectionStyling;
}

export interface ServiceItem {
  title: string;
  href: string;
  image?: ImageData;
}

export interface AboutServicesSection {
  title: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  services?: ServiceItem[];
  styling: SectionStyling;
}

export interface IndustriesSection {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: ImageData;
  items: IndustryItem[];
  styling: SectionStyling;
}

export interface TrustSection {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: ImageData;
  features?: string[];
  statistics?: StatisticItem[];
  styling: SectionStyling;
}

export interface CustomerLogo {
  name: string;
  image?: ImageData;
}

export interface CustomersSection {
  title: string;
  subtitle?: string;
  customerLogos?: CustomerLogo[];
  testimonials?: TestimonialItem[];
  styling: SectionStyling;
}

export interface CallToActionSection {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  styling: SectionStyling;
}

export interface ImageData {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

export interface StatisticItem {
  number: string;
  label: string;
}

export interface IndustryItem {
  title: string;
  description: string;
  icon: string;
}

export interface TestimonialItem {
  name: string;
  company: string;
  content: string;
  rating: number;
}

export interface SectionStyling {
  backgroundColor?: string | string[];
  textColor?: string;
  padding?: string;
  gradientDirection?: "to-r" | "to-b" | "to-br" | "to-bl";
  buttonStyle?: ButtonStyling;
  cardStyle?: CardStyling;
}

export interface ButtonStyling {
  backgroundColor?: string | string[];
  textColor?: string;
  hoverBackgroundColor?: string | string[];
  hoverTextColor?: string;
  activeBackgroundColor?: string | string[];
  activeTextColor?: string;
  size?: string;
  variant?: string;
}

export interface CardStyling {
  backgroundColor?: string | string[];
  hoverBackgroundColor?: string | string[];
  borderColor?: string;
  hoverBorderColor?: string;
  shadowColor?: string;
  hoverShadowColor?: string;
  borderRadius?: string;
  padding?: string;
}

export interface CreatePageRequest {
  pageId: string;
  title: string;
  description: string;
  content: PageContent;
  isPublished?: boolean;
}

export interface UpdatePageRequest {
  pageId?: string;
  title?: string;
  description?: string;
  content?: Partial<PageContent>;
  isPublished?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export interface IntroductionSection {
  title: string;
  description: string;
  styling: SectionStyling;
  image?: ImageData;
  teamIntro?: string;
  teamMembers?: { name: string; bio: string; image?: ImageData; }[];
}

export interface ChooseUsSection {
  title: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: ImageData;
  statistics?: StatisticItem[];
  styling: SectionStyling;
  features?: { title: string; description: string; }[];
}

export interface ValuesSection {
  title: string;
  subtitle?: string;
  items: ValueItem[];
  styling: SectionStyling;
}

export interface ValueItem {
  number: number;
  title: string;
  description: string;
}

export interface TeamSection {
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  teamImages: ImageData[];
  styling: SectionStyling;
}

export interface ContactSection {
  title: string;
  subtitle?: string;
  styling: SectionStyling;
}

export interface ServiceHighlightsSection {
  items: ServiceHighlightItem[];
  styling: SectionStyling;
}

export interface ServiceHighlightItem {
  icon: string;
  title: string;
  description: string;
}

export interface ContactInfoSection {
  phone: string;
  email: string;
  address: string;
  businessHours: BusinessHour[];
}

export interface BusinessHour {
  days: string;
  hours: string;
}

export interface FormSection {
  title: string;
  styling: SectionStyling;
}

export interface TestimonialSection {
  enabled: boolean;
  styling: SectionStyling;
}

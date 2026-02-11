/**
 * Comprehensive TypeScript interfaces for all JSON content files
 * This file provides complete type definitions for home.json, about.json,
 * services.json, contact.json, jobs.json, and content-data.json
 */

export interface BasePageContent {
  pageId: string;
  title: string;
  description: string;
  lastModified: string;
  published: boolean;
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

export interface BusinessHour {
  days: string;
  hours: string;
}

export interface ButtonStyling {
  backgroundColor?: string;
  textColor?: string;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
  activeBackgroundColor?: string;
  activeTextColor?: string;
  size?: string;
  variant?: string;
}

export interface CardStyling {
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  borderColor?: string;
  hoverBorderColor?: string;
  shadowColor?: string;
  hoverShadowColor?: string;
  borderRadius?: string;
  padding?: string;
}

export interface SectionStyling {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  gradientFrom?: string;
  gradientTo?: string;
  gradientDirection?: string;
  buttonStyle?: ButtonStyling;
  cardStyle?: CardStyling;
}

export interface HomeHeroSection {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: ImageData;
  styling: SectionStyling;
}

export interface HomeAboutServicesSection {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  styling: SectionStyling;
}

export interface IndustryItem {
  title: string;
  description: string;
  icon: string;
}

export interface HomeIndustriesSection {
  title: string;
  subtitle: string;
  items: IndustryItem[];
  styling: SectionStyling;
}

export interface HomeTrustSection {
  title: string;
  subtitle: string;
  statistics: StatisticItem[];
  styling: SectionStyling;
}

export interface TestimonialItem {
  name: string;
  company: string;
  content: string;
  rating: number;
}

export interface HomeCustomersSection {
  title: string;
  subtitle: string;
  testimonials: TestimonialItem[];
  styling: SectionStyling;
}

export interface HomeCallToActionSection {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  styling: SectionStyling;
}

export interface HomePageContent extends BasePageContent {
  pageId: "home";
  hero: HomeHeroSection;
  aboutServices: HomeAboutServicesSection;
  industries: HomeIndustriesSection;
  trust: HomeTrustSection;
  customers: HomeCustomersSection;
  callToAction: HomeCallToActionSection;
}

export interface AboutHeroSection {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  styling: SectionStyling;
}

export interface TeamMember {
  name: string;
  bio: string;
  image?: ImageData;
}

export interface AboutIntroductionSection {
  title: string;
  description: string;
  teamIntro?: string;
  teamMembers?: TeamMember[];
  image?: ImageData;
  styling: SectionStyling;
}

export interface ChooseUsFeature {
  title: string;
  description: string;
}

export interface AboutChooseUsSection {
  title: string;
  features?: ChooseUsFeature[];
  ctaText: string;
  ctaLink: string;
  image: ImageData;
  statistics: StatisticItem[];
  styling: SectionStyling;
}

export interface ValueItem {
  number: number;
  title: string;
  description: string;
}

export interface AboutValuesSection {
  title: string;
  subtitle: string;
  items: ValueItem[];
  styling: SectionStyling;
}

export interface AboutTeamSection {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  teamImages: ImageData[];
  styling: SectionStyling;
}

export interface AboutContactSection {
  title: string;
  subtitle: string;
  styling: SectionStyling;
}

export interface AboutPageContent extends BasePageContent {
  pageId: "about";
  hero: AboutHeroSection;
  introduction: AboutIntroductionSection;
  chooseUs: AboutChooseUsSection;
  values: AboutValuesSection;
  team: AboutTeamSection;
  contact: AboutContactSection;
}

export interface ServicesHeroSection {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  image: ImageData;
  statistics: StatisticItem[];
  styling: SectionStyling;
}

export interface ServiceHighlightItem {
  icon: string;
  title: string;
  description: string;
}

export interface ServicesHighlightsSection {
  items: ServiceHighlightItem[];
  styling: SectionStyling;
}

export interface ServiceDetail {
  id: string;
  category: string;
  title: string;
  description: string;
  features: string[];
  image: ImageData;
  layout: string;
  showStats?: boolean;
  showCta?: boolean;
  ctaText?: string;
  ctaLink?: string;
}

export interface ServicesDetailsSection {
  services: ServiceDetail[];
  styling: SectionStyling;
}

export interface ServicesStatsSection {
  enabled: boolean;
  statistics: StatisticItem[];
  styling: SectionStyling;
}

export interface ServicesAdditionalHighlightsSection {
  enabled: boolean;
  title?: string;
  items: ServiceHighlightItem[];
  styling: SectionStyling;
}

export interface ServicesPageContent extends BasePageContent {
  pageId: "services";
  hero: ServicesHeroSection;
  serviceHighlights: ServicesHighlightsSection;
  serviceDetails: ServicesDetailsSection;
  serviceStats: ServicesStatsSection;
  additionalServiceHighlights: ServicesAdditionalHighlightsSection;
}

export interface ContactHeroSection {
  title: string;
  subtitle: string;
  styling: SectionStyling;
}

export interface ContactInfoSection {
  phone: string;
  email: string;
  address: string;
  businessHours: BusinessHour[];
}

export interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  type?: string;
  errorMessage?: string;
}

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  enabled: boolean;
  required: boolean;
  placeholder: string;
  validation?: FormFieldValidation;
  options?: FormFieldOption[];
  rows?: number;
}

export interface FormFields {
  name: FormField;
  email: FormField;
  phone: FormField;
  company: FormField;
  serviceType: FormField;
  message: FormField;
}

export interface SubmitButton {
  text: string;
  loadingText: string;
}

export interface EmailNotifications {
  enabled: boolean;
  recipients: string[];
}

export interface FormNotifications {
  successMessage: string;
  errorMessage: string;
  emailNotifications: EmailNotifications;
}

export interface ContactFormSection {
  title: string;
  fields: FormFields;
  submitButton: SubmitButton;
  notifications: FormNotifications;
  styling: SectionStyling;
}

export interface ContactTestimonialSection {
  enabled: boolean;
  styling: SectionStyling;
}

export interface ContactPageContent extends BasePageContent {
  pageId: "contact";
  hero: ContactHeroSection;
  contactInfo: ContactInfoSection;
  form: ContactFormSection;
  testimonial: ContactTestimonialSection;
}

export interface JobsHeroSection {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  styling: SectionStyling;
}

export interface JobsStatsSection {
  enabled: boolean;
  showOpenPositions: boolean;
  showRemoteOptions: boolean;
  styling: SectionStyling;
}

export interface JobsDepartmentFiltersSection {
  enabled: boolean;
  title: string;
  showJobCounts: boolean;
  styling: SectionStyling;
}

export interface JobsListingsSection {
  title: string;
  subtitle: string;
  showDepartmentBadges: boolean;
  showLocationInfo: boolean;
  showSalaryRange: boolean;
  styling: SectionStyling;
}

export interface JobsBenefitsSection {
  enabled: boolean;
  title: string;
  subtitle: string;
  showCompanyCulture: boolean;
  styling: SectionStyling;
}

export interface JobsCallToActionSection {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  styling: SectionStyling;
}

export interface JobsPageContent extends BasePageContent {
  pageId: "jobs";
  hero: JobsHeroSection;
  jobStats: JobsStatsSection;
  departmentFilters: JobsDepartmentFiltersSection;
  jobListings: JobsListingsSection;
  benefits: JobsBenefitsSection;
  callToAction: JobsCallToActionSection;
}

export interface ContentDataService {
  id: string;
  type: "service";
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  features: string[];
  image: ImageData;
  ctaText: string;
  ctaLink: string;
  styling: {
    cardStyle: CardStyling;
    buttonStyle: ButtonStyling;
  };
  published: boolean;
  lastModified: string;
}

export interface ContentDataPageSection {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  image?: ImageData;
  styling?: SectionStyling;
}

export interface ContentDataPage {
  id: string;
  type: "page";
  pageId: string;
  sections: ContentDataPageSection[];
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

export type PageContent =
  | HomePageContent
  | AboutPageContent
  | ServicesPageContent
  | ContactPageContent
  | JobsPageContent;

export interface TeamImageFormData {
  id: string;
  imageUrl: string;
  imageHint: string;
  description: string;
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

export interface SectionFormData {
  [key: string]: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: unknown;
}

export interface JsonUpdateResponse {
  success: boolean;
  message: string;
  data?: unknown;
  errors?: ValidationError[];
}

export interface JsonSectionUpdateRequest {
  sectionKey: string;
  sectionData: unknown;
  validate?: boolean;
}

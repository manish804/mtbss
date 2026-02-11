/**
 * Comprehensive Zod validation schemas for all JSON content files
 * This file provides runtime validation for all JSON structures
 */

import { z } from "zod";

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #ff0000)");
const tailwindColorSchema = z
  .string()
  .regex(/^(bg-|text-|hover:|focus:)/, "Must be a valid Tailwind color class");
const flexibleColorSchema = z.union([
  hexColorSchema,
  tailwindColorSchema,
  z.string().min(1),
]);

const imageDataSchema = z.object({
  id: z.string().min(1, "Image ID is required"),
  description: z.string().min(1, "Image description is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  imageHint: z.string().min(1, "Image hint is required"),
});

const statisticItemSchema = z.object({
  number: z.string().min(1, "Statistic number is required"),
  label: z.string().min(1, "Statistic label is required"),
});

const businessHourSchema = z.object({
  days: z.string().min(1, "Days are required"),
  hours: z.string().min(1, "Hours are required"),
});

const basePageContentSchema = z.object({
  pageId: z.string().min(1, "Page ID is required"),
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  lastModified: z.string().datetime("Must be a valid ISO datetime"),
  published: z.boolean(),
});

const buttonStylingSchema = z.object({
  backgroundColor: flexibleColorSchema.optional(),
  textColor: flexibleColorSchema.optional(),
  hoverBackgroundColor: flexibleColorSchema.optional(),
  hoverTextColor: flexibleColorSchema.optional(),
  activeBackgroundColor: flexibleColorSchema.optional(),
  activeTextColor: flexibleColorSchema.optional(),
  size: z.string().optional(),
  variant: z.string().optional(),
});

const cardStylingSchema = z.object({
  backgroundColor: flexibleColorSchema.optional(),
  hoverBackgroundColor: flexibleColorSchema.optional(),
  borderColor: flexibleColorSchema.optional(),
  hoverBorderColor: flexibleColorSchema.optional(),
  shadowColor: flexibleColorSchema.optional(),
  hoverShadowColor: flexibleColorSchema.optional(),
  borderRadius: z.string().optional(),
  padding: z.string().optional(),
});

const sectionStylingSchema = z.object({
  backgroundColor: flexibleColorSchema.optional(),
  textColor: flexibleColorSchema.optional(),
  padding: z.string().optional(),
  gradientFrom: flexibleColorSchema.optional(),
  gradientTo: flexibleColorSchema.optional(),
  gradientDirection: z.string().optional(),
  buttonStyle: buttonStylingSchema.optional(),
  cardStyle: cardStylingSchema.optional(),
});

const homeHeroSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Hero title is required")
    .max(100, "Hero title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "Hero subtitle is required")
    .max(150, "Hero subtitle must be less than 150 characters"),
  description: z
    .string()
    .min(1, "Hero description is required")
    .max(300, "Hero description must be less than 300 characters"),
  ctaText: z
    .string()
    .min(1, "CTA text is required")
    .max(50, "CTA text must be less than 50 characters"),
  ctaLink: z.string().min(1, "CTA link is required"),
  backgroundImage: imageDataSchema,
  styling: sectionStylingSchema,
});

const homeAboutServicesSectionSchema = z.object({
  title: z
    .string()
    .min(1, "About services title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "About services subtitle is required")
    .max(200, "Subtitle must be less than 200 characters"),
  description: z
    .string()
    .min(1, "About services description is required")
    .max(400, "Description must be less than 400 characters"),
  ctaText: z
    .string()
    .min(1, "CTA text is required")
    .max(50, "CTA text must be less than 50 characters"),
  ctaLink: z.string().min(1, "CTA link is required"),
  styling: sectionStylingSchema,
});

const industryItemSchema = z.object({
  title: z
    .string()
    .min(1, "Industry title is required")
    .max(50, "Industry title must be less than 50 characters"),
  description: z
    .string()
    .min(1, "Industry description is required")
    .max(200, "Industry description must be less than 200 characters"),
  icon: z.string().min(1, "Industry icon is required"),
});

const homeIndustriesSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Industries title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "Industries subtitle is required")
    .max(200, "Subtitle must be less than 200 characters"),
  items: z
    .array(industryItemSchema)
    .min(1, "At least one industry item is required"),
  styling: sectionStylingSchema,
});

const homeTrustSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Trust title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "Trust subtitle is required")
    .max(400, "Subtitle must be less than 400 characters"),
  statistics: z
    .array(statisticItemSchema)
    .min(1, "At least one statistic is required"),
  styling: sectionStylingSchema,
});

const testimonialItemSchema = z.object({
  name: z
    .string()
    .min(1, "Testimonial name is required")
    .max(100, "Name must be less than 100 characters"),
  company: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  content: z
    .string()
    .min(1, "Testimonial content is required")
    .max(500, "Content must be less than 500 characters"),
  rating: z
    .number()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
});

const homeCustomersSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Customers title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "Customers subtitle is required")
    .max(200, "Subtitle must be less than 200 characters"),
  testimonials: z
    .array(testimonialItemSchema)
    .min(1, "At least one testimonial is required"),
  styling: sectionStylingSchema,
});

const homeCallToActionSectionSchema = z.object({
  title: z
    .string()
    .min(1, "CTA title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "CTA subtitle is required")
    .max(200, "Subtitle must be less than 200 characters"),
  ctaText: z
    .string()
    .min(1, "CTA text is required")
    .max(50, "CTA text must be less than 50 characters"),
  ctaLink: z.string().min(1, "CTA link is required"),
  styling: sectionStylingSchema,
});

export const homePageContentSchema = basePageContentSchema.extend({
  pageId: z.literal("home"),
  hero: homeHeroSectionSchema,
  aboutServices: homeAboutServicesSectionSchema,
  industries: homeIndustriesSectionSchema,
  trust: homeTrustSectionSchema,
  customers: homeCustomersSectionSchema,
  callToAction: homeCallToActionSectionSchema,
});

const aboutHeroSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Hero title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "Hero subtitle is required")
    .max(300, "Subtitle must be less than 300 characters"),
  description: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  styling: sectionStylingSchema,
});

const teamMemberSchema = z.object({
  name: z.string().min(1, "Team member name is required"),
  bio: z.string().min(1, "Team member bio is required"),
  image: imageDataSchema.optional(),
});

const aboutIntroductionSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Introduction title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Introduction description is required")
    .max(500, "Description must be less than 500 characters"),
  teamIntro: z.string().optional(),
  teamMembers: z.array(teamMemberSchema).optional(),
  image: imageDataSchema.optional(),
  styling: sectionStylingSchema,
});

const chooseUsFeatureSchema = z.object({
  title: z.string().min(1, "Feature title is required"),
  description: z.string().min(1, "Feature description is required"),
});

const aboutChooseUsSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Choose us title is required")
    .max(100, "Title must be less than 100 characters"),
  features: z.array(chooseUsFeatureSchema).optional(),
  ctaText: z
    .string()
    .min(1, "CTA text is required")
    .max(50, "CTA text must be less than 50 characters"),
  ctaLink: z.string().min(1, "CTA link is required"),
  image: imageDataSchema,
  statistics: z.array(statisticItemSchema),
  styling: sectionStylingSchema,
});

const valueItemSchema = z.object({
  number: z.number().min(1, "Value number must be at least 1"),
  title: z
    .string()
    .min(1, "Value title is required")
    .max(50, "Title must be less than 50 characters"),
  description: z
    .string()
    .min(1, "Value description is required")
    .max(200, "Description must be less than 200 characters"),
});

const aboutValuesSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Values title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "Values subtitle is required")
    .max(300, "Subtitle must be less than 300 characters"),
  items: z.array(valueItemSchema).min(1, "At least one value item is required"),
  styling: sectionStylingSchema,
});

const aboutTeamSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Team title is required")
    .max(150, "Title must be less than 150 characters"),
  subtitle: z
    .string()
    .min(1, "Team subtitle is required")
    .max(200, "Subtitle must be less than 200 characters"),
  ctaText: z
    .string()
    .min(1, "CTA text is required")
    .max(50, "CTA text must be less than 50 characters"),
  ctaLink: z.string().min(1, "CTA link is required"),
  teamImages: z
    .array(imageDataSchema)
    .min(1, "At least one team image is required"),
  styling: sectionStylingSchema,
});

const aboutContactSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Contact title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "Contact subtitle is required")
    .max(200, "Subtitle must be less than 200 characters"),
  styling: sectionStylingSchema,
});

export const aboutPageContentSchema = basePageContentSchema.extend({
  pageId: z.literal("about"),
  hero: aboutHeroSectionSchema,
  introduction: aboutIntroductionSectionSchema,
  chooseUs: aboutChooseUsSectionSchema,
  values: aboutValuesSectionSchema,
  team: aboutTeamSectionSchema,
  contact: aboutContactSectionSchema,
});

const servicesHeroSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Hero title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "Hero subtitle is required")
    .max(50, "Subtitle must be less than 50 characters"),
  description: z
    .string()
    .min(1, "Hero description is required")
    .max(500, "Description must be less than 500 characters"),
  ctaText: z
    .string()
    .min(1, "CTA text is required")
    .max(50, "CTA text must be less than 50 characters"),
  ctaLink: z.string().min(1, "CTA link is required"),
  image: imageDataSchema,
  statistics: z.array(statisticItemSchema),
  styling: sectionStylingSchema,
});

const serviceHighlightItemSchema = z.object({
  icon: z.string().min(1, "Service highlight icon is required"),
  title: z
    .string()
    .min(1, "Service highlight title is required")
    .max(50, "Title must be less than 50 characters"),
  description: z
    .string()
    .min(1, "Service highlight description is required")
    .max(200, "Description must be less than 200 characters"),
});

const servicesHighlightsSectionSchema = z.object({
  items: z
    .array(serviceHighlightItemSchema)
    .min(1, "At least one service highlight is required"),
  styling: sectionStylingSchema,
});

const serviceDetailSchema = z.object({
  id: z.string().min(1, "Service ID is required"),
  category: z
    .string()
    .min(1, "Service category is required")
    .max(50, "Category must be less than 50 characters"),
  title: z
    .string()
    .min(1, "Service title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Service description is required")
    .max(1000, "Description must be less than 1000 characters"),
  features: z.array(z.string().min(1, "Feature cannot be empty")),
  image: imageDataSchema,
  layout: z.string().min(1, "Layout is required"),
  showStats: z.boolean().optional(),
  showCta: z.boolean().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
});

const servicesDetailsSectionSchema = z.object({
  services: z
    .array(serviceDetailSchema)
    .min(1, "At least one service detail is required"),
  styling: sectionStylingSchema,
});

const servicesStatsSectionSchema = z.object({
  enabled: z.boolean(),
  statistics: z.array(statisticItemSchema),
  styling: sectionStylingSchema,
});

const servicesAdditionalHighlightsSectionSchema = z.object({
  enabled: z.boolean(),
  title: z.string().optional(),
  items: z.array(serviceHighlightItemSchema),
  styling: sectionStylingSchema,
});

export const servicesPageContentSchema = basePageContentSchema.extend({
  pageId: z.literal("services"),
  hero: servicesHeroSectionSchema,
  serviceHighlights: servicesHighlightsSectionSchema,
  serviceDetails: servicesDetailsSectionSchema,
  serviceStats: servicesStatsSectionSchema,
  additionalServiceHighlights: servicesAdditionalHighlightsSectionSchema,
});

const contactHeroSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Hero title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "Hero subtitle is required")
    .max(300, "Subtitle must be less than 300 characters"),
  styling: sectionStylingSchema,
});

const contactInfoSectionSchema = z.object({
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Must be a valid email address"),
  address: z.string().min(1, "Address is required"),
  businessHours: z
    .array(businessHourSchema)
    .min(1, "At least one business hour entry is required"),
});

const contactFormSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Form title is required")
    .max(100, "Title must be less than 100 characters"),
  styling: sectionStylingSchema,
});

const contactTestimonialSectionSchema = z.object({
  enabled: z.boolean(),
  styling: sectionStylingSchema,
});

export const contactPageContentSchema = basePageContentSchema.extend({
  pageId: z.literal("contact"),
  hero: contactHeroSectionSchema,
  contactInfo: contactInfoSectionSchema,
  form: contactFormSectionSchema,
  testimonial: contactTestimonialSectionSchema,
});

const jobsHeroSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Hero title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "Hero subtitle is required")
    .max(300, "Subtitle must be less than 300 characters"),
  description: z
    .string()
    .min(1, "Hero description is required")
    .max(400, "Description must be less than 400 characters"),
  ctaText: z
    .string()
    .min(1, "CTA text is required")
    .max(50, "CTA text must be less than 50 characters"),
  ctaLink: z.string().min(1, "CTA link is required"),
  styling: sectionStylingSchema,
});

const jobsStatsSectionSchema = z.object({
  enabled: z.boolean(),
  showOpenPositions: z.boolean(),
  showRemoteOptions: z.boolean(),
  styling: sectionStylingSchema,
});

const jobsDepartmentFiltersSectionSchema = z.object({
  enabled: z.boolean(),
  title: z
    .string()
    .min(1, "Department filters title is required")
    .max(100, "Title must be less than 100 characters"),
  showJobCounts: z.boolean(),
  styling: sectionStylingSchema,
});

const jobsListingsSectionSchema = z.object({
  title: z
    .string()
    .min(1, "Job listings title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "Job listings subtitle is required")
    .max(200, "Subtitle must be less than 200 characters"),
  showDepartmentBadges: z.boolean(),
  showLocationInfo: z.boolean(),
  showSalaryRange: z.boolean(),
  styling: sectionStylingSchema,
});

const jobsBenefitsSectionSchema = z.object({
  enabled: z.boolean(),
  title: z
    .string()
    .min(1, "Benefits title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "Benefits subtitle is required")
    .max(200, "Subtitle must be less than 200 characters"),
  showCompanyCulture: z.boolean(),
  styling: sectionStylingSchema,
});

const jobsCallToActionSectionSchema = z.object({
  title: z
    .string()
    .min(1, "CTA title is required")
    .max(100, "Title must be less than 100 characters"),
  subtitle: z
    .string()
    .min(1, "CTA subtitle is required")
    .max(200, "Subtitle must be less than 200 characters"),
  ctaText: z
    .string()
    .min(1, "CTA text is required")
    .max(50, "CTA text must be less than 50 characters"),
  ctaLink: z.string().min(1, "CTA link is required"),
  secondaryCtaText: z
    .string()
    .min(1, "Secondary CTA text is required")
    .max(50, "Secondary CTA text must be less than 50 characters"),
  secondaryCtaLink: z.string().min(1, "Secondary CTA link is required"),
  styling: sectionStylingSchema,
});

export const jobsPageContentSchema = basePageContentSchema.extend({
  pageId: z.literal("jobs"),
  hero: jobsHeroSectionSchema,
  jobStats: jobsStatsSectionSchema,
  departmentFilters: jobsDepartmentFiltersSectionSchema,
  jobListings: jobsListingsSectionSchema,
  benefits: jobsBenefitsSectionSchema,
  callToAction: jobsCallToActionSectionSchema,
});

const contentDataServiceSchema = z.object({
  id: z.string().min(1, "Service ID is required"),
  type: z.literal("service"),
  slug: z
    .string()
    .min(1, "Service slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  title: z
    .string()
    .min(1, "Service title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Service description is required")
    .max(500, "Description must be less than 500 characters"),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(150, "Short description must be less than 150 characters"),
  features: z.array(z.string().min(1, "Feature cannot be empty")),
  image: imageDataSchema,
  ctaText: z
    .string()
    .min(1, "CTA text is required")
    .max(50, "CTA text must be less than 50 characters"),
  ctaLink: z.string().min(1, "CTA link is required"),
  styling: z.object({
    cardStyle: cardStylingSchema,
    buttonStyle: buttonStylingSchema,
  }),
  published: z.boolean(),
  lastModified: z.string().datetime("Must be a valid ISO datetime"),
});

const contentDataPageSectionSchema = z.object({
  id: z.string().min(1, "Section ID is required"),
  type: z.string().min(1, "Section type is required"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  image: imageDataSchema.optional(),
  styling: sectionStylingSchema.optional(),
});

const contentDataPageSchema = z.object({
  id: z.string().min(1, "Page ID is required"),
  type: z.literal("page"),
  pageId: z.string().min(1, "Page ID is required"),
  sections: z.array(contentDataPageSectionSchema),
  published: z.boolean(),
  lastModified: z.string().datetime("Must be a valid ISO datetime"),
});

const contentDataDepartmentSchema = z.object({
  key: z.string().min(1, "Department key is required"),
  label: z
    .string()
    .min(1, "Department label is required")
    .max(100, "Label must be less than 100 characters"),
});

const contentDataJobTypeSchema = z.object({
  key: z.string().min(1, "Job type key is required"),
  label: z
    .string()
    .min(1, "Job type label is required")
    .max(100, "Label must be less than 100 characters"),
});

const contentDataLocationSchema = z.object({
  key: z.string().min(1, "Location key is required"),
  label: z
    .string()
    .min(1, "Location label is required")
    .max(100, "Label must be less than 100 characters"),
});

const contentDataExperienceLevelSchema = z.object({
  key: z.string().min(1, "Experience level key is required"),
  label: z
    .string()
    .min(1, "Experience level label is required")
    .max(100, "Label must be less than 100 characters"),
});

const contentDataBenefitSchema = z.object({
  id: z.string().min(1, "Benefit ID is required"),
  title: z
    .string()
    .min(1, "Benefit title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Benefit description is required")
    .max(300, "Description must be less than 300 characters"),
  icon: z.string().min(1, "Benefit icon is required"),
  category: z
    .string()
    .min(1, "Benefit category is required")
    .max(50, "Category must be less than 50 characters"),
  color: z.string().min(1, "Benefit color is required"),
});

const contentDataCompanyCultureSchema = z.object({
  id: z.string().min(1, "Company culture ID is required"),
  title: z
    .string()
    .min(1, "Company culture title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Company culture description is required")
    .max(300, "Description must be less than 300 characters"),
  icon: z.string().min(1, "Company culture icon is required"),
  color: z.string().min(1, "Company culture color is required"),
});

export const contentDataSchema = z.object({
  services: z.array(contentDataServiceSchema),
  pages: z.array(contentDataPageSchema),
  departments: z.array(contentDataDepartmentSchema),
  jobTypes: z.array(contentDataJobTypeSchema),
  locations: z.array(contentDataLocationSchema),
  experienceLevels: z.array(contentDataExperienceLevelSchema),
  benefits: z.array(contentDataBenefitSchema),
  companyCulture: z.array(contentDataCompanyCultureSchema),
});

export const teamImageFormDataSchema = z.object({
  id: z.string().min(1, "Team image ID is required"),
  imageUrl: z.string().url("Must be a valid URL"),
  imageHint: z
    .string()
    .min(1, "Image hint is required")
    .max(100, "Image hint must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be less than 200 characters"),
});

export const serviceFormDataSchema = z.object({
  title: z
    .string()
    .min(1, "Service title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(150, "Short description must be less than 150 characters"),
  features: z.array(z.string().min(1, "Feature cannot be empty")),
  imageUrl: z.string().url("Must be a valid URL"),
  imageDescription: z
    .string()
    .min(1, "Image description is required")
    .max(200, "Image description must be less than 200 characters"),
  imageHint: z
    .string()
    .min(1, "Image hint is required")
    .max(100, "Image hint must be less than 100 characters"),
  ctaText: z
    .string()
    .min(1, "CTA text is required")
    .max(50, "CTA text must be less than 50 characters"),
  ctaLink: z.string().min(1, "CTA link is required"),
  published: z.boolean(),
});

export const departmentFormDataSchema = z.object({
  key: z
    .string()
    .min(1, "Department key is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Key must contain only lowercase letters, numbers, and hyphens"
    ),
  label: z
    .string()
    .min(1, "Department label is required")
    .max(100, "Label must be less than 100 characters"),
});

export const benefitFormDataSchema = z.object({
  title: z
    .string()
    .min(1, "Benefit title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be less than 300 characters"),
  icon: z.string().min(1, "Icon is required"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(50, "Category must be less than 50 characters"),
  color: z.string().min(1, "Color is required"),
});

export const companyCultureFormDataSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(300, "Description must be less than 300 characters"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
});

export const pageContentSchema = z.union([
  homePageContentSchema,
  aboutPageContentSchema,
  servicesPageContentSchema,
  contactPageContentSchema,
  jobsPageContentSchema,
]);

export {
  imageDataSchema,
  statisticItemSchema,
  businessHourSchema,
  buttonStylingSchema,
  cardStylingSchema,
  sectionStylingSchema,
  industryItemSchema,
  testimonialItemSchema,
  valueItemSchema,
  serviceHighlightItemSchema,
  serviceDetailSchema,
  contentDataServiceSchema,
  contentDataDepartmentSchema,
  contentDataBenefitSchema,
  contentDataCompanyCultureSchema,
};

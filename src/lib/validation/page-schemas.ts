import { z } from "zod";

const hexColorSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #ff0000)");

const flexibleColorSchema = z.union([
  hexColorSchema,
  z
    .string()
    .regex(/^(bg-|text-|hover:|shadow-)/, "Must be a valid color class or hex color"),
]);

const colorValueSchema = z.union([
  flexibleColorSchema,
  z.array(flexibleColorSchema).length(2),
]);

const imageDataSchema = z.object({
  id: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),
  imageHint: z.string(),
});

const buttonStylingSchema = z.object({
  backgroundColor: colorValueSchema.optional(),
  textColor: flexibleColorSchema.optional(),
  hoverBackgroundColor: colorValueSchema.optional(),
  hoverTextColor: flexibleColorSchema.optional(),
  activeBackgroundColor: colorValueSchema.optional(),
  activeTextColor: flexibleColorSchema.optional(),
  size: z.string().optional(),
  variant: z.string().optional(),
});

const shadowClassSchema = z.union([
  hexColorSchema,
  z.string().regex(/^shadow-(none|sm|md|lg|xl|2xl|inner)$/, "Must be a valid shadow class"),
]);

const cardStylingSchema = z.object({
  backgroundColor: colorValueSchema.optional(),
  hoverBackgroundColor: colorValueSchema.optional(),
  borderColor: flexibleColorSchema.optional(),
  hoverBorderColor: flexibleColorSchema.optional(),
  shadowColor: shadowClassSchema.optional(),
  hoverShadowColor: shadowClassSchema.optional(),
  borderRadius: z.string().optional(),
  padding: z.string().optional(),
});

const sectionStylingSchema = z.object({
  backgroundColor: colorValueSchema.optional(),
  textColor: flexibleColorSchema.optional(),
  padding: z.string().optional(),
  gradientDirection: z.enum(["to-r", "to-b", "to-br", "to-bl"]).optional(),
  buttonStyle: buttonStylingSchema.optional(),
  cardStyle: cardStylingSchema.optional(),
});

const statisticItemSchema = z.object({
  number: z.string(),
  label: z.string(),
});

const industryItemSchema = z.object({
  title: z.string(),
  description: z.string(),
  icon: z.string(),
});

const testimonialItemSchema = z.object({
  name: z.string(),
  company: z.string(),
  content: z.string(),
  rating: z.number().min(1).max(5),
});

const valueItemSchema = z.object({
  number: z.number(),
  title: z.string(),
  description: z.string(),
});

const serviceHighlightItemSchema = z.object({
  icon: z.string(),
  title: z.string(),
  description: z.string(),
});

const serviceItemSchema = z.object({
  title: z.string(),
  href: z.string(),
  image: imageDataSchema.optional(),
});

const customerLogoSchema = z.object({
  name: z.string(),
  image: imageDataSchema.optional(),
});

const businessHourSchema = z.object({
  days: z.string(),
  hours: z.string(),
});

const heroSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  backgroundImage: imageDataSchema.optional(),
  image: imageDataSchema.optional(),
  statistics: z.array(statisticItemSchema).optional(),
  styling: sectionStylingSchema,
});

const aboutServicesSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  services: z.array(serviceItemSchema).optional(),
  styling: sectionStylingSchema,
});

const industriesSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  image: imageDataSchema.optional(),
  items: z.array(industryItemSchema),
  styling: sectionStylingSchema,
});

const trustSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  image: imageDataSchema.optional(),
  features: z.array(z.string()).optional(),
  statistics: z.array(statisticItemSchema).optional(),
  styling: sectionStylingSchema,
});

const customersSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  customerLogos: z.array(customerLogoSchema).optional(),
  testimonials: z.array(testimonialItemSchema).optional(),
  styling: sectionStylingSchema,
});

const callToActionSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  styling: sectionStylingSchema,
});

const jobsCallToActionSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaLink: z.string().optional(),
  styling: sectionStylingSchema,
});

const pageContentSchema = z
  .object({
    pageId: z.string(),
    title: z.string(),
    description: z.string(),
    lastModified: z.string(),
    published: z.boolean(),

    hero: heroSectionSchema.optional(),
    aboutServices: aboutServicesSectionSchema.optional(),
    industries: industriesSectionSchema.optional(),
    trust: trustSectionSchema.optional(),
    customers: customersSectionSchema.optional(),
    callToAction: callToActionSectionSchema.optional(),

    introduction: z
      .object({
        title: z.string(),
        description: z.string(),
        styling: sectionStylingSchema,
      })
      .optional(),

    chooseUs: z
      .object({
        title: z.string(),
        description: z.string(),
        ctaText: z.string().optional(),
        ctaLink: z.string().optional(),
        image: imageDataSchema.optional(),
        statistics: z.array(statisticItemSchema).optional(),
        styling: sectionStylingSchema,
      })
      .optional(),

    values: z
      .object({
        title: z.string(),
        subtitle: z.string().optional(),
        items: z.array(valueItemSchema),
        styling: sectionStylingSchema,
      })
      .optional(),

    team: z
      .object({
        title: z.string(),
        subtitle: z.string().optional(),
        ctaText: z.string().optional(),
        ctaLink: z.string().optional(),
        teamImages: z.array(imageDataSchema),
        styling: sectionStylingSchema,
      })
      .optional(),

    contact: z
      .object({
        title: z.string(),
        subtitle: z.string().optional(),
        styling: sectionStylingSchema,
      })
      .optional(),

    serviceHighlights: z
      .object({
        items: z.array(serviceHighlightItemSchema),
        styling: sectionStylingSchema,
      })
      .optional(),

    contactInfo: z
      .object({
        phone: z.string(),
        email: z.string().email(),
        address: z.string(),
        businessHours: z.array(businessHourSchema),
      })
      .optional(),

    form: z
      .object({
        title: z.string(),
        styling: sectionStylingSchema,
      })
      .optional(),

    testimonial: z
      .object({
        enabled: z.boolean(),
        styling: sectionStylingSchema,
      })
      .optional(),

    jobStats: z
      .object({
        enabled: z.boolean(),
        showOpenPositions: z.boolean(),
        showRemoteOptions: z.boolean(),
        styling: sectionStylingSchema,
      })
      .optional(),

    departmentFilters: z
      .object({
        enabled: z.boolean(),
        title: z.string(),
        showJobCounts: z.boolean(),
        styling: sectionStylingSchema,
      })
      .optional(),

    jobListings: z
      .object({
        title: z.string(),
        subtitle: z.string().optional(),
        showDepartmentBadges: z.boolean(),
        showLocationInfo: z.boolean(),
        showSalaryRange: z.boolean(),
        styling: sectionStylingSchema,
      })
      .optional(),

    benefits: z
      .object({
        enabled: z.boolean(),
        title: z.string(),
        subtitle: z.string().optional(),
        showCompanyCulture: z.boolean(),
        styling: sectionStylingSchema,
      })
      .optional(),

    serviceDetails: z
      .object({
        services: z.array(
          z.object({
            id: z.string(),
            category: z.string(),
            title: z.string(),
            description: z.string(),
            features: z.array(z.string()),
            image: imageDataSchema,
            layout: z.string(),
            showStats: z.boolean().optional(),
            showCta: z.boolean().optional(),
            ctaText: z.string().optional(),
            ctaLink: z.string().optional(),
          })
        ),
        styling: sectionStylingSchema,
      })
      .optional(),

    serviceStats: z
      .object({
        enabled: z.boolean(),
        statistics: z.array(statisticItemSchema),
        styling: sectionStylingSchema,
      })
      .optional(),

    additionalServiceHighlights: z
      .object({
        enabled: z.boolean(),
        title: z.string().optional(),
        items: z.array(serviceHighlightItemSchema),
        styling: sectionStylingSchema,
      })
      .optional(),
  })
  .passthrough();

const contactPageSchema = z.object({
  pageId: z.literal("contact"),
  title: z.string(),
  description: z.string(),
  lastModified: z.string(),
  published: z.boolean(),
  hero: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    styling: sectionStylingSchema,
  }),
  contactInfo: z.object({
    phone: z.string(),
    email: z.string().email(),
    address: z.string(),
    businessHours: z.array(businessHourSchema),
  }),
  form: z.object({
    title: z.string(),
    styling: sectionStylingSchema,
  }),
  testimonial: z.object({
    enabled: z.boolean(),
    styling: sectionStylingSchema,
  }),
});

const jobsPageSchema = z.object({
  pageId: z.string(),
  title: z.string(),
  description: z.string(),
  lastModified: z.string(),
  published: z.boolean(),
  hero: heroSectionSchema,
  jobStats: z.object({
    enabled: z.boolean(),
    showOpenPositions: z.boolean(),
    showRemoteOptions: z.boolean(),
    styling: sectionStylingSchema,
  }),
  departmentFilters: z.object({
    enabled: z.boolean(),
    title: z.string(),
    showJobCounts: z.boolean(),
    styling: sectionStylingSchema,
  }),
  jobListings: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    showDepartmentBadges: z.boolean(),
    showLocationInfo: z.boolean(),
    showSalaryRange: z.boolean(),
    styling: sectionStylingSchema,
  }),
  benefits: z.object({
    enabled: z.boolean(),
    title: z.string(),
    subtitle: z.string().optional(),
    showCompanyCulture: z.boolean(),
    styling: sectionStylingSchema,
  }),
  departments: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
      })
    )
    .optional(),
  jobTypes: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
      })
    )
    .optional(),
  locations: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
      })
    )
    .optional(),
  experienceLevels: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
      })
    )
    .optional(),
  benefitsList: z
    .array(
      z.object({
        id: z.string(),
        icon: z.string(),
        color: z.string(),
        title: z.string(),
        category: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  companyCultureList: z
    .array(
      z.object({
        id: z.string(),
        icon: z.string(),
        color: z.string(),
        title: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  callToAction: jobsCallToActionSectionSchema,
});

export const createPageSchema = z.object({
  pageId: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  content: pageContentSchema,
  isPublished: z.boolean().optional().default(false),
});

export const updatePageSchema = z.object({
  pageId: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(500).optional(),
  content: pageContentSchema.partial().optional(),
  isPublished: z.boolean().optional(),
});

export {
  pageContentSchema,
  heroSectionSchema,
  aboutServicesSectionSchema,
  industriesSectionSchema,
  trustSectionSchema,
  customersSectionSchema,
  callToActionSectionSchema,
  jobsCallToActionSectionSchema,
  jobsPageSchema,
  contactPageSchema,
  imageDataSchema,
  sectionStylingSchema,
  buttonStylingSchema,
  cardStylingSchema,
  statisticItemSchema,
  industryItemSchema,
  testimonialItemSchema,
  valueItemSchema,
  serviceHighlightItemSchema,
  serviceItemSchema,
  customerLogoSchema,
  businessHourSchema,
  hexColorSchema,
  colorValueSchema,
  flexibleColorSchema,
};

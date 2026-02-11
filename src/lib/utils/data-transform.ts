import type { PageContent } from "@/lib/types/page";

type JsonObject = Record<string, unknown>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Transform existing JSON files to database format
 */
export function transformJsonToPageContent(jsonData: JsonObject): PageContent {
  return {
    pageId: typeof jsonData.pageId === "string" ? jsonData.pageId : "home",
    title: typeof jsonData.title === "string" ? jsonData.title : "",
    description:
      typeof jsonData.description === "string" ? jsonData.description : "",
    lastModified:
      typeof jsonData.lastModified === "string"
        ? jsonData.lastModified
        : new Date().toISOString(),
    published: typeof jsonData.published === "boolean" ? jsonData.published : false,
    ...jsonData,
  };
}

/**
 * Transform database content back to JSON format
 */
export function transformPageContentToJson(content: PageContent): JsonObject {
  return {
    ...content,
  };
}

/**
 * Validate section structure
 */
export function validateSectionStructure(
  sectionName: string,
  sectionData: unknown
): boolean {
  if (!isJsonObject(sectionData)) {
    return false;
  }

  const commonFields = ["styling"];
  const hasCommonFields = commonFields.some((field) => field in sectionData);

  switch (sectionName) {
    case "hero":
      return "title" in sectionData && hasCommonFields;
    case "aboutServices":
      return "title" in sectionData && hasCommonFields;
    case "industries":
      return (
        "title" in sectionData &&
        "items" in sectionData &&
        Array.isArray(sectionData.items)
      );
    case "trust":
      return (
        "title" in sectionData &&
        "statistics" in sectionData &&
        Array.isArray(sectionData.statistics)
      );
    case "customers":
      return (
        "title" in sectionData &&
        "testimonials" in sectionData &&
        Array.isArray(sectionData.testimonials)
      );
    case "callToAction":
      return "title" in sectionData && hasCommonFields;
    default:
      return hasCommonFields;
  }
}

/**
 * Get section display name
 */
export function getSectionDisplayName(sectionKey: string): string {
  const displayNames: Record<string, string> = {
    hero: "Hero Section",
    aboutServices: "About Services",
    industries: "Industries",
    trust: "Trust & Statistics",
    customers: "Customer Testimonials",
    callToAction: "Call to Action",
    introduction: "Introduction",
    chooseUs: "Choose Us",
    values: "Values",
    team: "Team",
    contact: "Contact",
    serviceHighlights: "Service Highlights",
    contactInfo: "Contact Information",
    form: "Form",
    testimonial: "Testimonial",
    departments: "Departments",
    jobTypes: "Job Types",
    locations: "Locations",
    experienceLevels: "Experience Levels",
    benefitsList: "Benefits List",
    companyCultureList: "Company Culture List",
  };

  return (
    displayNames[sectionKey] ||
    sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)
  );
}

/**
 * Get available section types
 */
export function getAvailableSectionTypes(): Array<{
  key: string;
  name: string;
  description: string;
}> {
  return [
    {
      key: "hero",
      name: "Hero Section",
      description: "Main banner with title, subtitle, and call-to-action",
    },
    {
      key: "aboutServices",
      name: "About Services",
      description: "Service overview section",
    },
    {
      key: "industries",
      name: "Industries",
      description: "Industry expertise showcase with icons",
    },
    {
      key: "trust",
      name: "Trust & Statistics",
      description: "Statistics and trust-building content",
    },
    {
      key: "customers",
      name: "Customer Testimonials",
      description: "Client testimonials and reviews",
    },
    {
      key: "callToAction",
      name: "Call to Action",
      description: "Final conversion section",
    },
    {
      key: "introduction",
      name: "Introduction",
      description: "Basic introduction section",
    },
    {
      key: "chooseUs",
      name: "Choose Us",
      description: "Why choose us section with image and stats",
    },
    {
      key: "values",
      name: "Values",
      description: "Company values with numbered items",
    },
    { key: "team", name: "Team", description: "Team showcase with images" },
    { key: "contact", name: "Contact", description: "Contact section" },
    {
      key: "serviceHighlights",
      name: "Service Highlights",
      description: "Highlighted services with icons",
    },
    {
      key: "contactInfo",
      name: "Contact Information",
      description: "Contact details and business hours",
    },
    { key: "form", name: "Form", description: "Form section" },
    {
      key: "testimonial",
      name: "Testimonial",
      description: "Single testimonial section",
    },
  ];
}

/**
 * Create default section data
 */
export function createDefaultSectionData(sectionType: string): JsonObject {
  const defaultStyling = {
    backgroundColor: "bg-background",
    textColor: "text-foreground",
    padding: "py-12 px-4",
  };

  switch (sectionType) {
    case "hero":
      return {
        title: "New Hero Title",
        subtitle: "Hero Subtitle",
        description: "Hero description text",
        ctaText: "Get Started",
        ctaLink: "#",
        styling: {
          ...defaultStyling,
          backgroundColor: "bg-gradient-to-r",
          gradientFrom: "blue-600",
          gradientTo: "purple-600",
          textColor: "text-white",
          buttonStyle: {
            backgroundColor: "bg-white",
            textColor: "text-blue-600",
            hoverBackgroundColor: "hover:bg-blue-50",
            size: "lg",
            variant: "primary",
          },
        },
      };
    case "aboutServices":
      return {
        title: "About Our Services",
        subtitle: "Service subtitle",
        description: "Service description",
        ctaText: "Learn More",
        ctaLink: "#",
        styling: defaultStyling,
      };
    case "industries":
      return {
        title: "Industries We Serve",
        subtitle: "Our expertise spans multiple industries",
        items: [
          {
            title: "Industry 1",
            description: "Industry description",
            icon: "Building",
          },
        ],
        styling: defaultStyling,
      };
    case "trust":
      return {
        title: "Trust & Statistics",
        subtitle: "Numbers that speak for themselves",
        statistics: [
          {
            number: "100+",
            label: "Happy Clients",
          },
        ],
        styling: defaultStyling,
      };
    case "customers":
      return {
        title: "What Our Customers Say",
        subtitle: "Testimonials from satisfied clients",
        testimonials: [
          {
            name: "John Doe",
            company: "Example Company",
            content: "Great service and professional team.",
            rating: 5,
          },
        ],
        styling: defaultStyling,
      };
    case "callToAction":
      return {
        title: "Ready to Get Started?",
        subtitle: "Contact us today",
        ctaText: "Contact Us",
        ctaLink: "/contact",
        styling: {
          ...defaultStyling,
          backgroundColor: "bg-primary",
          textColor: "text-primary-foreground",
        },
      };
    default:
      return {
        title: "New Section",
        styling: defaultStyling,
      };
  }
}

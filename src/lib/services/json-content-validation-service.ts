import { join } from "path";
import { contactPageSchema } from "@/lib/validation/page-schemas";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SectionValidation {
  id: string;
  name: string;
  description: string;
  status: "complete" | "incomplete" | "error";
  validationErrors?: string[];
  validationWarnings?: string[];
}

export interface PageValidation {
  filename: string;
  title: string;
  description: string;
  status: "complete" | "incomplete" | "error";
  sections: SectionValidation[];
  lastModified: string;
  published: boolean;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export class JsonContentValidationService {
  private static pagesDir = join(process.cwd(), "src/lib/pages");

  /**
   * Validate contact page content
   */
  static validateContactPage(content: unknown): PageValidation {
    const data = asRecord(content);
    const sections: SectionValidation[] = [];
    let overallStatus: "complete" | "incomplete" | "error" = "complete";

    try {
      contactPageSchema.safeParse(data);

      const contactInfoSection: SectionValidation = {
        id: "contact-info",
        name: "Contact Information",
        description: "Address, phone, email details",
        status: "complete",
      };

      const hasContactInfo = data.contactInfo !== undefined;
      const contactInfo = asRecord(data.contactInfo);

      if (!hasContactInfo) {
        contactInfoSection.status = "error";
        contactInfoSection.validationErrors = [
          "Contact information is missing",
        ];
        overallStatus = "error";
      } else {
        const errors: string[] = [];
        const warnings: string[] = [];

        const contactEmail = contactInfo.email;
        if (
          typeof contactEmail !== "string" ||
          !contactEmail.includes("@")
        ) {
          errors.push("Valid email address is required");
        }
        if (typeof contactInfo.phone !== "string" || !contactInfo.phone) {
          warnings.push("Phone number is recommended");
        }
        if (typeof contactInfo.address !== "string" || !contactInfo.address) {
          warnings.push("Physical address is recommended");
        }

        const businessHours = Array.isArray(contactInfo.businessHours)
          ? contactInfo.businessHours
          : [];
        if (businessHours.length === 0) {
          warnings.push("Business hours are recommended");
        }

        if (errors.length > 0) {
          contactInfoSection.status = "error";
          contactInfoSection.validationErrors = errors;
          overallStatus = "error";
        } else if (warnings.length > 0) {
          contactInfoSection.validationWarnings = warnings;
        }
      }

      sections.push(contactInfoSection);

      const contactFormSection: SectionValidation = {
        id: "contact-form",
        name: "Contact Form",
        description: "Customer inquiry form",
        status: "complete",
      };

      const hasForm = data.form !== undefined;
      const form = asRecord(data.form);
      const formFields = asRecord(form.fields);

      if (!hasForm) {
        contactFormSection.status = "error";
        contactFormSection.validationErrors = [
          "Contact form configuration is missing",
        ];
        overallStatus = "error";
      } else {
        const errors: string[] = [];
        const warnings: string[] = [];

        if (typeof form.title !== "string" || !form.title) {
          errors.push("Form title is required");
        }

        if (Object.keys(formFields).length === 0) {
          warnings.push(
            "Form field configuration is recommended for better validation"
          );
        } else {
          const requiredFields = ["name", "email", "message"];
          for (const field of requiredFields) {
            const fieldConfig = asRecord(formFields[field]);
            if (
              Object.keys(fieldConfig).length === 0 ||
              fieldConfig.enabled !== true
            ) {
              warnings.push(`${field} field should be enabled`);
            }
          }

          if (!("validation" in asRecord(formFields.name))) {
            warnings.push("Name field validation rules are recommended");
          }
          if (!("validation" in asRecord(formFields.email))) {
            warnings.push("Email field validation rules are recommended");
          }
          if (!("validation" in asRecord(formFields.message))) {
            warnings.push("Message field validation rules are recommended");
          }
        }

        if (!("styling" in form)) {
          warnings.push("Form styling configuration is recommended");
        }

        if (!("submitButton" in form)) {
          warnings.push("Submit button configuration is recommended");
        }

        if (!("notifications" in form)) {
          warnings.push("Form notification configuration is recommended");
        }

        if (errors.length > 0) {
          contactFormSection.status = "error";
          contactFormSection.validationErrors = errors;
          overallStatus = "error";
        } else if (warnings.length > 0) {
          contactFormSection.status = "incomplete";
          contactFormSection.validationWarnings = warnings;
          if (overallStatus === "complete") {
            overallStatus = "incomplete";
          }
        }
      }

      sections.push(contactFormSection);

      const heroSection: SectionValidation = {
        id: "hero",
        name: "Hero Section",
        description: "Page header and introduction",
        status: "complete",
      };

      const hasHero = data.hero !== undefined;
      const hero = asRecord(data.hero);

      if (!hasHero) {
        heroSection.status = "error";
        heroSection.validationErrors = ["Hero section is missing"];
        overallStatus = "error";
      } else {
        const warnings: string[] = [];

        if (typeof hero.title !== "string" || !hero.title) {
          warnings.push("Hero title is recommended");
        }
        if (typeof hero.subtitle !== "string" || !hero.subtitle) {
          warnings.push("Hero subtitle is recommended");
        }

        if (warnings.length > 0) {
          heroSection.validationWarnings = warnings;
        }
      }

      sections.push(heroSection);

      return {
        filename: "contact.json",
        title: typeof data.title === "string" ? data.title : "Contact Page",
        description:
          typeof data.description === "string"
            ? data.description
            : "Contact information and forms",
        status: overallStatus,
        sections,
        lastModified:
          typeof data.lastModified === "string"
            ? data.lastModified
            : new Date().toISOString(),
        published: typeof data.published === "boolean" ? data.published : false,
      };
    } catch (error) {
      return {
        filename: "contact.json",
        title: "Contact Page",
        description: "Contact information and forms",
        status: "error",
        sections: [
          {
            id: "validation",
            name: "Validation Error",
            description: "Failed to validate page content",
            status: "error",
            validationErrors: [
              `Validation failed: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
            ],
          },
        ],
        lastModified: new Date().toISOString(),
        published: false,
      };
    }
  }

  /**
   * Validate a generic page (basic validation)
   */
  static validateGenericPage(content: unknown, filename: string): PageValidation {
    const data = asRecord(content);
    const sections: SectionValidation[] = [];
    let overallStatus: "complete" | "incomplete" | "error" = "complete";

    const basicSection: SectionValidation = {
      id: "basic",
      name: "Basic Information",
      description: "Page title, description, and metadata",
      status: "complete",
    };

    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof data.title !== "string" || !data.title) {
      errors.push("Page title is required");
    }
    if (typeof data.description !== "string" || !data.description) {
      warnings.push("Page description is recommended");
    }
    if (typeof data.pageId !== "string" || !data.pageId) {
      warnings.push("Page ID is recommended");
    }

    if (errors.length > 0) {
      basicSection.status = "error";
      basicSection.validationErrors = errors;
      overallStatus = "error";
    } else if (warnings.length > 0) {
      basicSection.validationWarnings = warnings;
      if (overallStatus === "complete") {
        overallStatus = "incomplete";
      }
    }

    sections.push(basicSection);

    return {
      filename,
      title: typeof data.title === "string" ? data.title : "Untitled Page",
      description:
        typeof data.description === "string"
          ? data.description
          : "No description available",
      status: overallStatus,
      sections,
      lastModified:
        typeof data.lastModified === "string"
          ? data.lastModified
          : new Date().toISOString(),
      published: typeof data.published === "boolean" ? data.published : false,
    };
  }

  /**
   * Get validation for all pages
   */
  static async getAllPageValidations(): Promise<PageValidation[]> {
    try {
      const fs = await import("fs");
      const files = fs
        .readdirSync(this.pagesDir)
        .filter((file) => file.endsWith(".json"));
      const validations: PageValidation[] = [];

      for (const file of files) {
        try {
          const filePath = join(this.pagesDir, file);
          const content = fs.readFileSync(filePath, "utf-8");
          const data = JSON.parse(content);

          let validation: PageValidation;

          if (file === "contact.json") {
            validation = this.validateContactPage(data);
          } else {
            validation = this.validateGenericPage(data, file);
          }

          validations.push(validation);
        } catch (error) {
          console.error(`Error validating ${file}:`, error);
          validations.push({
            filename: file,
            title: "Error Loading Page",
            description: "Failed to load page content",
            status: "error",
            sections: [
              {
                id: "load-error",
                name: "Load Error",
                description: "Failed to load page content",
                status: "error",
                validationErrors: [
                  `Failed to load: ${
                    error instanceof Error ? error.message : "Unknown error"
                  }`,
                ],
              },
            ],
            lastModified: new Date().toISOString(),
            published: false,
          });
        }
      }

      return validations.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
      console.error("Error reading pages directory:", error);
      return [];
    }
  }
}

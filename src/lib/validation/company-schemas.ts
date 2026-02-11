import { z } from "zod";

const optionalUrl = z
  .union([
    z.string().url("Please enter a valid URL"),
    z.literal(""),
    z.null(),
    z.undefined(),
  ])
  .transform((val) => (val === "" || val === undefined ? null : val));

const optionalString = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((val) => (val === undefined ? null : val));

export const companyFormSchema = z.object({
  name: z
    .string()
    .min(1, "Company name is required")
    .max(200, "Company name must be less than 200 characters")
    .trim(),

  description: optionalString.refine(
    (val) => !val || val.length <= 2000,
    "Description must be less than 2000 characters"
  ),

  website: optionalUrl,

  email: z
    .union([
      z.string().email("Please enter a valid email address"),
      z.literal(""),
      z.null(),
      z.undefined(),
    ])
    .transform((val) => (val === "" || val === undefined ? null : val)),

  phone: optionalString.refine(
    (val) => !val || val.length <= 20,
    "Phone number must be less than 20 characters"
  ),

  address: optionalString.refine(
    (val) => !val || val.length <= 500,
    "Address must be less than 500 characters"
  ),

  logo: optionalUrl,

  industry: optionalString.refine(
    (val) => !val || val.length <= 100,
    "Industry must be less than 100 characters"
  ),

  foundedYear: z.preprocess((val) => {
    if (val === "" || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  }, z.number().int("Founded year must be a whole number").min(1800, "Founded year must be after 1800").max(new Date().getFullYear(), "Founded year cannot be in the future").nullable().optional()),

  employeeCount: optionalString.refine(
    (val) => !val || val.length <= 50,
    "Employee count must be less than 50 characters"
  ),

  headquarters: optionalString.refine(
    (val) => !val || val.length <= 200,
    "Headquarters must be less than 200 characters"
  ),

  socialLinks: z
    .record(z.string().url("Please enter valid URLs for social links"))
    .nullable()
    .optional()
    .default(null),

  showName: z.boolean().default(true),
  showDescription: z.boolean().default(true),
  showWebsite: z.boolean().default(true),
  showEmail: z.boolean().default(true),
  showPhone: z.boolean().default(true),
  showAddress: z.boolean().default(true),
  showLogo: z.boolean().default(true),
  showIndustry: z.boolean().default(true),
  showFoundedYear: z.boolean().default(true),
  showEmployeeCount: z.boolean().default(true),
  showHeadquarters: z.boolean().default(true),
  showSocialLinks: z.boolean().default(true),

  isActive: z.boolean().default(true),
});

export const companyUpdateSchema = companyFormSchema.partial();

export const socialLinksSchema = z
  .object({
    facebook: z.string().url().optional().or(z.literal("")),
    twitter: z.string().url().optional().or(z.literal("")),
    linkedin: z.string().url().optional().or(z.literal("")),
    instagram: z.string().url().optional().or(z.literal("")),
    youtube: z.string().url().optional().or(z.literal("")),
  })
  .transform((obj) => {
    const cleaned: Record<string, string> = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value && value !== "") {
        cleaned[key] = value;
      }
    });
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  });

export type CompanyFormData = z.infer<typeof companyFormSchema>;
export type CompanyUpdateData = z.infer<typeof companyUpdateSchema>;

export interface CompanyData {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logo?: string | null;
  industry?: string | null;
  foundedYear?: number | null;
  employeeCount?: string | null;
  headquarters?: string | null;
  socialLinks?: Record<string, string> | null;
  showName: boolean;
  showDescription: boolean;
  showWebsite: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showLogo: boolean;
  showIndustry: boolean;
  showFoundedYear: boolean;
  showEmployeeCount: boolean;
  showHeadquarters: boolean;
  showSocialLinks: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  jobOpenings?: Array<{
    id: string;
    title: string;
    isActive: boolean;
  }>;
}

export interface CompanyStats {
  totalJobOpenings: number;
  activeJobOpenings: number;
  totalApplications: number;
  recentApplications: number;
}

export function validateCompanyForm(data: unknown): CompanyFormData {
  try {
    return companyFormSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      }));
      throw new Error(
        `Validation failed: ${fieldErrors
          .map((e) => `${e.field}: ${e.message}`)
          .join(", ")}`
      );
    }
    throw error;
  }
}

export function validateCompanyUpdate(data: unknown): CompanyUpdateData {
  try {
    return companyUpdateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      }));
      throw new Error(
        `Validation failed: ${fieldErrors
          .map((e) => `${e.field}: ${e.message}`)
          .join(", ")}`
      );
    }
    throw error;
  }
}

export function validateSocialLinks(data: unknown) {
  try {
    return socialLinksSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      }));
      throw new Error(
        `Validation failed: ${fieldErrors
          .map((e) => `${e.field}: ${e.message}`)
          .join(", ")}`
      );
    }
    throw error;
  }
}

export const defaultCompanyData: Partial<CompanyFormData> = {
  name: "",
  description: null,
  website: null,
  email: null,
  phone: null,
  address: null,
  logo: null,
  industry: null,
  foundedYear: null,
  employeeCount: null,
  headquarters: null,
  socialLinks: null,
  showName: true,
  showDescription: true,
  showWebsite: true,
  showEmail: true,
  showPhone: true,
  showAddress: true,
  showLogo: true,
  showIndustry: true,
  showFoundedYear: true,
  showEmployeeCount: true,
  showHeadquarters: true,
  showSocialLinks: true,
  isActive: true,
};

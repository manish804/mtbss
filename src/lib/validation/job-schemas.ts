import { z } from "zod";

export const JobTypeEnum = z.enum([
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Remote",
  "Hybrid",
]);

export const ExperienceLevelEnum = z.enum([
  "Entry Level",
  "1-2 years",
  "3-5 years",
  "5-10 years",
  "10+ years",
  "Senior Level",
  "Executive Level",
]);

export const jobFormSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),

  department: z
    .string()
    .min(1, "Department is required")
    .max(100, "Department must be less than 100 characters"),

  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location must be less than 100 characters"),

  type: JobTypeEnum,

  experience: z.string().min(1, "Experience level is required"),

  salary: z.string().optional().nullable(),

  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(5000, "Description must be less than 5000 characters"),

  requirements: z
    .array(z.string().min(1, "Requirement cannot be empty"))
    .min(1, "At least one requirement is needed")
    .max(20, "Maximum 20 requirements allowed"),

  responsibilities: z
    .array(z.string().min(1, "Responsibility cannot be empty"))
    .min(1, "At least one responsibility is needed")
    .max(20, "Maximum 20 responsibilities allowed"),

  skills: z
    .array(z.string().min(1, "Skill cannot be empty"))
    .max(30, "Maximum 30 skills allowed")
    .default([]),

  benefits: z
    .array(z.string().min(1, "Benefit cannot be empty"))
    .max(20, "Maximum 20 benefits allowed")
    .default([]),

  applicationDeadline: z.preprocess(
    (val) => (val ? new Date(val as string) : val),
    z
      .date()
      .optional()
      .nullable()
      .refine(
        (date) => !date || date > new Date(),
        "Application deadline must be in the future"
      )
  ),

  isActive: z.boolean().default(true),
});

export const jobUpdateSchema = jobFormSchema.partial().extend({
  id: z.string().cuid(),
});

export const jobFilterSchema = z.object({
  page: z.preprocess(
    (val) => (val === null || val === undefined ? 1 : Number(val)),
    z.number().min(1).default(1)
  ),
  limit: z.preprocess(
    (val) => (val === null || val === undefined ? 10 : Number(val)),
    z.number().min(1).max(100).default(10)
  ),
  department: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  type: JobTypeEnum.nullable().optional(),
  experience: z.string().nullable().optional(),
  search: z.string().nullable().optional(),
  active: z.enum(["true", "false", "all"]).nullable().optional(),
  sortBy: z
    .enum(["title", "department", "location", "postedDate", "updatedAt"])
    .nullable()
    .default("postedDate"),
  sortOrder: z.enum(["asc", "desc"]).nullable().default("desc"),
});

export const jobStatusToggleSchema = z.object({
  isActive: z.boolean(),
});

export type JobFormData = z.infer<typeof jobFormSchema>;
export type JobUpdateData = z.infer<typeof jobUpdateSchema>;
export type JobFilterParams = z.infer<typeof jobFilterSchema>;
export type JobStatusToggle = z.infer<typeof jobStatusToggleSchema>;

export interface JobListItem {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary?: string | null;
  isActive: boolean;
  postedDate: Date;
  updatedAt: Date;
  applicationCount: number;
  company?: {
    name: string;
    logo?: string | null;
  } | null;
}

export interface JobStats {
  overview: {
    total: number;
    active: number;
    inactive: number;
    totalApplications: number;
    recentJobs: number;
  };
  departments: Array<{
    department: string;
    count: number;
  }>;
  topJobs: Array<{
    id: string;
    title: string;
    applicationCount: number;
  }>;
}

export function validateJobForm(data: unknown): JobFormData {
  return jobFormSchema.parse(data);
}

export function validateJobUpdate(data: unknown): JobUpdateData {
  return jobUpdateSchema.parse(data);
}

export function validateJobFilters(data: unknown): JobFilterParams {
  return jobFilterSchema.parse(data);
}

export function validateJobStatusToggle(data: unknown): JobStatusToggle {
  return jobStatusToggleSchema.parse(data);
}

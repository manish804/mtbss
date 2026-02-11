import { z } from "zod";
import { JobApplicationStatus } from "@prisma/client";

export const JobApplicationStatusEnum = z.nativeEnum(JobApplicationStatus);

export const applicationFilterSchema = z.object({
  page: z.preprocess(
    (val) => (val === null || val === undefined ? 1 : Number(val)),
    z.number().min(1).default(1)
  ),
  limit: z.preprocess(
    (val) => (val === null || val === undefined ? 10 : Number(val)),
    z.number().min(1).max(100).default(10)
  ),
  jobId: z.string().nullable().optional(),
  status: z
    .union([JobApplicationStatusEnum, z.literal("all")])
    .nullable()
    .optional(),
  search: z.string().nullable().optional(),
  dateFrom: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().optional()
  ),
  dateTo: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().optional()
  ),
  sortBy: z
    .enum(["createdAt", "reviewedAt", "firstName", "lastName", "status"])
    .nullable()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).nullable().default("desc"),
});

export const applicationStatusUpdateSchema = z.object({
  status: JobApplicationStatusEnum.optional(),
  reviewNotes: z
    .string()
    .max(2000, "Review notes must be less than 2000 characters")
    .optional(),
});

export type ApplicationFilterParams = z.infer<typeof applicationFilterSchema>;
export type ApplicationStatusUpdate = z.infer<
  typeof applicationStatusUpdateSchema
>;

export interface ApplicationListItem {
  id: string;
  jobId: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  status: JobApplicationStatus;
  createdAt: Date;
  reviewedAt?: Date | null;
  hasReviewNotes: boolean;
  resumeUrl?: string | null;

  currentCompany?: string | null;
  currentPosition?: string | null;
  experienceYears?: number | null;
  expectedSalary?: number | null;
}

export interface ApplicationDetail extends ApplicationListItem {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  linkedinProfile?: string | null;
  portfolioWebsite?: string | null;
  currentCompany?: string | null;
  currentPosition?: string | null;
  experienceYears?: number | null;
  expectedSalary?: number | null;
  noticePeriod?: string | null;
  availableStartDate?: Date | null;
  coverLetter?: string | null;
  additionalInfo?: string | null;
  skills?: unknown;
  education?: unknown;
  certifications?: unknown;
  references?: unknown;
  portfolioFiles?: unknown;
  willingToRelocate: boolean;
  remoteWork: boolean;
  travelAvailability: boolean;
  visaSponsorship: boolean;
  backgroundCheck: boolean;
  termsAccepted: boolean;
  reviewNotes?: string | null;
  job: {
    title: string;
    department: string;
    location: string;
    type: string;
  };
}

export interface ApplicationsResponse {
  applications: ApplicationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    availableJobs: { id: string; title: string }[];
    statusCounts: Record<JobApplicationStatus, number>;
  };
}

export function validateApplicationFilters(
  data: unknown
): ApplicationFilterParams {
  return applicationFilterSchema.parse(data);
}

export function validateApplicationStatusUpdate(
  data: unknown
): ApplicationStatusUpdate {
  return applicationStatusUpdateSchema.parse(data);
}

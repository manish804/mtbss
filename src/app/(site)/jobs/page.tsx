import JobsPageClient from "./jobs-page-client";
import { HybridPageService } from "@/lib/services/hybrid-page-service";
import { getPublicCompanyData } from "@/lib/services/public-company-service";
import { prisma } from "@/lib/prisma";
import type { DatabaseJob } from "@/lib/types/jobs";

export const revalidate = 300;

async function getInitialJobs(): Promise<DatabaseJob[]> {
  try {
    const jobs = await prisma.jobOpening.findMany({
      where: { isActive: true },
      orderBy: { postedDate: "desc" },
      take: 100,
      include: {
        company: {
          select: {
            name: true,
            logo: true,
            website: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    return jobs.map((job) => ({
      ...job,
      salary: job.salary ?? undefined,
      applicationDeadline: job.applicationDeadline?.toISOString(),
      postedDate: job.postedDate.toISOString(),
      company: job.company
        ? {
            name: job.company.name,
            logo: job.company.logo ?? undefined,
            website: job.company.website ?? undefined,
          }
        : undefined,
    }));
  } catch (error) {
    console.error("Failed to fetch initial jobs data:", error);
    return [];
  }
}

export default async function JobsPage() {
  const [company, pageContent, initialJobs] = await Promise.all([
    getPublicCompanyData(),
    HybridPageService.getCachedPageContent("jobs"),
    getInitialJobs(),
  ]);

  return (
    <JobsPageClient
      companyName={company?.name ?? null}
      pageContent={pageContent}
      initialJobs={initialJobs}
    />
  );
}

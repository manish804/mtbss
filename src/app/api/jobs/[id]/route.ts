import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, ApiError } from "@/lib/errors/api-error";
import {
  validateJobForm,
  validateJobStatusToggle,
} from "@/lib/validation/job-schemas";

interface SyncedJobEntry {
  id: string;
  published?: boolean;
  lastModified?: string;
  [key: string]: unknown;
}

interface SyncedJobContentData {
  jobOpenings?: SyncedJobEntry[];
}

function parseSyncedContentData(raw: string): SyncedJobContentData {
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    return parsed as SyncedJobContentData;
  }
  return {};
}

/**
 * GET /api/jobs/[id] - Get a specific job opening
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.jobOpening.findUnique({
      where: { id },
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

    if (!job) {
      throw new ApiError("Job opening not found", 404);
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/jobs/[id] - Update a specific job opening
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validatedData = validateJobForm(body);

    const {
      title,
      department,
      location,
      type,
      experience,
      salary,
      description,
      requirements,
      responsibilities,
      skills,
      benefits,
      applicationDeadline,
      isActive,
    } = validatedData;

    const existingJob = await prisma.jobOpening.findUnique({
      where: { id },
    });

    if (!existingJob) {
      throw new ApiError("Job opening not found", 404);
    }

    const updatedJob = await prisma.jobOpening.update({
      where: { id },
      data: {
        title,
        department,
        location,
        type,
        experience,
        salary,
        description,
        requirements: requirements || [],
        responsibilities: responsibilities || [],
        skills: skills || [],
        benefits: benefits || [],
        applicationDeadline,
        isActive,
        updatedAt: new Date(),
      },
      include: {
        company: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
    });

    try {
      const { readFileSync, writeFileSync } = await import("fs");
      const { join } = await import("path");

      const filePath = join(process.cwd(), "src/lib/content-data.json");
      const contentData = parseSyncedContentData(readFileSync(filePath, "utf-8"));

      const updatedJobData = {
        id: updatedJob.id,
        type: "job",
        title: updatedJob.title,
        department: updatedJob.department,
        location: updatedJob.location,
        jobType: updatedJob.type,
        experience: updatedJob.experience,
        description: updatedJob.description,
        responsibilities: updatedJob.responsibilities,
        requirements: updatedJob.requirements,
        salaryRange: updatedJob.salary,
        benefits: updatedJob.benefits,
        published: updatedJob.isActive,
        lastModified: updatedJob.updatedAt.toISOString(),
      };

      contentData.jobOpenings = contentData.jobOpenings || [];
      const jobIndex = contentData.jobOpenings.findIndex(
        (job) => job.id === updatedJob.id
      );

      if (jobIndex !== -1) {
        contentData.jobOpenings[jobIndex] = updatedJobData;
      } else {
        contentData.jobOpenings.push(updatedJobData);
      }

      writeFileSync(filePath, JSON.stringify(contentData, null, 2), "utf-8");
    } catch (syncError) {
      console.warn("Failed to sync updated job to JSON:", syncError);
    }

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: "Job opening updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/jobs/[id] - Delete a specific job opening
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingJob = await prisma.jobOpening.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!existingJob) {
      throw new ApiError("Job opening not found", 404);
    }

    if (existingJob._count.applications > 0) {
      const { searchParams } = new URL(request.url);
      const force = searchParams.get("force") === "true";

      if (!force) {
        return NextResponse.json(
          {
            success: false,
            error: "Job has applications",
            message: `This job has ${existingJob._count.applications} application(s). Are you sure you want to delete it?`,
            applicationCount: existingJob._count.applications,
            requiresConfirmation: true,
          },
          { status: 409 }
        );
      }
    }

    await prisma.jobOpening.delete({
      where: { id },
    });

    try {
      const { readFileSync, writeFileSync } = await import("fs");
      const { join } = await import("path");

      const filePath = join(process.cwd(), "src/lib/content-data.json");
      const contentData = parseSyncedContentData(readFileSync(filePath, "utf-8"));

      contentData.jobOpenings = (contentData.jobOpenings || []).filter(
        (job) => job.id !== id
      );

      writeFileSync(filePath, JSON.stringify(contentData, null, 2), "utf-8");
    } catch (syncError) {
      console.warn("Failed to sync job deletion to JSON:", syncError);
    }

    return NextResponse.json({
      success: true,
      message: "Job opening deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/jobs/[id] - Update job status (toggle active/inactive)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { isActive } = validateJobStatusToggle(body);

    const existingJob = await prisma.jobOpening.findUnique({
      where: { id },
    });

    if (!existingJob) {
      throw new ApiError("Job opening not found", 404);
    }

    const updatedJob = await prisma.jobOpening.update({
      where: { id },
      data: {
        isActive,
        updatedAt: new Date(),
      },
      include: {
        company: {
          select: {
            name: true,
            logo: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    try {
      const { readFileSync, writeFileSync } = await import("fs");
      const { join } = await import("path");

      const filePath = join(process.cwd(), "src/lib/content-data.json");
      const contentData = parseSyncedContentData(readFileSync(filePath, "utf-8"));

      contentData.jobOpenings = contentData.jobOpenings || [];
      const jobIndex = contentData.jobOpenings.findIndex(
        (job) => job.id === updatedJob.id
      );

      if (jobIndex !== -1) {
        contentData.jobOpenings[jobIndex].published = updatedJob.isActive;
        contentData.jobOpenings[jobIndex].lastModified =
          updatedJob.updatedAt.toISOString();
      }

      writeFileSync(filePath, JSON.stringify(contentData, null, 2), "utf-8");
    } catch (syncError) {
      console.warn("Failed to sync job status to JSON:", syncError);
    }

    return NextResponse.json({
      success: true,
      data: updatedJob,
      message: `Job ${isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

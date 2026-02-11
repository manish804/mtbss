import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, ApiError } from "@/lib/errors/api-error";
import { z } from "zod";

const bulkDeleteSchema = z.object({
  applicationIds: z
    .array(z.string().cuid())
    .min(1, "At least one application ID is required"),
});

const bulkStatusUpdateSchema = z.object({
  applicationIds: z
    .array(z.string().cuid())
    .min(1, "At least one application ID is required"),
  status: z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "SHORTLISTED",
    "INTERVIEWED",
    "SELECTED",
    "REJECTED",
    "WITHDRAWN",
  ]),
});

/**
 * DELETE /api/applications/bulk - Delete multiple applications
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationIds } = bulkDeleteSchema.parse(body);

    const existingApplications = await prisma.jobApplication.findMany({
      where: {
        id: { in: applicationIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        job: {
          select: {
            title: true,
          },
        },
      },
    });

    if (existingApplications.length === 0) {
      throw new ApiError("No applications found with the provided IDs", 404);
    }

    if (existingApplications.length !== applicationIds.length) {
      const foundIds = existingApplications.map((app) => app.id);
      const missingIds = applicationIds.filter((id) => !foundIds.includes(id));
      throw new ApiError(
        `Some applications not found: ${missingIds.join(", ")}`,
        404
      );
    }

    const deleteResult = await prisma.jobApplication.deleteMany({
      where: {
        id: { in: applicationIds },
      },
    });



    return NextResponse.json({
      success: true,
      message: `${deleteResult.count} applications deleted successfully`,
      deletedCount: deleteResult.count,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/applications/bulk - Update status for multiple applications
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { applicationIds, status } = bulkStatusUpdateSchema.parse(body);

    const existingApplications = await prisma.jobApplication.findMany({
      where: {
        id: { in: applicationIds },
      },
      select: {
        id: true,
      },
    });

    if (existingApplications.length === 0) {
      throw new ApiError("No applications found with the provided IDs", 404);
    }

    if (existingApplications.length !== applicationIds.length) {
      const foundIds = existingApplications.map((app) => app.id);
      const missingIds = applicationIds.filter((id) => !foundIds.includes(id));
      throw new ApiError(
        `Some applications not found: ${missingIds.join(", ")}`,
        404
      );
    }

    const updateResult = await prisma.jobApplication.updateMany({
      where: {
        id: { in: applicationIds },
      },
      data: {
        status,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `${updateResult.count} applications updated to ${status} successfully`,
      updatedCount: updateResult.count,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

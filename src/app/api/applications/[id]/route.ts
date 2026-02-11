import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleApiError, ApiError } from "@/lib/errors/api-error";
import { validateApplicationStatusUpdate } from "@/lib/validation/application-schemas";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/applications/[id] - Get a specific job application with full details
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const application = await prisma.jobApplication.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            title: true,
            department: true,
            location: true,
            type: true,
          },
        },
      },
    });

    if (!application) {
      throw new ApiError("Job application not found", 404);
    }

    const applicationDetail = {
      id: application.id,
      jobId: application.jobId,
      jobTitle: application.job.title,
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      phone: application.phone,
      address: application.address,
      city: application.city,
      state: application.state,
      zipCode: application.zipCode,
      country: application.country,
      linkedinProfile: application.linkedinProfile,
      portfolioWebsite: application.portfolioWebsite,
      currentCompany: application.currentCompany,
      currentPosition: application.currentPosition,
      experienceYears: application.experienceYears,
      expectedSalary: application.expectedSalary,
      noticePeriod: application.noticePeriod,
      availableStartDate: application.availableStartDate,
      coverLetter: application.coverLetter,
      additionalInfo: application.additionalInfo,
      skills: application.skills,
      education: application.education,
      certifications: application.certifications,
      references: application.references,
      resumeUrl: application.resumeUrl,
      portfolioFiles: application.portfolioFiles,
      willingToRelocate: application.willingToRelocate,
      remoteWork: application.remoteWork,
      travelAvailability: application.travelAvailability,
      visaSponsorship: application.visaSponsorship,
      backgroundCheck: application.backgroundCheck,
      termsAccepted: application.termsAccepted,
      status: application.status,
      reviewNotes: application.reviewNotes,
      reviewedAt: application.reviewedAt,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt,
      hasReviewNotes: !!application.reviewNotes,
      job: {
        title: application.job.title,
        department: application.job.department,
        location: application.job.location,
        type: application.job.type,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        application: applicationDetail,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/applications/[id] - Update application status and/or review notes
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const validatedData = validateApplicationStatusUpdate(body);

    const existingApplication = await prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!existingApplication) {
      throw new ApiError("Job application not found", 404);
    }

    const updateData: Prisma.JobApplicationUpdateInput = {
      updatedAt: new Date(),
    };

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status;
      updateData.reviewedAt = new Date();
    }

    if (validatedData.reviewNotes !== undefined) {
      updateData.reviewNotes = validatedData.reviewNotes;
      updateData.reviewedAt = new Date();
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id },
      data: updateData,
      include: {
        job: {
          select: {
            title: true,
            department: true,
            location: true,
            type: true,
          },
        },
      },
    });

    const applicationDetail = {
      id: updatedApplication.id,
      jobId: updatedApplication.jobId,
      jobTitle: updatedApplication.job.title,
      firstName: updatedApplication.firstName,
      lastName: updatedApplication.lastName,
      email: updatedApplication.email,
      phone: updatedApplication.phone,
      status: updatedApplication.status,
      reviewNotes: updatedApplication.reviewNotes,
      reviewedAt: updatedApplication.reviewedAt,
      createdAt: updatedApplication.createdAt,
      hasReviewNotes: !!updatedApplication.reviewNotes,
      job: {
        title: updatedApplication.job.title,
        department: updatedApplication.job.department,
        location: updatedApplication.job.location,
        type: updatedApplication.job.type,
      },
    };

    return NextResponse.json({
      success: true,
      data: applicationDetail,
      message: "Application updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/applications/[id] - Delete a specific job application
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    const existingApplication = await prisma.jobApplication.findUnique({
      where: { id },
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

    if (!existingApplication) {
      throw new ApiError("Job application not found", 404);
    }

    await prisma.jobApplication.delete({
      where: { id },
    });

    console.log(
      `Application deleted: ${existingApplication.id} - ${existingApplication.firstName} ${existingApplication.lastName} (${existingApplication.email}) for job: ${existingApplication.job.title}`
    );

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors/api-error";
import { validateApplicationFilters } from "@/lib/validation/application-schemas";
import { JobApplicationStatus } from "@prisma/client";

/**
 * GET /api/applications - Get job applications with filtering, searching, and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      jobId: searchParams.get("jobId"),
      status: searchParams.get("status"),
      search: searchParams.get("search"),
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    };

    const filters = validateApplicationFilters(rawParams);

    const skip = (filters.page - 1) * filters.limit;

    const where: Prisma.JobApplicationWhereInput = {};

    if (filters.jobId && filters.jobId !== "all" && filters.jobId !== null) {
      where.jobId = filters.jobId;
    }

    if (filters.status && filters.status !== "all" && filters.status !== null) {
      where.status = filters.status;
    }

    if (filters.search && filters.search !== null) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        {
          job: {
            title: { contains: filters.search, mode: "insensitive" },
          },
        },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      const createdAtFilter: Prisma.DateTimeFilter = {};
      if (filters.dateFrom) {
        createdAtFilter.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setDate(endDate.getDate() + 1);
        createdAtFilter.lt = endDate;
      }
      where.createdAt = createdAtFilter;
    }

    const sortBy = filters.sortBy || "createdAt";
    const sortOrder = filters.sortOrder || "desc";
    const orderBy = {
      [sortBy]: sortOrder,
    } as Prisma.JobApplicationOrderByWithRelationInput;

    const [applications, total] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy,
        select: {
          id: true,
          jobId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          reviewedAt: true,
          reviewNotes: true,
          resumeUrl: true,
          currentCompany: true,
          currentPosition: true,
          experienceYears: true,
          expectedSalary: true,
          job: {
            select: {
              title: true,
            },
          },
        },
      }),
      prisma.jobApplication.count({ where }),
    ]);

    const transformedApplications = applications.map((app) => ({
      id: app.id,
      jobId: app.jobId,
      jobTitle: app.job.title,
      firstName: app.firstName,
      lastName: app.lastName,
      email: app.email,
      phone: app.phone,
      status: app.status,
      createdAt: app.createdAt,
      reviewedAt: app.reviewedAt,
      hasReviewNotes: !!app.reviewNotes,
      resumeUrl: app.resumeUrl,

      currentCompany: app.currentCompany,
      currentPosition: app.currentPosition,
      experienceYears: app.experienceYears,
      expectedSalary: app.expectedSalary,
    }));

    const [availableJobs, statusCounts] = await Promise.all([
      prisma.jobOpening.findMany({
        where: { isActive: true },
        select: {
          id: true,
          title: true,
        },
        orderBy: { title: "asc" },
      }),
      prisma.jobApplication.groupBy({
        by: ["status"],
        _count: {
          status: true,
        },
      }),
    ]);

    const statusCountsObj = Object.values(JobApplicationStatus).reduce(
      (acc, status) => {
        acc[status] = 0;
        return acc;
      },
      {} as Record<JobApplicationStatus, number>
    );

    statusCounts.forEach((item) => {
      statusCountsObj[item.status] = item._count.status;
    });

    return NextResponse.json({
      success: true,
      data: {
        applications: transformedApplications,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        },
        filters: {
          availableJobs,
          statusCounts: statusCountsObj,
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

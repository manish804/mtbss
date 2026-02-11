import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors/api-error";

/**
 * GET /api/jobs/stats - Get job opening statistics
 */
export async function GET() {
  try {
    const [total, active, inactive, totalApplications] = await Promise.all([
      prisma.jobOpening.count(),
      prisma.jobOpening.count({ where: { isActive: true } }),
      prisma.jobOpening.count({ where: { isActive: false } }),
      prisma.jobApplication.count(),
    ]);

    const departmentStats = await prisma.jobOpening.groupBy({
      by: ["department"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentJobs = await prisma.jobOpening.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const jobsWithApplications = await prisma.jobOpening.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        applications: {
          _count: "desc",
        },
      },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total,
          active,
          inactive,
          totalApplications,
          recentJobs,
        },
        departments: departmentStats.map((dept) => ({
          department: dept.department,
          count: dept._count.id,
        })),
        topJobs: jobsWithApplications.map((job) => ({
          id: job.id,
          title: job.title,
          applicationCount: job._count.applications,
        })),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors/api-error";
import {
  validateJobForm,
  validateJobFilters,
} from "@/lib/validation/job-schemas";

/**
 * GET /api/jobs - Get job openings with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawParams = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      department: searchParams.get("department"),
      location: searchParams.get("location"),
      type: searchParams.get("type"),
      experience: searchParams.get("experience"),
      search: searchParams.get("search"),
      active: searchParams.get("active"),
      sortBy: searchParams.get("sortBy"),
      sortOrder: searchParams.get("sortOrder"),
    };

    const filters = validateJobFilters(rawParams);

    const skip = (filters.page - 1) * filters.limit;

    const where: Prisma.JobOpeningWhereInput = {};

    if (filters.active && filters.active !== "all" && filters.active !== null) {
      where.isActive = filters.active === "true";
    }

    if (
      filters.department &&
      filters.department !== "all" &&
      filters.department !== null
    ) {
      where.department = filters.department;
    }

    if (
      filters.location &&
      filters.location !== "all" &&
      filters.location !== null
    ) {
      where.location = filters.location;
    }

    if (filters.type && filters.type !== null) {
      where.type = filters.type;
    }

    if (
      filters.experience &&
      filters.experience !== "all" &&
      filters.experience !== null
    ) {
      where.experience = { contains: filters.experience, mode: "insensitive" };
    }

    if (filters.search && filters.search !== null) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { department: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const sortBy = filters.sortBy || "postedDate";
    const sortOrder = filters.sortOrder || "desc";
    const orderBy = {
      [sortBy]: sortOrder,
    } as Prisma.JobOpeningOrderByWithRelationInput;

    const [jobs, total] = await Promise.all([
      prisma.jobOpening.findMany({
        where,
        skip,
        take: filters.limit,
        orderBy,
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
      }),
      prisma.jobOpening.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          totalPages: Math.ceil(total / filters.limit),
        },
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/jobs - Create a new job opening
 */
export async function POST(request: NextRequest) {
  try {
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

    // Get the existing company ID dynamically
    const existingCompany = await prisma.company.findFirst();
    if (!existingCompany) {
      return NextResponse.json(
        {
          success: false,
          error: "No company found. Please create a company first.",
        },
        { status: 400 }
      );
    }

    const job = await prisma.jobOpening.create({
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
        skills: skills,
        benefits: benefits,
        applicationDeadline,
        companyId: existingCompany.id,
        isActive,
        postedDate: new Date(),
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
      const contentData = JSON.parse(readFileSync(filePath, "utf-8"));

      const newJobData = {
        id: job.id,
        type: "job",
        title: job.title,
        department: job.department,
        location: job.location,
        jobType: job.type,
        experience: job.experience,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        salaryRange: job.salary,
        benefits: job.benefits,
        published: job.isActive,
        lastModified: job.createdAt.toISOString(),
      };

      contentData.jobOpenings = contentData.jobOpenings || [];
      contentData.jobOpenings.push(newJobData);

      writeFileSync(filePath, JSON.stringify(contentData, null, 2), "utf-8");
    } catch (syncError) {
      console.warn("Failed to sync new job to JSON:", syncError);
    }

    return NextResponse.json(
      {
        success: true,
        data: job,
        message: "Job opening created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

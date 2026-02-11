import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/errors/api-error";
import {
  validateCompanyForm,
  validateCompanyUpdate,
  type CompanyStats,
} from "@/lib/validation/company-schemas";

/**
 * GET /api/company - Get company details with statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get("includeStats") === "true";

    const company = await prisma.company.findFirst({
      include: {
        jobOpenings: {
          select: {
            id: true,
            title: true,
            isActive: true,
            createdAt: true,
            applications: includeStats
              ? {
                  select: {
                    id: true,
                    createdAt: true,
                  },
                }
              : false,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    let stats: CompanyStats | undefined;

    if (includeStats && company) {
      const totalJobOpenings = company.jobOpenings.length;
      const activeJobOpenings = company.jobOpenings.filter(
        (job) => job.isActive
      ).length;

      const totalApplications = company.jobOpenings.reduce((total, job) => {
        return total + (job.applications ? job.applications.length : 0);
      }, 0);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentApplications = company.jobOpenings.reduce((total, job) => {
        if (!job.applications) return total;
        return (
          total +
          job.applications.filter(
            (app) => new Date(app.createdAt) >= thirtyDaysAgo
          ).length
        );
      }, 0);

      stats = {
        totalJobOpenings,
        activeJobOpenings,
        totalApplications,
        recentApplications,
      };
    }

    return NextResponse.json({
      success: true,
      data: company,
      stats,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/company - Create company details
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const validatedData = validateCompanyForm(body);

    const existingCompany = await prisma.company.findFirst();
    if (existingCompany) {
      return NextResponse.json(
        {
          success: false,
          error: "Company already exists. Use PUT to update existing company.",
          existingCompany: {
            id: existingCompany.id,
            name: existingCompany.name,
          },
        },
        { status: 409 }
      );
    }

    const company = await prisma.company.create({
      data: {
        ...validatedData,
        socialLinks: validatedData.socialLinks ?? undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        jobOpenings: {
          select: {
            id: true,
            title: true,
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    revalidateTag("public-company", "max");

    return NextResponse.json(
      {
        success: true,
        data: company,
        message: "Company created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/company - Update company details
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const existingCompany = await prisma.company.findFirst();
    if (!existingCompany) {
      return NextResponse.json(
        {
          success: false,
          error: "No company found. Please create a company first.",
        },
        { status: 404 }
      );
    }

    const validatedData = validateCompanyUpdate(body);

    const cleanUpdateData = Object.fromEntries(
      Object.entries(validatedData).filter(([, value]) => value !== undefined)
    );

    const company = await prisma.company.update({
      where: { id: existingCompany.id },
      data: {
        ...cleanUpdateData,
        updatedAt: new Date(),
      },
      include: {
        jobOpenings: {
          select: {
            id: true,
            title: true,
            isActive: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    revalidateTag("public-company", "max");
    return NextResponse.json({
      success: true,
      data: company,
      message: "Company updated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/company - Delete company (admin only)
 */
export async function DELETE() {
  try {
    const existingCompany = await prisma.company.findFirst();
    if (!existingCompany) {
      return NextResponse.json(
        {
          success: false,
          error: "No company found to delete",
        },
        { status: 404 }
      );
    }

    const activeJobs = await prisma.jobOpening.count({
      where: {
        companyId: existingCompany.id,
        isActive: true,
      },
    });

    if (activeJobs > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete company with ${activeJobs} active job openings. Please deactivate all jobs first.`,
        },
        { status: 400 }
      );
    }

    await prisma.company.delete({
      where: { id: existingCompany.id },
    });

    revalidateTag("public-company", "max");

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

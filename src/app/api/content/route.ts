import { NextRequest, NextResponse } from "next/server";
import { ContentSyncService } from "@/lib/services/content-sync-service";
import { handleApiError, ApiError } from "@/lib/errors/api-error";
import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "@/lib/prisma";
import { isReadOnlyFileSystem } from "@/lib/utils/environment-helpers";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function readContentDataFromFile(): Record<string, unknown> {
  try {
    const filePath = join(process.cwd(), "src/lib/content-data.json");
    return JSON.parse(readFileSync(filePath, "utf-8")) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function readContentDataFromDatabase(): Promise<Record<string, unknown> | null> {
  try {
    const contentDataPage = await prisma.page.findUnique({
      where: { pageId: "content-data" },
      select: { content: true },
    });

    const content = contentDataPage?.content;
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return null;
    }

    return content as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function loadContentData(): Promise<Record<string, unknown>> {
  const fileContent = readContentDataFromFile();

  if (isReadOnlyFileSystem()) {
    const dbContent = await readContentDataFromDatabase();
    if (dbContent) {
      return { ...fileContent, ...dbContent };
    }
    return fileContent;
  }

  const hasFileContent = Object.keys(fileContent).length > 0;
  if (hasFileContent) {
    return fileContent;
  }

  const dbContent = await readContentDataFromDatabase();
  return dbContent || {};
}

/**
 * GET /api/content - Get content data (jobs, services, etc.)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const contentData = await loadContentData();

    let data;
    switch (type) {
      case "jobs":
        data = {
          jobOpenings: contentData.jobOpenings || [],
          departments: contentData.departments || [],
          jobTypes: contentData.jobTypes || [],
          locations: contentData.locations || [],
          experienceLevels: contentData.experienceLevels || [],
        };
        break;
      case "services":
        data = {
          services: contentData.services || [],
        };
        break;
      case "benefits":
        data = {
          benefits: contentData.benefits || [],
          companyCulture: contentData.companyCulture || [],
        };
        break;
      default:
        data = contentData;
    }

    return NextResponse.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/content - Update content data and sync to database
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || typeof body !== "object") {
      throw new ApiError("Invalid request body", 400);
    }

    await ContentSyncService.updateContentData(body);

    return NextResponse.json({
      success: true,
      message: "Content data updated and synced to database successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/content - Partially update content data
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      throw new ApiError("Type and data are required for partial updates", 400);
    }

    const updates = {
      [type]: data,
    };

    await ContentSyncService.updateContentData(updates);

    return NextResponse.json({
      success: true,
      message: `${type} updated and synced successfully`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

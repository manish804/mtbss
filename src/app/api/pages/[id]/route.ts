import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/lib/services/page-service";
import { ContentSyncService } from "@/lib/services/content-sync-service";
import { updatePageSchema } from "@/lib/validation/page-schemas";
import { handleApiError, ApiError } from "@/lib/errors/api-error";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/pages/[id] - Get a single page by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      throw new ApiError("Page ID is required", 400);
    }

    const page = await PageService.getPageById(id);

    return NextResponse.json({
      success: true,
      data: page,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PUT /api/pages/[id] - Update a page (full update)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      throw new ApiError("Page ID is required", 400);
    }

    const body = await request.json();

    const validatedData = updatePageSchema.parse(body);

    const page = await PageService.updatePage(id, validatedData);

    if (validatedData.content) {
      try {
        await ContentSyncService.updatePageContent(
          page.pageId,
          validatedData.content
        );
      } catch (syncError) {
        console.warn("Failed to sync to JSON file:", syncError);
      }
    }

    return NextResponse.json({
      success: true,
      data: page,
      message: "Page updated successfully and synced to JSON",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/pages/[id] - Partially update a page
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      throw new ApiError("Page ID is required", 400);
    }

    const body = await request.json();

    const validatedData = updatePageSchema.partial().parse(body);

    const page = await PageService.patchPage(id, validatedData);

    if (validatedData.content) {
      try {
        await ContentSyncService.updatePageContent(
          page.pageId,
          validatedData.content
        );
      } catch (syncError) {
        console.warn("Failed to sync to JSON file:", syncError);
      }
    }

    return NextResponse.json({
      success: true,
      data: page,
      message: "Page updated successfully and synced to JSON",
    });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { PageService } from "@/lib/services/page-service";
import { createPageSchema } from "@/lib/validation/page-schemas";
import { handleApiError, ApiError } from "@/lib/errors/api-error";
import { globalCache, CacheKeys } from "@/lib/utils/simple-cache";

type PageListOptions = {
  page: number;
  limit: number;
  published?: boolean;
  search?: string;
};

type PageListResult = Awaited<ReturnType<typeof PageService.getPages>>;

/**
 * GET /api/pages - List all pages with database-first approach
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const published = searchParams.get("published");
    const search = searchParams.get("search");

    if (page < 1 || limit < 1 || limit > 100) {
      throw new ApiError("Invalid pagination parameters", 400);
    }

    const options: PageListOptions = { page, limit };

    if (published !== null) {
      if (published === "true") options.published = true;
      else if (published === "false") options.published = false;
    }

    if (search) {
      options.search = search;
    }

    // Create cache key based on options
    const cacheKey = CacheKeys.pages(JSON.stringify(options));
    
    // Try cache first
    const cached = globalCache.get(cacheKey);
    if (cached) {
      const cachedResult = cached.data as PageListResult;
      return NextResponse.json({
        success: true,
        data: cachedResult.data,
        pagination: cachedResult.pagination,
        fromCache: true,
        source: cached.source
      });
    }

    // Get from database
    const result = await PageService.getPages(options);

    // Cache the result
    globalCache.set(cacheKey, result, 'database');

    const response = {
      success: true,
      ...result,
      fromCache: false,
      source: 'database'
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/pages - Create a new page
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = createPageSchema.parse(body);

    const page = await PageService.createPage(validatedData);

    // Invalidate pages cache when new page is created
    globalCache.invalidateByPattern(/^pages:/);

    return NextResponse.json(
      {
        success: true,
        data: page,
        message: "Page created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

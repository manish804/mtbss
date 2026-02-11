import { NextRequest, NextResponse } from "next/server";
import { ContentSyncService } from "@/lib/services/content-sync-service";
import { handleApiError, ApiError } from "@/lib/errors/api-error";
import { globalCache } from "@/lib/utils/simple-cache";

/**
 * POST /api/sync - Sync data between JSON files and database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Use a non-destructive default when callers omit direction.
    const { direction = "db-to-json", validate = false } = body;

    const result: {
      message?: string;
      validation?: Awaited<
        ReturnType<typeof ContentSyncService.validateDataConsistency>
      >;
    } = {};

    if (validate) {
      const validation = await ContentSyncService.validateDataConsistency();
      result.validation = validation;

      if (!validation.consistent) {
        console.warn("Data inconsistencies found:", validation.issues);
      }
    }

    switch (direction) {
      case "json-to-db":
        await ContentSyncService.syncAllJsonToDatabase();
        result.message = "Successfully synced JSON files to database";
        break;

      case "db-to-json":
        await ContentSyncService.syncDatabaseToJson();
        result.message = "Successfully synced database to JSON files";
        break;

      case "both":
        await ContentSyncService.syncAllJsonToDatabase();
        await ContentSyncService.syncDatabaseToJson();
        result.message = "Successfully synced in both directions";
        break;

      default:
        throw new ApiError(
          "Invalid sync direction. Use: json-to-db, db-to-json, or both",
          400
        );
    }

    // Clear page caches so admin and site reads don't serve stale data after sync.
    globalCache.invalidateByPattern(/^page:/);
    globalCache.invalidateByPattern(/^pages:/);
    globalCache.invalidateByPattern(/^json-page:/);

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * GET /api/sync - Get sync status and validation
 */
export async function GET() {
  try {
    const validation = await ContentSyncService.validateDataConsistency();

    return NextResponse.json({
      success: true,
      data: {
        consistent: validation.consistent,
        issues: validation.issues,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

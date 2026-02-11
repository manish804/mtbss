import { NextRequest, NextResponse } from "next/server";
import { getDepartmentsAsync } from "@/lib/departments";
import { handleApiError } from "@/lib/errors/api-error";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("includeAll") === "true";
    const departments = await getDepartmentsAsync({ includeAll });

    return NextResponse.json(
      {
        success: true,
        data: departments,
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

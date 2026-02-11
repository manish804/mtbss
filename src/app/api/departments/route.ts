import { NextRequest, NextResponse } from "next/server";
import { getDepartments } from "@/lib/departments";
import { handleApiError } from "@/lib/errors/api-error";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeAll = searchParams.get("includeAll") === "true";
    const departments = getDepartments({ includeAll });

    return NextResponse.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

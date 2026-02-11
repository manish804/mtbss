export class ApiError extends Error {
  statusCode: number;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function handleApiError(error: unknown): Response {
  console.error("API Error:", error);

  if (error instanceof ApiError) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.details,
        statusCode: error.statusCode,
      }),
      {
        status: error.statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (
    error instanceof Error &&
    error.message.startsWith("Validation failed:")
  ) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        statusCode: 400,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (error && typeof error === "object" && "issues" in error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Validation failed",
        details: error,
        statusCode: 400,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (error && typeof error === "object" && "code" in error) {
    const prismaError = error as { code?: unknown };
    const prismaCode =
      typeof prismaError.code === "string" ? prismaError.code : "";
    let message = "Database error";
    let statusCode = 500;

    switch (prismaCode) {
      case "P2002":
        message = "A record with this identifier already exists";
        statusCode = 409;
        break;
      case "P2025":
        message = "Record not found";
        statusCode = 404;
        break;
      default:
        message = "Database operation failed";
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
        statusCode,
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: false,
      error: "Internal server error",
      statusCode: 500,
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}

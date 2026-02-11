import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidDepartmentKey, normalizeDepartmentKey } from "@/lib/departments";

function getDepartmentFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const department = (payload as { department?: unknown }).department;
  if (typeof department !== "string") {
    return null;
  }

  return normalizeDepartmentKey(department);
}

function getPrismaErrorCode(error: unknown): string | null {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const employee = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: employee });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const body = await request.json();
    const department = getDepartmentFromPayload(body);

    if (!department) {
      return NextResponse.json(
        { error: "Department is required." },
        { status: 400 }
      );
    }

    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (!existingEmployee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    if (!isValidDepartmentKey(department)) {
      const existingDepartment = normalizeDepartmentKey(
        existingEmployee.department
      );

      if (existingDepartment !== department) {
        return NextResponse.json(
          { error: "Invalid department key. Please select a valid department." },
          { status: 400 }
        );
      }
    }

    const employee = await prisma.employee.update({
      where: { employeeId },
      data: {
        ...(body as Record<string, unknown>),
        department,
      },
    });

    return NextResponse.json({ data: employee });
  } catch (error: unknown) {
    const errorCode = getPrismaErrorCode(error);
    if (errorCode === "P2025") {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;

    const employee = await prisma.employee.findUnique({
      where: { employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    await prisma.leaveRequest.deleteMany({
      where: { empId: employee.id },
    });

    await prisma.employee.delete({
      where: { employeeId },
    });

    return NextResponse.json({ message: "Employee deleted" });
  } catch (error: unknown) {
    console.error("Delete error:", error);
    const errorCode = getPrismaErrorCode(error);

    if (errorCode === "P2025") {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }
    if (errorCode === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete employee with existing records" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

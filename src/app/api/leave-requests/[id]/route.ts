import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { error: "Leave request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(leaveRequest, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, reviewNotes } = body;

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        reviewNotes,
        reviewedAt: new Date(),
      },
      include: { employee: true },
    });

    if (status === "APPROVED") {
      try {
        await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/api/emails/leave-approval`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeName: leaveRequest.employee.name,
              email: leaveRequest.employee.email || "no-email@company.com",
              leaveType: leaveRequest.leaveType,
              startDate: new Date(leaveRequest.startDate).toLocaleDateString(),
              endDate: new Date(leaveRequest.endDate).toLocaleDateString(),
              totalDays: leaveRequest.appliedDays.toString(),
              isHalfDay: leaveRequest.isHalfDay,
              reason: leaveRequest.reason,
            }),
          }
        );
      } catch (emailError) {
        console.error("Failed to send approval email:", emailError);
      }
    } else if (status === "REJECTED") {
      try {
        await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/api/emails/leave-rejection`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              employeeName: leaveRequest.employee.name,
              email: leaveRequest.employee.email || "no-email@company.com",
              leaveType: leaveRequest.leaveType,
              startDate: new Date(leaveRequest.startDate).toLocaleDateString(),
              endDate: new Date(leaveRequest.endDate).toLocaleDateString(),
              totalDays: leaveRequest.appliedDays.toString(),
              isHalfDay: leaveRequest.isHalfDay,
              reason: leaveRequest.reason,
              rejectionReason: reviewNotes,
            }),
          }
        );
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
      }
    }

    return NextResponse.json(leaveRequest);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

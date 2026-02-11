import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employeeId, leaveType, startDate, endDate, reason, isHalfDay, isPaidLeave } = body;

    const employee = await prisma.employee.findUnique({
      where: { employeeId }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const appliedDays = isHalfDay ? 0.5 : Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        empId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        designation: employee.designation,
        leaveType,
        startDate: start,
        endDate: end,
        appliedDays,
        contactNumber: employee.contactNumber,
        reason,
        isHalfDay,
        isPaidLeave
      }
    });

    return NextResponse.json(leaveRequest);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const leaveRequests = await prisma.leaveRequest.findMany({
      include: { employee: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(leaveRequests);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isValidDepartmentKeyAsync, normalizeDepartmentKey } from '@/lib/departments';

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

function getStringField(payload: unknown, field: string): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const value = (payload as Record<string, unknown>)[field];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export async function GET() {
  try {
    const employees = await prisma.employee.findMany();
    return NextResponse.json(
      { data: employees },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const department = getDepartmentFromPayload(body);
    const employeeId = getStringField(body, "employeeId");
    const name = getStringField(body, "name");
    const designation = getStringField(body, "designation");
    const contactNumber = getStringField(body, "contactNumber");
    const email = getStringField(body, "email");

    if (!employeeId || !name || !designation || !contactNumber) {
      return NextResponse.json(
        { error: "Missing required employee fields." },
        { status: 400 }
      );
    }

    if (!department || !(await isValidDepartmentKeyAsync(department))) {
      return NextResponse.json(
        { error: "Invalid department key. Please select a valid department." },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        name,
        designation,
        contactNumber,
        email,
        department,
      }
    });
    return NextResponse.json({ data: employee }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { ConfirmLeave, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  buildLeaveDuplicateKey,
  isEmptyImportCell,
  LeaveImportError,
  LeaveImportHeader,
  LEAVE_IMPORT_MAX_ROWS,
  LEAVE_IMPORT_REQUIRED_HEADERS,
  LeaveImportRowCells,
  ParsedLeaveImportRow,
  parseLeaveImportRow,
  resolveLeaveImportHeader,
} from "@/lib/leave-import";
import { prisma } from "@/lib/prisma";

function badRequest(message: string) {
  return NextResponse.json(
    { success: false, error: message },
    { status: 400 }
  );
}

function isEmptyRow(row: unknown[]): boolean {
  return row.every((cell) => isEmptyImportCell(cell));
}

export async function POST(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return badRequest("Request must be multipart/form-data");
    }

    const formData = await request.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return badRequest("File is required");
    }

    if (!uploadedFile.name.toLowerCase().endsWith(".xlsx")) {
      return badRequest("Only .xlsx files are supported");
    }

    if (uploadedFile.size === 0) {
      return badRequest("Uploaded file is empty");
    }

    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    const XLSX = await import("xlsx");

    let workbook: import("xlsx").WorkBook;
    try {
      workbook = XLSX.read(fileBuffer, { type: "buffer", cellDates: true });
    } catch {
      return badRequest("Invalid Excel file");
    }

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return badRequest("Workbook has no sheets");
    }

    const sheet = workbook.Sheets[firstSheetName];
    const allRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: true,
      defval: "",
    });

    if (allRows.length === 0) {
      return badRequest("Sheet is empty");
    }

    const headerRow = Array.isArray(allRows[0]) ? allRows[0] : [];
    if (headerRow.length === 0 || isEmptyRow(headerRow)) {
      return badRequest("Header row is missing");
    }

    const headerMap = new Map<LeaveImportHeader, number>();
    headerRow.forEach((headerCell, index) => {
      const header = resolveLeaveImportHeader(headerCell);
      if (header && !headerMap.has(header)) {
        headerMap.set(header, index);
      }
    });

    const missingHeaders = LEAVE_IMPORT_REQUIRED_HEADERS.filter(
      (header) => !headerMap.has(header)
    );
    if (missingHeaders.length > 0) {
      return badRequest(
        `Missing required header(s): ${missingHeaders.join(", ")}`
      );
    }

    const dataRows = allRows
      .slice(1)
      .map((row, index) => ({
        rowNumber: index + 2,
        values: Array.isArray(row) ? row : [],
      }))
      .filter((entry) => !isEmptyRow(entry.values));

    if (dataRows.length === 0) {
      return badRequest("No data rows found");
    }

    if (dataRows.length > LEAVE_IMPORT_MAX_ROWS) {
      return badRequest(
        `Row limit exceeded. Maximum allowed rows: ${LEAVE_IMPORT_MAX_ROWS}`
      );
    }

    const errors: LeaveImportError[] = [];
    const parsedRows: ParsedLeaveImportRow[] = [];
    let invalidRows = 0;

    for (const dataRow of dataRows) {
      const cells: LeaveImportRowCells = {};
      for (const [header, index] of headerMap.entries()) {
        cells[header] = dataRow.values[index];
      }

      const parsed = parseLeaveImportRow(cells, dataRow.rowNumber);
      if (parsed.error) {
        errors.push(parsed.error);
        invalidRows += 1;
        continue;
      }

      parsedRows.push(parsed.data);
    }

    const employeeIds = Array.from(
      new Set(parsedRows.map((row) => row.employeeId))
    );

    const employees = employeeIds.length
      ? await prisma.employee.findMany({
          where: {
            employeeId: { in: employeeIds },
          },
          select: {
            id: true,
            employeeId: true,
            name: true,
            department: true,
            designation: true,
            contactNumber: true,
          },
        })
      : [];

    const employeeMap = new Map(
      employees.map((employee) => [employee.employeeId, employee])
    );

    const matchedEmployeeDbIds = Array.from(
      new Set(employees.map((employee) => employee.id))
    );

    const existingLeaves = matchedEmployeeDbIds.length
      ? await prisma.leaveRequest.findMany({
          where: {
            empId: { in: matchedEmployeeDbIds },
          },
          select: {
            empId: true,
            leaveType: true,
            startDate: true,
            endDate: true,
          },
        })
      : [];

    const existingDuplicateKeys = new Set(
      existingLeaves.map((leave) =>
        buildLeaveDuplicateKey(
          leave.empId,
          leave.leaveType,
          leave.startDate,
          leave.endDate
        )
      )
    );

    let skippedDuplicateRows = 0;
    const createData: Prisma.LeaveRequestCreateManyInput[] = [];

    for (const parsedRow of parsedRows) {
      const employee = employeeMap.get(parsedRow.employeeId);
      if (!employee) {
        errors.push({
          rowNumber: parsedRow.rowNumber,
          employeeId: parsedRow.employeeId,
          reason: "Employee not found",
        });
        invalidRows += 1;
        continue;
      }

      const duplicateKey = buildLeaveDuplicateKey(
        employee.id,
        parsedRow.leaveType,
        parsedRow.startDate,
        parsedRow.endDate
      );
      if (existingDuplicateKeys.has(duplicateKey)) {
        errors.push({
          rowNumber: parsedRow.rowNumber,
          employeeId: parsedRow.employeeId,
          reason:
            "Duplicate leave request skipped (same employee, leave type, start date, and end date)",
        });
        skippedDuplicateRows += 1;
        continue;
      }

      existingDuplicateKeys.add(duplicateKey);

      const reviewedAt =
        parsedRow.status === "PENDING"
          ? null
          : parsedRow.reviewedAt ?? new Date();

      createData.push({
        empId: employee.id,
        employeeName: employee.name,
        department: employee.department,
        designation: employee.designation,
        leaveType: parsedRow.leaveType,
        startDate: parsedRow.startDate,
        endDate: parsedRow.endDate,
        appliedDays: parsedRow.appliedDays,
        contactNumber: employee.contactNumber,
        reason: parsedRow.reason,
        isHalfDay: parsedRow.isHalfDay,
        isPaidLeave: parsedRow.isPaidLeave,
        status: parsedRow.status,
        confirmLeave: ConfirmLeave.DONT_KNOW,
        reviewNotes: parsedRow.reviewNotes,
        reviewedAt,
      });
    }

    let importedRows = 0;
    if (createData.length > 0) {
      const createResult = await prisma.leaveRequest.createMany({
        data: createData,
      });
      importedRows = createResult.count;
    }

    errors.sort((a, b) => a.rowNumber - b.rowNumber);

    return NextResponse.json({
      success: true,
      summary: {
        totalRows: dataRows.length,
        importedRows,
        skippedDuplicateRows,
        invalidRows,
      },
      errors,
    });
  } catch (error) {
    console.error("Leave import failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

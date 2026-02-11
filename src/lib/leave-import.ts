const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);
const MILLIS_PER_DAY = 24 * 60 * 60 * 1000;

export const LEAVE_IMPORT_REQUIRED_HEADERS = [
  "Employee ID",
  "Leave Type",
  "Start Date",
  "End Date",
  "Reason",
  "Status",
] as const;

export const LEAVE_IMPORT_OPTIONAL_HEADERS = [
  "Half Day",
  "Paid Leave",
  "Review Notes",
  "Reviewed At",
] as const;

export const LEAVE_IMPORT_HEADERS = [
  ...LEAVE_IMPORT_REQUIRED_HEADERS,
  ...LEAVE_IMPORT_OPTIONAL_HEADERS,
] as const;

export const LEAVE_IMPORT_MAX_ROWS = 1000;

export type LeaveImportHeader = (typeof LEAVE_IMPORT_HEADERS)[number];
export type ImportedLeaveType = "CASUAL" | "PAID" | "COMP_OFF";
export type ImportedLeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface LeaveImportError {
  rowNumber: number;
  employeeId?: string;
  reason: string;
}

export interface ParsedLeaveImportRow {
  rowNumber: number;
  employeeId: string;
  leaveType: ImportedLeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  isHalfDay: boolean;
  isPaidLeave: boolean;
  status: ImportedLeaveStatus;
  reviewNotes: string | null;
  reviewedAt: Date | null;
  appliedDays: number;
}

export type LeaveImportRowCells = Partial<Record<LeaveImportHeader, unknown>>;

export const LEAVE_IMPORT_SAMPLE_ROW: Record<LeaveImportHeader, string> = {
  "Employee ID": "EMP001",
  "Leave Type": "CASUAL",
  "Start Date": "2026-02-11",
  "End Date": "2026-02-11",
  "Reason": "Family event",
  Status: "PENDING",
  "Half Day": "No",
  "Paid Leave": "Yes",
  "Review Notes": "",
  "Reviewed At": "",
};

const HEADER_ALIASES: Record<string, LeaveImportHeader> = {
  "employee id": "Employee ID",
  employeeid: "Employee ID",
  "leave type": "Leave Type",
  leavetype: "Leave Type",
  "start date": "Start Date",
  startdate: "Start Date",
  "end date": "End Date",
  enddate: "End Date",
  reason: "Reason",
  status: "Status",
  "half day": "Half Day",
  halfday: "Half Day",
  "paid leave": "Paid Leave",
  paidleave: "Paid Leave",
  "review notes": "Review Notes",
  reviewnotes: "Review Notes",
  "reviewed at": "Reviewed At",
  reviewedat: "Reviewed At",
};

const LEAVE_TYPE_ALIASES: Record<string, ImportedLeaveType> = {
  casual: "CASUAL",
  "casual leave": "CASUAL",
  paid: "PAID",
  "paid leave": "PAID",
  "comp off": "COMP_OFF",
  compoff: "COMP_OFF",
};

const LEAVE_STATUS_ALIASES: Record<string, ImportedLeaveStatus> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
  cancelled: "CANCELLED",
  canceled: "CANCELLED",
};

const BOOLEAN_TRUE_VALUES = new Set(["true", "yes", "y", "1"]);
const BOOLEAN_FALSE_VALUES = new Set(["false", "no", "n", "0"]);

function normalizeToken(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function normalizeDateOnlyUtc(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

function createImportError(
  rowNumber: number,
  reason: string,
  employeeId?: string
): LeaveImportError {
  return employeeId
    ? { rowNumber, employeeId, reason }
    : { rowNumber, reason };
}

function parseExcelSerialDate(serial: number): Date | null {
  if (!Number.isFinite(serial)) {
    return null;
  }

  const wholeDays = Math.trunc(serial);
  const fractionalDays = serial - wholeDays;
  const millis = wholeDays * MILLIS_PER_DAY + Math.round(fractionalDays * MILLIS_PER_DAY);

  return new Date(EXCEL_EPOCH_UTC + millis);
}

function parseDateString(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const day = Number(slashMatch[2]);
    const year = Number(slashMatch[3]);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function parseOptionalBoolean(
  value: unknown,
  defaultValue: boolean
): boolean | null {
  if (isEmptyImportCell(value)) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return null;
  }

  if (typeof value === "string") {
    const normalized = normalizeToken(value).replace(/\s+/g, "");
    if (BOOLEAN_TRUE_VALUES.has(normalized)) {
      return true;
    }
    if (BOOLEAN_FALSE_VALUES.has(normalized)) {
      return false;
    }
  }

  return null;
}

function parseOptionalReviewedAt(value: unknown): Date | null | undefined {
  if (isEmptyImportCell(value)) {
    return null;
  }

  const parsed = parseSpreadsheetDate(value);
  if (!parsed) {
    return undefined;
  }

  return parsed;
}

export function isEmptyImportCell(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim().length === 0;
  }

  return false;
}

export function getImportCellString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }

  return "";
}

export function resolveLeaveImportHeader(value: unknown): LeaveImportHeader | null {
  if (typeof value !== "string" && typeof value !== "number") {
    return null;
  }

  const normalized = normalizeToken(String(value));
  if (!normalized) {
    return null;
  }

  return HEADER_ALIASES[normalized] ?? null;
}

export function parseLeaveType(value: unknown): ImportedLeaveType | null {
  const normalized = normalizeToken(getImportCellString(value));
  if (!normalized) {
    return null;
  }

  return LEAVE_TYPE_ALIASES[normalized] ?? null;
}

export function parseLeaveStatus(value: unknown): ImportedLeaveStatus | null {
  const normalized = normalizeToken(getImportCellString(value));
  if (!normalized) {
    return null;
  }

  return LEAVE_STATUS_ALIASES[normalized] ?? null;
}

export function parseSpreadsheetDate(value: unknown): Date | null {
  if (isEmptyImportCell(value)) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    return parseExcelSerialDate(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      const numeric = Number(trimmed);
      const serialDate = parseExcelSerialDate(numeric);
      if (serialDate) {
        return serialDate;
      }
    }

    return parseDateString(trimmed);
  }

  return null;
}

export function calculateAppliedDays(
  startDate: Date,
  endDate: Date,
  isHalfDay: boolean
): number {
  if (isHalfDay) {
    return 0.5;
  }

  const startUtc = Date.UTC(
    startDate.getUTCFullYear(),
    startDate.getUTCMonth(),
    startDate.getUTCDate()
  );
  const endUtc = Date.UTC(
    endDate.getUTCFullYear(),
    endDate.getUTCMonth(),
    endDate.getUTCDate()
  );

  return Math.floor((endUtc - startUtc) / MILLIS_PER_DAY) + 1;
}

export function buildLeaveDuplicateKey(
  employeeDbId: string,
  leaveType: string,
  startDate: Date,
  endDate: Date
): string {
  const start = normalizeDateOnlyUtc(startDate).toISOString();
  const end = normalizeDateOnlyUtc(endDate).toISOString();
  return `${employeeDbId}|${leaveType}|${start}|${end}`;
}

export function parseLeaveImportRow(
  row: LeaveImportRowCells,
  rowNumber: number
):
  | { data: ParsedLeaveImportRow; error: null }
  | { data: null; error: LeaveImportError } {
  const employeeId = getImportCellString(row["Employee ID"]);
  if (!employeeId) {
    return {
      data: null,
      error: createImportError(rowNumber, "Employee ID is required"),
    };
  }

  const leaveType = parseLeaveType(row["Leave Type"]);
  if (!leaveType) {
    return {
      data: null,
      error: createImportError(rowNumber, "Invalid Leave Type", employeeId),
    };
  }

  const status = parseLeaveStatus(row.Status);
  if (!status) {
    return {
      data: null,
      error: createImportError(rowNumber, "Invalid Status", employeeId),
    };
  }

  const startDateValue = parseSpreadsheetDate(row["Start Date"]);
  if (!startDateValue) {
    return {
      data: null,
      error: createImportError(rowNumber, "Invalid Start Date", employeeId),
    };
  }

  const endDateValue = parseSpreadsheetDate(row["End Date"]);
  if (!endDateValue) {
    return {
      data: null,
      error: createImportError(rowNumber, "Invalid End Date", employeeId),
    };
  }

  const startDate = normalizeDateOnlyUtc(startDateValue);
  const endDate = normalizeDateOnlyUtc(endDateValue);

  if (startDate.getTime() > endDate.getTime()) {
    return {
      data: null,
      error: createImportError(
        rowNumber,
        "Start Date must be on or before End Date",
        employeeId
      ),
    };
  }

  const reason = getImportCellString(row.Reason);
  if (!reason) {
    return {
      data: null,
      error: createImportError(rowNumber, "Reason is required", employeeId),
    };
  }

  const isHalfDay = parseOptionalBoolean(row["Half Day"], false);
  if (isHalfDay === null) {
    return {
      data: null,
      error: createImportError(
        rowNumber,
        "Invalid Half Day value (use yes/no, true/false, 1/0)",
        employeeId
      ),
    };
  }

  if (isHalfDay && startDate.getTime() !== endDate.getTime()) {
    return {
      data: null,
      error: createImportError(
        rowNumber,
        "Half Day leave must have the same Start Date and End Date",
        employeeId
      ),
    };
  }

  const isPaidLeave = parseOptionalBoolean(row["Paid Leave"], true);
  if (isPaidLeave === null) {
    return {
      data: null,
      error: createImportError(
        rowNumber,
        "Invalid Paid Leave value (use yes/no, true/false, 1/0)",
        employeeId
      ),
    };
  }

  const reviewedAt = parseOptionalReviewedAt(row["Reviewed At"]);
  if (reviewedAt === undefined) {
    return {
      data: null,
      error: createImportError(rowNumber, "Invalid Reviewed At value", employeeId),
    };
  }

  const reviewNotesValue = getImportCellString(row["Review Notes"]);
  const reviewNotes = reviewNotesValue || null;

  return {
    data: {
      rowNumber,
      employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
      isHalfDay,
      isPaidLeave,
      status,
      reviewNotes,
      reviewedAt,
      appliedDays: calculateAppliedDays(startDate, endDate, isHalfDay),
    },
    error: null,
  };
}

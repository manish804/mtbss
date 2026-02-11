import { readFileSync } from "fs";
import { join } from "path";

export interface DepartmentOption {
  key: string;
  label: string;
}

interface RawDepartment {
  key?: unknown;
  label?: unknown;
}

interface ContentDataShape {
  departments?: RawDepartment[];
}

const DEFAULT_DEPARTMENTS: DepartmentOption[] = [
  { key: "all", label: "All Departments" },
  { key: "finance", label: "Finance & Accounting" },
  { key: "marketing", label: "Marketing" },
  { key: "technology", label: "Technology" },
  { key: "operations", label: "Operations" },
  { key: "other", label: "Other" },
];

export function normalizeDepartmentKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function humanizeDepartmentKey(key: string): string {
  return key
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readRawDepartments(): RawDepartment[] {
  try {
    const filePath = join(process.cwd(), "src/lib/content-data.json");
    const fileContent = readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(fileContent) as ContentDataShape;
    return Array.isArray(parsed.departments) ? parsed.departments : [];
  } catch {
    return [];
  }
}

export function getDepartments(
  options: { includeAll?: boolean } = {}
): DepartmentOption[] {
  const includeAll = options.includeAll ?? false;
  const source = readRawDepartments();
  const entries = source.length > 0 ? source : DEFAULT_DEPARTMENTS;
  const normalized = new Map<string, DepartmentOption>();

  for (const department of entries) {
    if (typeof department?.key !== "string") continue;
    const key = normalizeDepartmentKey(department.key);
    if (!key) continue;
    if (!includeAll && key === "all") continue;
    if (normalized.has(key)) continue;

    const label =
      typeof department?.label === "string" && department.label.trim()
        ? department.label.trim()
        : humanizeDepartmentKey(key);

    normalized.set(key, { key, label });
  }

  return Array.from(normalized.values());
}

export function isValidDepartmentKey(
  key: string,
  options: { includeAll?: boolean } = {}
): boolean {
  const normalizedKey = normalizeDepartmentKey(key);
  if (!normalizedKey) return false;
  return getDepartments(options).some((department) => department.key === normalizedKey);
}

export function getDepartmentLabel(key: string): string {
  const normalizedKey = normalizeDepartmentKey(key);
  if (!normalizedKey) return "";

  const department = getDepartments({ includeAll: true }).find(
    (item) => item.key === normalizedKey
  );

  if (department) {
    return department.label;
  }

  return humanizeDepartmentKey(normalizedKey);
}

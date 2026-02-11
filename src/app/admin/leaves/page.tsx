"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Download, FileDown, Upload } from "lucide-react";
import { useDepartments } from "@/hooks/use-departments";
import {
  LEAVE_IMPORT_HEADERS,
  LEAVE_IMPORT_SAMPLE_ROW,
} from "@/lib/leave-import";

interface LeaveRequest {
  id: string;
  employeeName: string;
  department: string;
  designation: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  appliedDays: number;
  isHalfDay: boolean;
  isPaidLeave: boolean;
  contactNumber: string;
  reason: string;
  status: string;
  reviewNotes?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}

interface LeaveImportError {
  rowNumber: number;
  employeeId?: string;
  reason: string;
}

interface LeaveImportResponse {
  success: boolean;
  error?: string;
  summary?: {
    totalRows: number;
    importedRows: number;
    skippedDuplicateRows: number;
    invalidRows: number;
  };
  errors?: LeaveImportError[];
}

const ITEMS_PER_PAGE = 10;

function formatDateISO(dateValue: string | Date) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTime(dateValue?: string | null) {
  if (!dateValue) return "";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeCsvCell(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export default function LeavesPage() {
  const { departments, getDepartmentLabel } = useDepartments();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [filteredLeaves, setFilteredLeaves] = useState<LeaveRequest[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [departmentFilter, setDepartmentFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/leave-requests", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setLeaves(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch leave requests",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch leave requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void fetchLeaves();
  }, [fetchLeaves]);

  useEffect(() => {
    let filtered = leaves;

    if (statusFilter !== "ALL") {
      filtered = filtered.filter((leave) => leave.status === statusFilter);
    }

    if (departmentFilter !== "ALL") {
      filtered = filtered.filter(
        (leave) => leave.department === departmentFilter
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (leave) =>
          leave.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          leave.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLeaves(filtered);
    setCurrentPage(1);
  }, [leaves, statusFilter, departmentFilter, searchTerm]);

  const downloadImportErrorsCsv = useCallback(
    (errors: LeaveImportError[]) => {
      if (errors.length === 0) return;

      const header = "Row Number,Employee ID,Reason";
      const rows = errors.map((error) =>
        [
          String(error.rowNumber),
          error.employeeId ? escapeCsvCell(error.employeeId) : "",
          escapeCsvCell(error.reason),
        ].join(",")
      );

      const csvContent = [header, ...rows].join("\n");
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `leave-import-errors-${formatDateISO(new Date())}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    },
    []
  );

  const handleDownloadImportTemplate = useCallback(async () => {
    try {
      const XLSX = await import("xlsx");

      const sampleRowValues = LEAVE_IMPORT_HEADERS.map(
        (header) => LEAVE_IMPORT_SAMPLE_ROW[header] ?? ""
      );

      const worksheet = XLSX.utils.aoa_to_sheet([
        [...LEAVE_IMPORT_HEADERS],
        sampleRowValues,
      ]);
      worksheet["!cols"] = [
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
        { wch: 14 },
        { wch: 28 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 30 },
        { wch: 22 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Import");

      const xlsxBytes = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([xlsxBytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `leave-import-template-${formatDateISO(new Date())}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Template Ready",
        description: "Leave import template downloaded",
      });
    } catch (error) {
      console.error("Failed to download import template:", error);
      toast({
        title: "Template Download Failed",
        description: "Could not generate import template",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleImportExcel = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFileSelected = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file) {
        return;
      }

      try {
        setImporting(true);

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/leave-requests/import", {
          method: "POST",
          body: formData,
        });

        const result = (await response.json()) as LeaveImportResponse;

        if (!response.ok || !result.success || !result.summary) {
          toast({
            title: "Import Failed",
            description: result.error || "Unable to import leave requests",
            variant: "destructive",
          });
          return;
        }

        const errors = Array.isArray(result.errors) ? result.errors : [];
        const hasIssues = errors.length > 0;
        const summary = result.summary;

        toast({
          title: hasIssues ? "Import Completed with Issues" : "Import Complete",
          description: `Imported ${summary.importedRows}/${summary.totalRows}. Duplicates: ${summary.skippedDuplicateRows}. Invalid: ${summary.invalidRows}.`,
          variant: hasIssues ? "destructive" : "default",
        });

        if (hasIssues) {
          downloadImportErrorsCsv(errors);
        }

        await fetchLeaves();
      } catch (error) {
        console.error("Failed to import leave requests:", error);
        toast({
          title: "Import Failed",
          description: "Unable to import leave requests",
          variant: "destructive",
        });
      } finally {
        setImporting(false);
      }
    },
    [downloadImportErrorsCsv, fetchLeaves, toast]
  );

  const handleExportExcel = useCallback(async () => {
    if (filteredLeaves.length === 0) {
      toast({
        title: "No Data",
        description: "No leave requests to export",
        variant: "destructive",
      });
      return;
    }

    try {
      setExporting(true);
      const XLSX = await import("xlsx");

      const rows = filteredLeaves.map((leave) => ({
        "Employee Name": leave.employeeName,
        Department: getDepartmentLabel(leave.department),
        Designation: leave.designation,
        "Leave Type": leave.leaveType,
        "Start Date": formatDateISO(leave.startDate),
        "End Date": formatDateISO(leave.endDate),
        "Applied Days": leave.appliedDays,
        "Half Day": leave.isHalfDay ? "Yes" : "No",
        "Paid Leave": leave.isPaidLeave ? "Yes" : "No",
        Status: leave.status,
        Reason: leave.reason,
        "Review Notes": leave.reviewNotes ?? "",
        "Applied At": formatDateTime(leave.createdAt),
        "Reviewed At": formatDateTime(leave.reviewedAt),
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet["!cols"] = [
        { wch: 24 },
        { wch: 16 },
        { wch: 18 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 },
        { wch: 12 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 },
        { wch: 36 },
        { wch: 36 },
        { wch: 22 },
        { wch: 22 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Requests");

      const filename = `leave-requests-${formatDateISO(new Date())}.xlsx`;
      XLSX.writeFile(workbook, filename);

      toast({
        title: "Export Complete",
        description: `Exported ${rows.length} leave request(s) to Excel`,
      });
    } catch (error) {
      console.error("Failed to export leave requests:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export leave requests",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }, [filteredLeaves, getDepartmentLabel, toast]);

  const totalPages = Math.ceil(filteredLeaves.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLeaves = filteredLeaves.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const departmentOptions = useMemo(() => {
    const map = new Map<string, string>();

    departments.forEach((department) => {
      map.set(department.key, department.label);
    });

    leaves.forEach((leave) => {
      if (leave.department && !map.has(leave.department)) {
        map.set(leave.department, getDepartmentLabel(leave.department));
      }
    });

    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [departments, leaves, getDepartmentLabel]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600";
      case "REJECTED":
        return "text-red-600";
      case "PENDING":
        return "text-yellow-600";
      case "CANCELLED":
        return "text-gray-500";
      default:
        return "text-gray-600";
    }
  };

  const actionDisabled = loading || exporting || importing;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Leave Requests</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleDownloadImportTemplate}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={actionDisabled}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Download Import Template
          </Button>
          <Button
            onClick={handleImportExcel}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={actionDisabled}
          >
            <Upload className="h-4 w-4 mr-2" />
            {importing ? "Importing..." : "Import Excel"}
          </Button>
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={actionDisabled || filteredLeaves.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exporting..." : "Export Excel"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleImportFileSelected}
            disabled={actionDisabled}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Search by name or reason..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Departments</SelectItem>
            {departmentOptions.map((department) => (
              <SelectItem key={department.key} value={department.key}>
                {department.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-gray-600 flex items-center">
          Showing {startIndex + 1}-
          {Math.min(startIndex + ITEMS_PER_PAGE, filteredLeaves.length)} of{" "}
          {filteredLeaves.length}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading leave requests...</div>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedLeaves.map((leave) => (
            <div
              key={leave.id}
              className="border p-4 rounded bg-white shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{leave.employeeName}</h3>
                  <p className="text-sm text-gray-600">
                    {getDepartmentLabel(leave.department)} - {leave.designation}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">{leave.leaveType}</span> |
                    {new Date(leave.startDate).toLocaleDateString()} -{" "}
                    {new Date(leave.endDate).toLocaleDateString()} (
                    {leave.appliedDays} days)
                  </p>
                  <p className="text-sm mt-1 text-gray-700">{leave.reason}</p>
                  <p className="text-sm mt-2">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`font-semibold ${getStatusColor(leave.status)}`}
                    >
                      {leave.status}
                    </span>
                  </p>
                  {leave.reviewNotes && (
                    <p className="text-sm mt-1 text-gray-600">
                      <span className="font-medium">Notes:</span>{" "}
                      {leave.reviewNotes}
                    </p>
                  )}
                </div>
                {leave.status === "PENDING" && (
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/leaves/approve?id=${leave.id}`}
                      className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
                    >
                      Approve
                    </Link>
                    <Link
                      href={`/admin/leaves/reject?id=${leave.id}`}
                      className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
                    >
                      Reject
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
          {paginatedLeaves.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No leave requests found.
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex space-x-1">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, index) => {
              const startPage = Math.max(1, currentPage - 5);
              const pageNumber = startPage + index;
              return pageNumber <= totalPages ? pageNumber : null;
            })
              .filter(Boolean)
              .map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page as number)}
                >
                  {page}
                </Button>
              ))}
          </div>

          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

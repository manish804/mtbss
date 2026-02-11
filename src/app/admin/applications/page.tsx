"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Users } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { ApplicationFilters } from "./components/application-filters";
import { ApplicationList } from "./components/application-list";
import { ApplicationLoadingSkeleton } from "./components/application-loading-skeleton";
import { ApplicationErrorBoundary } from "./components/application-error-boundary";
import {
  ApplicationRetryHandler,
  useApplicationRetryHandler,
} from "./components/application-retry-handler";
import { ApplicationListItem } from "./components/application-card";

interface ApplicationsResponse {
  applications: ApplicationListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    availableJobs: { id: string; title: string }[];
    statusCounts: Record<string, number>;
  };
}

interface ApplicationFiltersState {
  search: string;
  jobId: string;
  status: string;
  dateFrom?: string;
  dateTo?: string;
  hasResume?: string;
  hasNotes?: string;
  experienceLevel?: string;
  sortBy: string;
  sortOrder: string;
}

export default function ApplicationsPage() {
  const { toast } = useToast();
  const { executeWithRetry } = useApplicationRetryHandler(3);
  const fetchingRef = useRef(false);
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [availableJobs, setAvailableJobs] = useState<
    { id: string; title: string }[]
  >([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState<ApplicationFiltersState>({
    search: "",
    jobId: "all",
    status: "all",
    dateFrom: undefined,
    dateTo: undefined,
    hasResume: undefined,
    hasNotes: undefined,
    experienceLevel: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const fetchApplications = useCallback(
    async (
      currentFilters: ApplicationFiltersState,
      page: number,
      limit: number
    ) => {
      if (fetchingRef.current) {
        return;
      }

      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      try {
        await executeWithRetry(async () => {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(currentFilters.search && { search: currentFilters.search }),
            ...(currentFilters.jobId !== "all" && {
              jobId: currentFilters.jobId,
            }),
            ...(currentFilters.status !== "all" && {
              status: currentFilters.status,
            }),
            ...(currentFilters.dateFrom && {
              dateFrom: currentFilters.dateFrom,
            }),
            ...(currentFilters.dateTo && { dateTo: currentFilters.dateTo }),
            ...(currentFilters.hasResume && {
              hasResume: currentFilters.hasResume,
            }),
            ...(currentFilters.hasNotes && {
              hasNotes: currentFilters.hasNotes,
            }),
            ...(currentFilters.experienceLevel && {
              experienceLevel: currentFilters.experienceLevel,
            }),
            sortBy: currentFilters.sortBy,
            sortOrder: currentFilters.sortOrder,
          });

          const response = await fetch(`/api/applications?${params}`);
          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              result.error ||
                `HTTP ${response.status}: Failed to fetch applications`
            );
          }

          const data: ApplicationsResponse = result.data;
          setApplications(
            Array.isArray(data.applications) ? data.applications : []
          );
          setPagination(
            data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 }
          );
          setAvailableJobs(
            Array.isArray(data.filters?.availableJobs)
              ? data.filters.availableJobs
              : []
          );
          setStatusCounts(data.filters?.statusCounts || {});
        });
      } catch (error) {
        const errorObj = error as Error;
        console.error("Error fetching applications:", errorObj);
        setError(errorObj);

        toast({
          title: "Failed to Load Applications",
          description:
            errorObj.message ||
            "Unable to fetch job applications. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
        fetchingRef.current = false;
      }
    },
    [toast, executeWithRetry]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchApplications(filters, pagination.page, pagination.limit);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [fetchApplications, filters, pagination.page, pagination.limit]);

  const handleFiltersChange = (newFilters: ApplicationFiltersState) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleDelete = async (applicationId: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete application");
      }

      setApplications((prevApplications) =>
        prevApplications.filter((app) => app.id !== applicationId)
      );
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));

      toast({
        title: "Application Deleted",
        description: "Job application has been permanently deleted.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting application:", error);
      toast({
        title: "Failed to Delete Application",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusChange = async (
    applicationIds: string[],
    status: string
  ) => {
    try {
      const response = await fetch("/api/applications/bulk", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationIds,
          action: "updateStatus",
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update application status");
      }

      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          applicationIds.includes(app.id) ? { ...app, status } : app
        )
      );

      toast({
        title: "Applications Updated",
        description: `${applicationIds.length} application(s) status updated to ${status}.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Failed to Update Status",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async (applicationIds: string[]) => {
    try {
      const response = await fetch("/api/applications/bulk", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applicationIds }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete applications");
      }

      setApplications((prevApplications) =>
        prevApplications.filter((app) => !applicationIds.includes(app.id))
      );
      setPagination((prev) => ({
        ...prev,
        total: prev.total - applicationIds.length,
      }));

      toast({
        title: "Applications Deleted",
        description: `${applicationIds.length} application(s) have been permanently deleted.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting applications:", error);
      toast({
        title: "Failed to Delete Applications",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Application Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage job applications and candidate information
            </p>
          </div>
        </div>

        <ApplicationRetryHandler
          onRetry={() =>
            fetchApplications(filters, pagination.page, pagination.limit)
          }
          error={error}
          title="Failed to Load Applications"
          description="Unable to fetch job applications. Please try again."
          variant="inline"
        />
      </div>
    );
  }

  return (
    <ApplicationErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Application Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage job applications and candidate information
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>
              {pagination.total} total application
              {pagination.total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {loading ? (
          <ApplicationLoadingSkeleton variant="filters" />
        ) : (
          <ApplicationFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableJobs={availableJobs}
            statusCounts={statusCounts}
            isLoading={loading}
          />
        )}

        {loading ? (
          <ApplicationLoadingSkeleton variant="card" count={pagination.limit} />
        ) : (
          <ApplicationList
            applications={applications}
            totalApplications={pagination.total}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onDelete={handleDelete}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkDelete={handleBulkDelete}
            isLoading={loading}
          />
        )}
      </div>
    </ApplicationErrorBoundary>
  );
}

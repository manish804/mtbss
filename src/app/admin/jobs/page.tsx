"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { JobFiltersComponent, JobFilters } from "./components/job-filters";
import { JobList } from "./components/job-list";
import { JobErrorBoundary } from "./components/job-error-boundary";
import { JobLoadingSkeleton } from "./components/job-loading-skeleton";
import { RetryHandler, useRetryHandler } from "./components/retry-handler";
import { JobListItem } from "@/lib/validation/job-schemas";

interface JobsResponse {
  jobs: JobListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function JobsPage() {
  const { toast } = useToast();
  const { executeWithRetry } = useRetryHandler(3);
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [filters, setFilters] = useState<JobFilters>({
    search: "",
    department: "all",
    location: "all",
    type: "all",
    experience: "all",
    active: "all",
    sortBy: "postedDate",
    sortOrder: "desc",
  });

  const fetchJobs = useCallback(
    async (currentFilters: JobFilters, page: number, limit: number) => {
      setLoading(true);
      setError(null);

      try {
        await executeWithRetry(async () => {
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(currentFilters.search && { search: currentFilters.search }),
            ...(currentFilters.department !== "all" && {
              department: currentFilters.department,
            }),
            ...(currentFilters.location !== "all" && {
              location: currentFilters.location,
            }),
            ...(currentFilters.type !== "all" && { type: currentFilters.type }),
            ...(currentFilters.experience !== "all" && {
              experience: currentFilters.experience,
            }),
            ...(currentFilters.active !== "all" && {
              active: currentFilters.active,
            }),
            sortBy: currentFilters.sortBy,
            sortOrder: currentFilters.sortOrder,
          });

          const response = await fetch(`/api/jobs?${params}`);
          const result = await response.json();

          if (!response.ok) {
            throw new Error(
              result.error || `HTTP ${response.status}: Failed to fetch jobs`
            );
          }

          const data: JobsResponse = result.data;
          setJobs(data.jobs || []);
          setPagination(data.pagination);

          const uniqueDepartments = [
            ...new Set(data.jobs.map((job) => job.department)),
          ].sort();
          const uniqueLocations = [
            ...new Set(data.jobs.map((job) => job.location)),
          ].sort();
          setDepartments(uniqueDepartments);
          setLocations(uniqueLocations);
        });
      } catch (error) {
        const errorObj = error as Error;
        console.error("Error fetching jobs:", errorObj);
        setError(errorObj);

        toast({
          title: "Failed to Load Jobs",
          description:
            errorObj.message ||
            "Unable to fetch job listings. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast, executeWithRetry]
  );

  useEffect(() => {
    fetchJobs(filters, pagination.page, pagination.limit);
  }, [filters, pagination.page, pagination.limit, fetchJobs]);

  const handleFiltersChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (limit: number) => {
    setPagination((prev) => ({ ...prev, limit, page: 1 }));
  };

  const handleStatusToggle = async (jobId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update job status");
      }

      setJobs((prevJobs) =>
        prevJobs.map((job) => (job.id === jobId ? { ...job, isActive } : job))
      );

      toast({
        title: "Job Status Updated",
        description: `Job ${
          isActive ? "activated" : "deactivated"
        } successfully.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating job status:", error);
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

  const handleDelete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}?force=true`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete job");
      }

      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));

      toast({
        title: "Job Deleted",
        description: "Job opening has been permanently deleted.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Failed to Delete Job",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusChange = async (
    jobIds: string[],
    isActive: boolean
  ) => {
    const promises = jobIds.map(async (jobId) => {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || `Failed to update job ${jobId}`);
      }

      return response.json();
    });

    try {
      await Promise.all(promises);

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          jobIds.includes(job.id) ? { ...job, isActive } : job
        )
      );
    } catch (error) {
      console.error("Error in bulk status change:", error);
      throw error;
    }
  };

  const handleBulkDelete = async (jobIds: string[]) => {
    const promises = jobIds.map(async (jobId) => {
      const response = await fetch(`/api/jobs/${jobId}?force=true`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || `Failed to delete job ${jobId}`);
      }

      return response.json();
    });

    try {
      await Promise.all(promises);

      setJobs((prevJobs) => prevJobs.filter((job) => !jobIds.includes(job.id)));
      setPagination((prev) => ({ ...prev, total: prev.total - jobIds.length }));
    } catch (error) {
      console.error("Error in bulk delete:", error);
      throw error;
    }
  };

  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
            <p className="text-gray-600 mt-1">
              Manage job openings and applications
            </p>
          </div>
          <Button asChild className="w-fit">
            <Link href="/admin/jobs/create">
              <Plus className="h-4 w-4 mr-2" />
              Add New Job
            </Link>
          </Button>
        </div>

        <RetryHandler
          onRetry={() => fetchJobs(filters, pagination.page, pagination.limit)}
          error={error}
          title="Failed to Load Jobs"
          description="Unable to fetch job listings. Please try again."
          variant="inline"
        />
      </div>
    );
  }

  return (
    <JobErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
            <p className="text-gray-600 mt-1">
              Manage job openings and applications
            </p>
          </div>
          <Button asChild className="w-fit">
            <Link href="/admin/jobs/create">
              <Plus className="h-4 w-4 mr-2" />
              Add New Job
            </Link>
          </Button>
        </div>

        {loading ? (
          <JobLoadingSkeleton variant="filters" />
        ) : (
          <JobFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            departments={departments}
            locations={locations}
            isLoading={loading}
          />
        )}

        {loading ? (
          <JobLoadingSkeleton variant="card" count={pagination.limit} />
        ) : (
          <JobList
            jobs={jobs}
            totalJobs={pagination.total}
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.limit}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onStatusToggle={handleStatusToggle}
            onDelete={handleDelete}
            onBulkStatusChange={handleBulkStatusChange}
            onBulkDelete={handleBulkDelete}
            isLoading={loading}
          />
        )}
      </div>
    </JobErrorBoundary>
  );
}

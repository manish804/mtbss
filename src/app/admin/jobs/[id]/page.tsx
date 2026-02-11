"use client";

import { useState, useEffect, use, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { JobErrorBoundary } from "../components/job-error-boundary";
import { JobLoadingSkeleton } from "../components/job-loading-skeleton";
import { RetryHandler, useRetryHandler } from "../components/retry-handler";

// Lazy load components for better performance
import { JobHeader } from "./components/job-header";
import { JobInfo } from "./components/job-info";
import { JobSidebar } from "./components/job-sidebar";
import { DeleteDialog } from "./components/delete-dialog";

interface JobDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary?: string;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  benefits?: string[];
  isActive: boolean;
  postedDate: string;
  updatedAt: string;
  applicationDeadline?: string;
  _count?: { applications: number };
  company?: {
    name: string;
    logo?: string;
    website?: string;
  };
}

export default function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { executeWithRetry } = useRetryHandler(3);

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Memoize job data for header and sidebar
  const headerData = useMemo(() => {
    if (!job) return null;
    return {
      id: job.id,
      title: job.title,
      department: job.department,
      location: job.location,
      isActive: job.isActive,
    };
  }, [job]);

  const sidebarData = useMemo(() => {
    if (!job) return null;
    return {
      id: job.id,
      isActive: job.isActive,
      postedDate: job.postedDate,
      updatedAt: job.updatedAt,
      applicationDeadline: job.applicationDeadline,
      _count: job._count,
      company: job.company,
    };
  }, [job]);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await executeWithRetry(async () => {
        const response = await fetch(`/api/jobs/${id}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || `HTTP ${response.status}: Failed to fetch job`
          );
        }

        setJob(result.data);
      });
    } catch (error) {
      const errorObj = error as Error;
      console.error("Error fetching job:", errorObj);
      setError(errorObj);

      toast({
        title: "Failed to Load Job",
        description:
          errorObj.message || "Unable to fetch job details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [id, executeWithRetry, toast]);

  const handleStatusToggle = useCallback(async () => {
    if (!job) return;

    setIsToggling(true);
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !job.isActive }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update job status");
      }

      setJob(result.data);
      toast({
        title: "Job Status Updated",
        description: `Job ${
          !job.isActive ? "activated" : "deactivated"
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
    } finally {
      setIsToggling(false);
    }
  }, [job, id, toast]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/jobs/${id}?force=true`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete job");
      }

      toast({
        title: "Job Deleted",
        description: "Job opening has been permanently deleted.",
        variant: "default",
      });

      router.push("/admin/jobs");
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
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }, [id, toast, router]);

  const handleDeleteClick = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
            <p className="text-gray-600 mt-1">Loading job information...</p>
          </div>
        </div>
        <JobLoadingSkeleton variant="details" />
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
          </div>
        </div>
        <RetryHandler
          onRetry={fetchJob}
          error={error}
          title="Failed to Load Job Details"
          description="Unable to fetch job information. Please try again."
          variant="inline"
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Not Found</h1>
          </div>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Job Not Found
            </h3>
            <p className="text-gray-600 text-center mb-6">
              The job you&apos;re looking for doesn&apos;t exist or may have
              been deleted.
            </p>
            <Button asChild>
              <Link href="/admin/jobs">Back to Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <JobErrorBoundary>
      <div className="space-y-6">
        {headerData && (
          <JobHeader job={headerData} onDelete={handleDeleteClick} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <JobInfo job={job} />
          </div>
          <div>
            {sidebarData && (
              <JobSidebar
                job={sidebarData}
                isToggling={isToggling}
                onStatusToggle={handleStatusToggle}
              />
            )}
          </div>
        </div>
      </div>

      <DeleteDialog
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDelete}
        jobTitle={job.title}
        applicationCount={job._count?.applications}
        isDeleting={isDeleting}
      />
    </JobErrorBoundary>
  );
}

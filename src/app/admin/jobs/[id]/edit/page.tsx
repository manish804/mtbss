"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { JobForm } from "../../components/job-form";
import { JobErrorBoundary } from "../../components/job-error-boundary";
import { JobLoadingSkeleton } from "../../components/job-loading-skeleton";
import { RetryHandler, useRetryHandler } from "../../components/retry-handler";
import { JobFormData } from "@/lib/validation/job-schemas";

interface JobEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface EditableJob {
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary?: string | null;
  description: string;
  requirements?: string[];
  responsibilities?: string[];
  skills?: string[];
  benefits?: string[];
  applicationDeadline?: string | Date | null;
  isActive?: boolean;
}

export default function JobEditPage({ params }: JobEditPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { executeWithRetry } = useRetryHandler(3);
  const [job, setJob] = useState<EditableJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchJob = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await executeWithRetry(async () => {
        const response = await fetch(`/api/jobs/${resolvedParams.id}`);
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
  }, [executeWithRetry, resolvedParams.id, toast]);

  useEffect(() => {
    void fetchJob();
  }, [fetchJob]);

  const handleSubmit = async (data: JobFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/jobs/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update job");
      }

      toast({
        title: "Job Updated Successfully!",
        description: `${data.title} has been updated.`,
        variant: "default",
      });

      router.push("/admin/jobs");
    } catch (error) {
      console.error("Error updating job:", error);

      toast({
        title: "Failed to Update Job",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/jobs");
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
            <p className="text-gray-600 mt-1">Loading job details...</p>
          </div>
        </div>

        <JobLoadingSkeleton variant="form" />
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
            <h1 className="text-3xl font-bold text-gray-900">Edit Job</h1>
          </div>
        </div>

        <RetryHandler
          onRetry={fetchJob}
          error={error}
          title="Failed to Load Job"
          description="Unable to fetch job details for editing. Please try again."
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
            <p className="text-gray-600 mt-1">
              The requested job could not be found.
            </p>
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

  const initialData: Partial<JobFormData> = {
    title: job.title,
    department: job.department,
    location: job.location,
    type: job.type as JobFormData["type"],
    experience: job.experience,
    salary: job.salary || "",
    description: job.description,
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    responsibilities: Array.isArray(job.responsibilities)
      ? job.responsibilities
      : [],
    skills: Array.isArray(job.skills) ? job.skills : [],
    benefits: Array.isArray(job.benefits) ? job.benefits : [],
    applicationDeadline: job.applicationDeadline
      ? new Date(job.applicationDeadline)
      : undefined,
    isActive: job.isActive,
  };

  return (
    <JobErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/jobs">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Jobs
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/jobs/${resolvedParams.id}`}>View Job</Link>
            </Button>
          </div>
        </div>

        <div className="max-w-4xl">
          <JobForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
            submitLabel="Update Job"
            showCancel={true}
          />
        </div>
      </div>
    </JobErrorBoundary>
  );
}

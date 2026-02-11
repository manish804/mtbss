"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { JobForm } from "../components/job-form";
import { JobErrorBoundary } from "../components/job-error-boundary";
import { useRetryHandler } from "../components/retry-handler";
import { JobFormData } from "@/lib/validation/job-schemas";

export default function CreateJobPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { executeWithRetry } = useRetryHandler(2);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: JobFormData) => {
    setIsLoading(true);

    try {
      await executeWithRetry(async () => {
        const response = await fetch("/api/jobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || `HTTP ${response.status}: Failed to create job`
          );
        }

        return result;
      });

      toast({
        title: "Job Created Successfully!",
        description: `${data.title} has been created and is ${
          data.isActive ? "active" : "inactive"
        }.`,
        variant: "default",
      });

      router.push("/admin/jobs");
    } catch (error) {
      console.error("Error creating job:", error);

      toast({
        title: "Failed to Create Job",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/jobs");
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create New Job
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-4xl">
          <JobForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
            submitLabel="Create Job"
            showCancel={true}
          />
        </div>
      </div>
    </JobErrorBoundary>
  );
}

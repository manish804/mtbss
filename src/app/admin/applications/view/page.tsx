"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ApplicationDetail } from "../components/application-detail";
import {
  StatusSelector,
  JobApplicationStatus,
} from "../components/status-selector";
import { ReviewNotes } from "../components/review-notes";
import { ApplicationLoadingSkeleton } from "../components/application-loading-skeleton";
import { ApplicationErrorBoundary } from "../components/application-error-boundary";
import {
  ApplicationRetryHandler,
  useApplicationRetryHandler,
} from "../components/application-retry-handler";

interface ApplicationDetailData {
  id: string;
  jobId: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  linkedinProfile?: string;
  portfolioWebsite?: string;
  currentCompany?: string;
  currentPosition?: string;
  experienceYears?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  availableStartDate?: Date;
  coverLetter?: string;
  additionalInfo?: string;
  skills?: unknown;
  education?: unknown;
  certifications?: unknown;
  references?: unknown;
  portfolioFiles?: unknown;
  willingToRelocate: boolean;
  remoteWork: boolean;
  travelAvailability: boolean;
  visaSponsorship: boolean;
  backgroundCheck: boolean;
  termsAccepted: boolean;
  status: JobApplicationStatus;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  reviewedAt?: Date;
  resumeUrl?: string;
  job: {
    title: string;
    department: string;
    location: string;
    type: string;
  };
}

interface ApplicationDetailResponse {
  application: Omit<
    ApplicationDetailData,
    "createdAt" | "updatedAt" | "reviewedAt" | "availableStartDate"
  > & {
    createdAt: string;
    updatedAt: string;
    reviewedAt?: string;
    availableStartDate?: string;
  };
}

export default function ApplicationViewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { executeWithRetry } = useApplicationRetryHandler(3);

  const applicationId = searchParams.get('id');
  const [application, setApplication] = useState<ApplicationDetailData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchApplication = useCallback(async () => {
    if (!applicationId) {
      toast({
        title: "Error",
        description: "No application ID provided",
        variant: "destructive",
      });
      router.push("/admin/applications");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await executeWithRetry(async () => {
        const response = await fetch(`/api/applications/${applicationId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error ||
              `HTTP ${response.status}: Failed to fetch application`
          );
        }

        const data: ApplicationDetailResponse = result.data;

        const application = {
          ...data.application,
          createdAt: new Date(data.application.createdAt),
          updatedAt: new Date(data.application.updatedAt),
          reviewedAt: data.application.reviewedAt
            ? new Date(data.application.reviewedAt)
            : undefined,
          availableStartDate: data.application.availableStartDate
            ? new Date(data.application.availableStartDate)
            : undefined,
        };

        setApplication(application);
      });
    } catch (error) {
      const errorObj = error as Error;
      console.error("Error fetching application:", errorObj);
      setError(errorObj);

      toast({
        title: "Failed to Load Application",
        description:
          errorObj.message ||
          "Unable to fetch application details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [applicationId, toast, router, executeWithRetry]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleStatusChange = async (
    applicationId: string,
    status: JobApplicationStatus
  ) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update application status");
      }

      setApplication((prev) =>
        prev
          ? {
              ...prev,
              status,
              reviewedAt: new Date(),
            }
          : null
      );

      toast({
        title: "Status Updated",
        description: `Application status updated successfully.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  const handleNotesChange = async (applicationId: string, notes: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviewNotes: notes }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update review notes");
      }

      setApplication((prev) =>
        prev
          ? {
              ...prev,
              reviewNotes: notes,
              reviewedAt: new Date(),
            }
          : null
      );

      toast({
        title: "Notes Saved",
        description: "Review notes have been saved successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating notes:", error);
      throw error;
    }
  };

  if (error && !loading) {
    return (
      <ApplicationErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/applications">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Application Details
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage application information
              </p>
            </div>
          </div>

          <ApplicationRetryHandler
            onRetry={fetchApplication}
            error={error}
            title="Failed to Load Application"
            description="Unable to fetch application details. Please try again."
            variant="inline"
          />
        </div>
      </ApplicationErrorBoundary>
    );
  }

  if (loading) {
    return (
      <ApplicationErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/applications">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-lg font-semibold">
                Loading application...
              </span>
            </div>
          </div>

          <ApplicationLoadingSkeleton variant="details" />
        </div>
      </ApplicationErrorBoundary>
    );
  }

  if (!application) {
    return (
      <ApplicationErrorBoundary>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/applications">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Application Not Found
              </h1>
              <p className="text-gray-600 mt-1">
                The requested application could not be found.
              </p>
            </div>
          </div>

          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              The application you&apos;re looking for doesn&apos;t exist or may
              have been
              deleted.
            </p>
            <Button asChild>
              <Link href="/admin/applications">Return to Applications</Link>
            </Button>
          </div>
        </div>
      </ApplicationErrorBoundary>
    );
  }

  return (
    <ApplicationErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/applications">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Applications
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {application.firstName} {application.lastName}
              </h1>
              <p className="text-gray-600 mt-1">
                Application for {application.job.title}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ApplicationDetail application={application} />
          </div>

          <div className="space-y-6">
            <StatusSelector
              applicationId={application.id}
              currentStatus={application.status}
              onStatusChange={handleStatusChange}
              variant="default"
              size="md"
            />

            <ReviewNotes
              applicationId={application.id}
              initialNotes={application.reviewNotes || ""}
              lastUpdated={application.reviewedAt}
              onNotesChange={handleNotesChange}
              maxLength={2000}
              autoSaveDelay={2000}
            />
          </div>
        </div>
      </div>
    </ApplicationErrorBoundary>
  );
}

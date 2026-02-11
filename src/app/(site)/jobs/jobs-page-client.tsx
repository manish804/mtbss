"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ErrorBoundary,
  JobsErrorFallback,
} from "@/components/ui/error-boundary";
import {
  JobsHeroSkeleton,
  JobListingsSkeleton,
} from "@/components/ui/loading-skeleton";
import {
  useJobsData,
  useDepartmentLabel,
} from "@/hooks/use-jobs-data";
import { JobListings } from "@/components/jobs/job-listings";
import { BenefitsCultureSection } from "@/components/jobs/benefits-culture-section";
import { JobsCtaSection } from "@/components/jobs/jobs-cta-section";
import { MapPin, Briefcase, AlertTriangle, RefreshCw } from "lucide-react";
import type { PageContent } from "@/lib/types/page";
import type { DatabaseJob } from "@/lib/types/jobs";

interface JobsPageClientProps {
  companyName: string | null;
  pageContent: PageContent | null;
  initialJobs: DatabaseJob[];
}

export default function JobsPageClient({
  companyName,
  pageContent,
  initialJobs,
}: JobsPageClientProps) {
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const {
    jobs: filteredJobs,
    departments,
    jobCounts,
    isLoading: jobsLoading,
    error: jobsError,
    jobCount,
    totalJobs,
    retry: retryJobs,
  } = useJobsData({
    department: selectedDepartment,
    initialJobs,
  });

  const selectedDepartmentLabel = useDepartmentLabel(selectedDepartment);

  // Use dynamic departments from page content if available, fallback to hook data
  const displayDepartments =
    (pageContent?.departments as Array<{ key: string; label: string }> | undefined) ||
    departments;

  if (jobsError && jobsError.toLowerCase().includes("not found")) {
    return (
      <main role="main" aria-label="Jobs and careers page">
        <div className="container mx-auto px-4 md:px-6 py-16">
          <div
            className="flex flex-col items-center justify-center min-h-[400px] text-center"
            role="alert"
            aria-labelledby="critical-error-title"
          >
            <div
              className="bg-destructive/10 rounded-full p-4 mb-6"
              aria-hidden="true"
            >
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>

            <h1 id="critical-error-title" className="text-2xl font-bold mb-4">
              Jobs Page Unavailable
            </h1>

            <p className="text-muted-foreground mb-6 max-w-md">
              We&apos;re having trouble loading the jobs page right now. Please
              try
              again later or contact support if the problem persists.
            </p>

            <Button onClick={retryJobs} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main role="main" aria-label="Jobs and careers page">
      <section
        className="relative overflow-hidden py-16 md:py-20"
        aria-labelledby="hero-heading"
      >
        <div
          className="absolute inset-0 bg-gradient-to-br from-accent/45 via-background to-background"
          aria-hidden="true"
        ></div>
        <div
          className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/10 to-transparent"
          aria-hidden="true"
        ></div>

        <div className="relative container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-4xl text-center">
            {jobsLoading ? (
              <JobsHeroSkeleton />
            ) : (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1
                    id="hero-heading"
                    className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline tracking-tight"
                  >
                    {pageContent?.hero?.title || "Join Our Growing Team"}
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    {pageContent?.hero?.subtitle ||
                      `Build your career with ${
                        companyName || "us"
                      } and help revolutionize tax management and financial services for businesses and individuals.`}
                  </p>
                  {pageContent?.hero?.description && (
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      {pageContent.hero.description}
                    </p>
                  )}
                </div>

                {pageContent?.jobStats?.enabled !== false && (
                  <div
                    className="flex flex-col sm:flex-row items-center justify-center gap-6 text-center"
                    role="region"
                    aria-label="Job statistics"
                  >
                    {pageContent?.jobStats?.showOpenPositions !== false && (
                      <div className="flex items-center gap-3 min-h-[48px]">
                        <div
                          className="bg-primary/10 rounded-full p-3"
                          aria-hidden="true"
                        >
                          <Briefcase className="h-5 w-5 text-primary" />
                        </div>
                        <span
                          className="text-lg font-medium"
                          aria-label={`${totalJobs} open positions available`}
                        >
                          {totalJobs} Open Position{totalJobs !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    {pageContent?.jobStats?.showOpenPositions !== false &&
                      pageContent?.jobStats?.showRemoteOptions !== false && (
                        <div
                          className="hidden sm:block w-px h-6 bg-border"
                          aria-hidden="true"
                        ></div>
                      )}
                    {pageContent?.jobStats?.showRemoteOptions !== false && (
                      <div className="flex items-center gap-3 min-h-[48px]">
                        <div
                          className="bg-primary/10 rounded-full p-3"
                          aria-hidden="true"
                        >
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-lg font-medium">
                          Remote & Hybrid Options
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center">
                  <Button asChild size="lg" className="rounded-full px-6">
                    <a href="#available-positions">View Open Roles</a>
                  </Button>
                </div>

                {pageContent?.departmentFilters?.enabled !== false && (
                  <div
                    className="space-y-4"
                    role="region"
                    aria-labelledby="filter-heading"
                  >
                    <h2 id="filter-heading" className="text-lg font-semibold">
                      {pageContent?.departmentFilters?.title ||
                        "Filter by Department"}
                    </h2>
                    <div
                      className="flex flex-nowrap justify-start gap-3 overflow-x-auto px-2 pb-2 md:flex-wrap md:justify-center md:overflow-visible"
                      role="group"
                      aria-label="Department filter buttons"
                    >
                      {displayDepartments.map(
                        (department: { key: string; label: string }) => {
                          const departmentJobCount =
                            jobCounts[department.key] || 0;
                          const isActive =
                            selectedDepartment === department.key;
                          const isCountLoading =
                            jobsLoading && !jobCounts[department.key];

                          return (
                            <Button
                              key={department.key}
                              variant={isActive ? "default" : "outline"}
                              size="sm"
                              onClick={() =>
                                setSelectedDepartment(department.key)
                              }
                              disabled={isCountLoading}
                              className={`transition-all duration-200 min-h-[44px] px-4 py-2 ${
                                isActive
                                  ? "shadow-md whitespace-nowrap"
                                  : "hover:shadow-sm hover:border-primary/50"
                              }`}
                              aria-pressed={isActive}
                              aria-label={`Filter jobs by ${department.label}, ${departmentJobCount} positions available`}
                            >
                              <span className="sr-only">
                                {isActive ? "Currently showing" : "Show"} jobs
                                in {department.label}
                              </span>
                              {department.label}
                              <Badge
                                variant={isActive ? "secondary" : "outline"}
                                className="ml-2 text-xs"
                                aria-hidden="true"
                              >
                                {isCountLoading ? "..." : departmentJobCount}
                              </Badge>
                            </Button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                <div
                  className="inline-block rounded-full border bg-card/70 px-5 py-3 backdrop-blur-sm"
                  role="status"
                  aria-live="polite"
                  aria-label="Job count information"
                >
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {jobCount}
                    </span>
                    {selectedDepartment !== "all" && <> of {totalJobs}</>} job
                    {jobCount !== 1 ? "s" : ""}
                    {selectedDepartment !== "all" && (
                      <span className="text-primary font-medium">
                        {" "}
                        in {selectedDepartmentLabel}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="absolute top-20 left-10 w-20 h-20 bg-primary/5 rounded-full blur-xl"
          aria-hidden="true"
        ></div>
        <div
          className="absolute bottom-20 right-10 w-32 h-32 bg-primary/5 rounded-full blur-xl"
          aria-hidden="true"
        ></div>
      </section>

      <section
        id="available-positions"
        className="py-10 md:py-12"
        aria-labelledby="positions-heading"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-12">
              <h2
                id="positions-heading"
                className="text-2xl md:text-3xl font-bold"
              >
                {pageContent?.jobListings?.title || "Available Positions"}
              </h2>
              <p className="text-muted-foreground">
                {pageContent?.jobListings?.subtitle ||
                  "Explore our current job openings and find your next career opportunity"}
              </p>
            </div>

            <ErrorBoundary fallback={JobsErrorFallback}>
              {jobsLoading ? (
                <JobListingsSkeleton count={3} />
              ) : jobsError ? (
                <div
                  className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center bg-card/50 rounded-lg border"
                  role="alert"
                  aria-labelledby="jobs-error-title"
                >
                  <div
                    className="bg-destructive/10 rounded-full p-3 mb-4"
                    aria-hidden="true"
                  >
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>

                  <h3
                    id="jobs-error-title"
                    className="text-lg font-semibold mb-2"
                  >
                    Unable to Load Job Listings
                  </h3>

                  <p className="text-muted-foreground mb-4 max-w-sm">
                    {jobsError ||
                      "We're having trouble loading the job listings right now."}
                  </p>

                  <Button
                    onClick={retryJobs}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                </div>
              ) : (
                <JobListings
                  jobs={filteredJobs}
                  selectedDepartment={selectedDepartment}
                />
              )}
            </ErrorBoundary>
          </div>
        </div>
      </section>

      <ErrorBoundary>
        <BenefitsCultureSection
          benefits={pageContent?.benefitsList}
          culture={pageContent?.companyCultureList}
          config={pageContent?.benefits}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <JobsCtaSection config={pageContent?.callToAction} />
      </ErrorBoundary>
    </main>
  );
}

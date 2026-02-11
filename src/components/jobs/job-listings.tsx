"use client";

import { JobContent } from "@/lib/content-types";
import { JobCard } from "./job-card";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AlertTriangle } from "lucide-react";
import type { DatabaseJob } from "@/lib/types/jobs";

interface JobListingsProps {
  jobs: DatabaseJob[];
  selectedDepartment: string;
}

function mapDatabaseJobToJobContent(dbJob: DatabaseJob): JobContent {
  return {
    id: dbJob.id,
    type: "job" as const,
    title: dbJob.title,
    department: dbJob.department,
    location: dbJob.location,
    jobType: dbJob.type,
    experience: dbJob.experience,
    description: dbJob.description,
    responsibilities: Array.isArray(dbJob.responsibilities)
      ? dbJob.responsibilities
      : [],
    requirements: Array.isArray(dbJob.requirements) ? dbJob.requirements : [],
    salaryRange: dbJob.salary,
    benefits: Array.isArray(dbJob.benefits) ? dbJob.benefits : [],
    published: dbJob.isActive,
    lastModified: dbJob.postedDate,
  };
}

export function JobListings({ jobs, selectedDepartment }: JobListingsProps) {
  if (!Array.isArray(jobs)) {
    return (
      <div
        className="text-center py-12"
        role="alert"
        aria-labelledby="invalid-data-title"
      >
        <div className="max-w-md mx-auto space-y-4">
          <div
            className="bg-destructive/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto"
            aria-hidden="true"
          >
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <h3
            id="invalid-data-title"
            className="text-lg font-semibold text-foreground"
          >
            Invalid Job Data
          </h3>
          <p className="text-muted-foreground">
            There was a problem loading the job listings. Please refresh the
            page or try again later.
          </p>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div
        className="text-center py-12"
        role="region"
        aria-label="No jobs found"
      >
        <div className="max-w-md mx-auto space-y-4">
          <div
            className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto"
            aria-hidden="true"
          >
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M8 6v10a2 2 0 002 2h4a2 2 0 002-2V6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            No Jobs Found
          </h3>
          <p className="text-muted-foreground">
            {selectedDepartment === "all"
              ? "We don't have any open positions at the moment. Check back soon!"
              : `No positions available in the selected department. Try viewing all departments or check back later.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-2 md:px-4"
      role="list"
      aria-label={`${jobs.length} job listings`}
    >
      {jobs.map((job, index) => {
        if (!job || !job.id) {
          console.warn(`Invalid job data at index ${index}:`, job);
          return (
            <div
              key={`invalid-${index}`}
              className="bg-card border rounded-lg p-6 text-center"
              role="alert"
            >
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">
                  Unable to display this job listing
                </span>
              </div>
            </div>
          );
        }

        const jobContent = mapDatabaseJobToJobContent(job);

        return (
          <div key={job.id} role="listitem" className="h-fit">
            <ErrorBoundary
              fallback={({ resetError }) => (
                <div
                  className="bg-card border rounded-lg p-6 text-center"
                  role="alert"
                >
                  <div className="flex flex-col items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <div>
                      <p className="text-sm font-medium">Error loading job</p>
                      <p className="text-xs text-muted-foreground">
                        {job.title || "Unknown position"}
                      </p>
                    </div>
                    <button
                      onClick={resetError}
                      className="text-xs text-primary hover:underline"
                    >
                      Try again
                    </button>
                  </div>
                </div>
              )}
            >
              <JobCard job={jobContent} />
            </ErrorBoundary>
          </div>
        );
      })}
    </section>
  );
}

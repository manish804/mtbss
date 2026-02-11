"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { JobContent } from "@/lib/content-types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  MapPin,
  Briefcase,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Users,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  applyJobCardStyling,
  applyBadgeStyling,
  validateStyling,
} from "@/lib/styling-utils";

const JobApplicationModal = dynamic(
  () =>
    import("@/components/jobs/job-application-modal").then(
      (mod) => mod.JobApplicationModal
    ),
  { ssr: false }
);

interface JobCardProps {
  job: JobContent;
  className?: string;
}

export function JobCard({ job, className }: JobCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  if (!job) {
    throw new Error("Job data is required");
  }

  const safeJob = {
    id: job.id || "unknown",
    title: job.title || "Position Title Not Available",
    department: job.department || "general",
    location: job.location || "Location TBD",
    jobType: job.jobType || "Full-time",
    experience: job.experience || "Experience level not specified",
    description: job.description || "Job description not available.",
    responsibilities: Array.isArray(job.responsibilities)
      ? job.responsibilities
      : [],
    requirements: Array.isArray(job.requirements) ? job.requirements : [],
    salaryRange: job.salaryRange || null,
    benefits: Array.isArray(job.benefits) ? job.benefits : [],
  };

  if (job.styling) {
    const validation = validateStyling(job.styling);
    if (!validation.isValid) {
      console.warn(`Invalid styling for job ${job.id}:`, validation.errors);
    }
  }

  const { cardClasses, buttonClasses } = applyJobCardStyling(
    job.styling,
    "transition-all duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-primary/20"
  );

  const departmentBadgeClasses = applyBadgeStyling(
    safeJob.department,
    job.styling?.badgeStyle
  );

  return (
    <Card
      className={cn(cardClasses, className)}
      role="article"
      aria-labelledby={`job-title-${safeJob.id}`}
    >
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h3
              id={`job-title-${safeJob.id}`}
              className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
            >
              {safeJob.title}
            </h3>
            <Badge
              variant="outline"
              className={departmentBadgeClasses}
              aria-label={`Department: ${safeJob.department}`}
            >
              {safeJob.department.charAt(0).toUpperCase() +
                safeJob.department.slice(1)}
            </Badge>
          </div>

          {safeJob.salaryRange && (
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground min-h-[44px] sm:min-h-auto">
              {/* <DollarSign className="h-4 w-4" aria-hidden="true" /> */}
              <span aria-label={`Salary range: ${safeJob.salaryRange}`}>
                {safeJob.salaryRange}
              </span>
            </div>
          )}
        </div>

        <div
          className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
          role="list"
          aria-label="Job details"
        >
          <div
            className="flex items-center gap-2 min-h-[44px] sm:min-h-auto"
            role="listitem"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span aria-label={`Location: ${safeJob.location}`}>
              {safeJob.location}
            </span>
          </div>
          <div
            className="flex items-center gap-2 min-h-[44px] sm:min-h-auto"
            role="listitem"
          >
            <Briefcase className="h-4 w-4" aria-hidden="true" />
            <span aria-label={`Job type: ${safeJob.jobType}`}>
              {safeJob.jobType}
            </span>
          </div>
          <div
            className="flex items-center gap-2 min-h-[44px] sm:min-h-auto"
            role="listitem"
          >
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span aria-label={`Experience level: ${safeJob.experience}`}>
              {safeJob.experience}
            </span>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          {safeJob.description}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-center gap-2 mb-4 hover:bg-muted/50 min-h-[44px] px-4 py-2"
          aria-expanded={isExpanded}
          aria-controls={`job-details-${safeJob.id}`}
          aria-label={
            isExpanded
              ? `Hide details for ${safeJob.title}`
              : `Show details for ${safeJob.title}`
          }
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" aria-hidden="true" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
              View Details
            </>
          )}
        </Button>

        {isExpanded && (
          <div
            id={`job-details-${safeJob.id}`}
            className="space-y-6 border-t pt-6"
            role="region"
            aria-label={`Detailed information for ${safeJob.title}`}
          >
            {safeJob.responsibilities.length > 0 ? (
              <div className="space-y-3">
                <h4
                  className="font-semibold text-foreground flex items-center gap-2"
                  id={`responsibilities-${safeJob.id}`}
                >
                  <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                  Key Responsibilities
                </h4>
                <ul
                  className="space-y-2"
                  role="list"
                  aria-labelledby={`responsibilities-${safeJob.id}`}
                >
                  {safeJob.responsibilities.map((responsibility, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                      role="listitem"
                    >
                      <CheckCircle
                        className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                  Key Responsibilities
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  Responsibilities information not available.
                </p>
              </div>
            )}

            {safeJob.requirements.length > 0 ? (
              <div className="space-y-3">
                <h4
                  className="font-semibold text-foreground flex items-center gap-2"
                  id={`requirements-${safeJob.id}`}
                >
                  <CheckCircle
                    className="h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  Requirements
                </h4>
                <ul
                  className="space-y-2"
                  role="list"
                  aria-labelledby={`requirements-${safeJob.id}`}
                >
                  {safeJob.requirements.map((requirement, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                      role="listitem"
                    >
                      <CheckCircle
                        className="h-4 w-4 text-primary mt-0.5 flex-shrink-0"
                        aria-hidden="true"
                      />
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle
                    className="h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  Requirements
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  Requirements information not available.
                </p>
              </div>
            )}

            {safeJob.benefits.length > 0 && (
              <div className="space-y-3">
                <h4
                  className="font-semibold text-foreground flex items-center gap-2"
                  id={`benefits-${safeJob.id}`}
                >
                  <DollarSign
                    className="h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  Benefits & Perks
                </h4>
                <div
                  className="flex flex-wrap gap-2"
                  role="list"
                  aria-labelledby={`benefits-${safeJob.id}`}
                >
                  {safeJob.benefits.map((benefit, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs min-h-[32px] px-3 py-1"
                      role="listitem"
                    >
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button
                className={cn(
                  buttonClasses,
                  "w-full sm:w-auto min-h-[48px] px-6 py-3 text-base font-medium"
                )}
                size="lg"
                onClick={() => setIsApplicationModalOpen(true)}
                aria-label={`Apply for ${safeJob.title} position`}
              >
                Apply for this Position
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      {isApplicationModalOpen ? (
        <JobApplicationModal
          job={job}
          jobId={job.id}
          isOpen={isApplicationModalOpen}
          onClose={() => setIsApplicationModalOpen(false)}
        />
      ) : null}
    </Card>
  );
}

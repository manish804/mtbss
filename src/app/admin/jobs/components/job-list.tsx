"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobCard } from "./job-card";
import { BulkOperations } from "./bulk-operations";
import { JobListItem } from "@/lib/validation/job-schemas";

interface JobListProps {
  jobs: JobListItem[];
  totalJobs: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onStatusToggle: (jobId: string, isActive: boolean) => Promise<void>;
  onDelete: (jobId: string) => Promise<void>;
  onBulkStatusChange?: (jobIds: string[], isActive: boolean) => Promise<void>;
  onBulkDelete?: (jobIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function JobList({
  jobs,
  totalJobs,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onStatusToggle,
  onDelete,
  onBulkStatusChange,
  onBulkDelete,
  isLoading = false,
}: JobListProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const handleStatusToggle = async (jobId: string, isActive: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [jobId]: true }));
    try {
      await onStatusToggle(jobId, isActive);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleDelete = async (jobId: string) => {
    setLoadingStates((prev) => ({ ...prev, [jobId]: true }));
    try {
      await onDelete(jobId);

      setSelectedJobs((prev) => prev.filter((id) => id !== jobId));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleSelectionChange = (jobId: string, selected: boolean) => {
    setSelectedJobs((prev) =>
      selected ? [...prev, jobId] : prev.filter((id) => id !== jobId)
    );
  };

  const handleBulkStatusChange = async (
    jobIds: string[],
    isActive: boolean
  ) => {
    if (onBulkStatusChange) {
      await onBulkStatusChange(jobIds, isActive);
    }
  };

  const handleBulkDelete = async (jobIds: string[]) => {
    if (onBulkDelete) {
      await onBulkDelete(jobIds);
      setSelectedJobs([]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: pageSize }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No jobs found
          </h3>
          <p className="text-gray-600 text-center">
            No jobs match your current filters. Try adjusting your search
            criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalJobs);

  return (
    <div className="space-y-6">
      
      {(onBulkStatusChange || onBulkDelete) && (
        <BulkOperations
          jobs={jobs}
          selectedJobs={selectedJobs}
          onSelectionChange={setSelectedJobs}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleBulkDelete}
          isLoading={isLoading}
        />
      )}

      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {startItem}-{endItem} of {totalJobs} job
          {totalJobs !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Jobs per page:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(value) => onPageSizeChange(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6">6</SelectItem>
              <SelectItem value="12">12</SelectItem>
              <SelectItem value="24">24</SelectItem>
              <SelectItem value="48">48</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onStatusToggle={handleStatusToggle}
            onDelete={handleDelete}
            isSelected={selectedJobs.includes(job.id)}
            onSelectionChange={handleSelectionChange}
            showSelection={!!(onBulkStatusChange || onBulkDelete)}
            isLoading={loadingStates[job.id]}
          />
        ))}
      </div>

      
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApplicationCard, ApplicationListItem } from "./application-card";
import { BulkOperations } from "./bulk-operations";
import { ApplicationLoadingSkeleton } from "./application-loading-skeleton";

interface ApplicationListProps {
  applications: ApplicationListItem[];
  totalApplications: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onDelete: (applicationId: string) => Promise<void>;
  onBulkStatusChange?: (
    applicationIds: string[],
    status: string
  ) => Promise<void>;
  onBulkDelete?: (applicationIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function ApplicationList({
  applications,
  totalApplications,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onDelete,
  onBulkStatusChange,
  onBulkDelete,
  isLoading = false,
}: ApplicationListProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    []
  );

  const handleDelete = async (applicationId: string) => {
    setLoadingStates((prev) => ({ ...prev, [applicationId]: true }));
    try {
      await onDelete(applicationId);

      setSelectedApplications((prev) =>
        prev.filter((id) => id !== applicationId)
      );
    } finally {
      setLoadingStates((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const handleSelectionChange = (applicationId: string, selected: boolean) => {
    setSelectedApplications((prev) =>
      selected
        ? [...prev, applicationId]
        : prev.filter((id) => id !== applicationId)
    );
  };

  const handleBulkStatusChange = async (
    applicationIds: string[],
    status: string
  ) => {
    if (onBulkStatusChange) {
      await onBulkStatusChange(applicationIds, status);
    }
  };

  const handleBulkDelete = async (applicationIds: string[]) => {
    if (onBulkDelete) {
      await onBulkDelete(applicationIds);
      setSelectedApplications([]);
    }
  };

  if (isLoading) {
    return <ApplicationLoadingSkeleton variant="card" count={pageSize} />;
  }

  const applicationsArray = Array.isArray(applications) ? applications : [];

  if (applicationsArray.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No applications found
          </h3>
          <p className="text-gray-600 text-center">
            No applications match your current filters. Try adjusting your
            search criteria.
          </p>
        </CardContent>
      </Card>
    );
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalApplications);

  return (
    <div className="space-y-6">
      {(onBulkStatusChange || onBulkDelete) && (
        <BulkOperations
          applications={applicationsArray}
          selectedApplications={selectedApplications}
          onSelectionChange={setSelectedApplications}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkDelete={handleBulkDelete}
          isLoading={isLoading}
        />
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {startItem}-{endItem} of {totalApplications} application
          {totalApplications !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Applications per page:</span>
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
        {applicationsArray.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onDelete={handleDelete}
            isSelected={selectedApplications.includes(application.id)}
            onSelectionChange={handleSelectionChange}
            showSelection={!!(onBulkStatusChange || onBulkDelete)}
            isLoading={loadingStates?.[application.id] || false}
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

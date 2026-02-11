"use client";

import { useState } from "react";
import {
  Trash2,
  Eye,
  EyeOff,
  MoreHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { JobListItem } from "@/lib/validation/job-schemas";

interface BulkOperationsProps {
  jobs: JobListItem[];
  selectedJobs: string[];
  onSelectionChange: (selectedJobs: string[]) => void;
  onBulkStatusChange: (jobIds: string[], isActive: boolean) => Promise<void>;
  onBulkDelete: (jobIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function BulkOperations({
  jobs,
  selectedJobs,
  onSelectionChange,
  onBulkStatusChange,
  onBulkDelete,
  isLoading = false,
}: BulkOperationsProps) {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const isAllSelected = jobs.length > 0 && selectedJobs.length === jobs.length;
  const isPartiallySelected =
    selectedJobs.length > 0 && selectedJobs.length < jobs.length;
  const selectAllState: boolean | "indeterminate" = isAllSelected
    ? true
    : isPartiallySelected
    ? "indeterminate"
    : false;

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(jobs.map((job) => job.id));
    }
  };

  const handleBulkActivate = async () => {
    setIsProcessing(true);
    try {
      await onBulkStatusChange(selectedJobs, true);
      toast({
        title: "Jobs Activated",
        description: `${selectedJobs.length} job${
          selectedJobs.length !== 1 ? "s" : ""
        } activated successfully.`,
        variant: "default",
      });
      onSelectionChange([]);
    } catch (error) {
      console.error("Error activating jobs:", error);
      toast({
        title: "Failed to Activate Jobs",
        description: "Some jobs could not be activated. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDeactivate = async () => {
    setIsProcessing(true);
    try {
      await onBulkStatusChange(selectedJobs, false);
      toast({
        title: "Jobs Deactivated",
        description: `${selectedJobs.length} job${
          selectedJobs.length !== 1 ? "s" : ""
        } deactivated successfully.`,
        variant: "default",
      });
      onSelectionChange([]);
    } catch (error) {
      console.error("Error deactivating jobs:", error);
      toast({
        title: "Failed to Deactivate Jobs",
        description: "Some jobs could not be deactivated. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    setIsProcessing(true);
    try {
      await onBulkDelete(selectedJobs);
      toast({
        title: "Jobs Deleted",
        description: `${selectedJobs.length} job${
          selectedJobs.length !== 1 ? "s" : ""
        } deleted successfully.`,
        variant: "default",
      });
      onSelectionChange([]);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting jobs:", error);
      toast({
        title: "Failed to Delete Jobs",
        description: "Some jobs could not be deleted. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedJobsWithApplications = jobs.filter(
    (job) => selectedJobs.includes(job.id) && job.applicationCount > 0
  );

  const totalApplications = selectedJobsWithApplications.reduce(
    (sum, job) => sum + job.applicationCount,
    0
  );

  if (jobs.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-gray-50 border rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectAllState}
              onCheckedChange={handleSelectAll}
              disabled={isLoading}
            />
            <span className="text-sm font-medium">
              {selectedJobs.length === 0
                ? `Select all ${jobs.length} jobs`
                : `${selectedJobs.length} of ${jobs.length} selected`}
            </span>
          </div>

          {selectedJobs.length > 0 && (
            <Badge variant="secondary">{selectedJobs.length} selected</Badge>
          )}
        </div>

        {selectedJobs.length > 0 && (
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isProcessing || isLoading}
                >
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBulkActivate}>
                  <Eye className="h-4 w-4 mr-2" />
                  Activate Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkDeactivate}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Deactivate Selected
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectionChange([])}
              disabled={isProcessing || isLoading}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Jobs</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedJobs.length} job
              {selectedJobs.length !== 1 ? "s" : ""}?
              {selectedJobsWithApplications.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 font-medium">
                    ⚠️ Warning: {selectedJobsWithApplications.length} of the
                    selected jobs have applications
                  </p>
                  <p className="text-amber-700 text-sm mt-1">
                    This will permanently delete {totalApplications} application
                    {totalApplications !== 1 ? "s" : ""} across these jobs:
                  </p>
                  <ul className="text-amber-700 text-sm mt-2 space-y-1">
                    {selectedJobsWithApplications.slice(0, 3).map((job) => (
                      <li key={job.id}>
                        • {job.title} ({job.applicationCount} application
                        {job.applicationCount !== 1 ? "s" : ""})
                      </li>
                    ))}
                    {selectedJobsWithApplications.length > 3 && (
                      <li>
                        • And {selectedJobsWithApplications.length - 3} more...
                      </li>
                    )}
                  </ul>
                </div>
              )}
              <p className="mt-3 text-gray-600">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing
                ? "Deleting..."
                : `Delete ${selectedJobs.length} Job${
                    selectedJobs.length !== 1 ? "s" : ""
                  }`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

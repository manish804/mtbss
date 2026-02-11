"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Progress } from "@/components/ui/progress";
import { ApplicationListItem } from "./application-card";

interface BulkOperationsProps {
  applications: ApplicationListItem[];
  selectedApplications: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBulkStatusChange?: (
    applicationIds: string[],
    status: string
  ) => Promise<void>;
  onBulkDelete?: (applicationIds: string[]) => Promise<void>;
  isLoading?: boolean;
}

const statusOptions = [
  { value: "SUBMITTED", label: "Submitted", color: "text-blue-600" },
  { value: "UNDER_REVIEW", label: "Under Review", color: "text-yellow-600" },
  { value: "SHORTLISTED", label: "Shortlisted", color: "text-purple-600" },
  { value: "INTERVIEWED", label: "Interviewed", color: "text-indigo-600" },
  { value: "SELECTED", label: "Selected", color: "text-green-600" },
  { value: "REJECTED", label: "Rejected", color: "text-red-600" },
  { value: "WITHDRAWN", label: "Withdrawn", color: "text-gray-600" },
];

export function BulkOperations({
  applications,
  selectedApplications,
  onSelectionChange,
  onBulkStatusChange,
  onBulkDelete,
  isLoading = false,
}: BulkOperationsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [operationType, setOperationType] = useState<
    "status" | "delete" | null
  >(null);

  const applicationsArray = Array.isArray(applications) ? applications : [];
  const selectedArray = Array.isArray(selectedApplications)
    ? selectedApplications
    : [];

  const isAllSelected =
    applicationsArray.length > 0 &&
    selectedArray.length === applicationsArray.length;
  const isPartiallySelected =
    selectedArray.length > 0 && selectedArray.length < applicationsArray.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(applicationsArray.map((app) => app.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (!onBulkStatusChange || selectedArray.length === 0) return;

    setIsProcessing(true);
    setOperationType("status");
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      await onBulkStatusChange(selectedApplications, status);

      clearInterval(progressInterval);
      setProgress(100);

      onSelectionChange([]);
      setShowStatusDialog(false);
    } catch (error) {
      console.error("Error updating application status:", error);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        setOperationType(null);
      }, 500);
    }
  };

  const handleBulkDelete = async () => {
    if (!onBulkDelete || selectedArray.length === 0) return;

    setIsProcessing(true);
    setOperationType("delete");
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 100);

      await onBulkDelete(selectedApplications);

      clearInterval(progressInterval);
      setProgress(100);

      onSelectionChange([]);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting applications:", error);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        setOperationType(null);
      }, 500);
    }
  };

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    setShowStatusDialog(true);
  };

  if (applicationsArray.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={
                    isAllSelected
                      ? true
                      : isPartiallySelected
                      ? "indeterminate"
                      : false
                  }
                  onCheckedChange={handleSelectAll}
                  disabled={isLoading || isProcessing}
                />
                <span className="text-sm font-medium">
                  {selectedArray.length === 0
                    ? "Select applications"
                    : `${selectedArray.length} selected`}
                </span>
              </div>

              {selectedArray.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectionChange([])}
                  disabled={isLoading || isProcessing}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear selection
                </Button>
              )}
            </div>

            {selectedArray.length > 0 && (
              <div className="flex items-center gap-2">
                {onBulkStatusChange && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={isLoading || isProcessing}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Update Status
                        <ChevronDown className="h-4 w-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {statusOptions.map((status) => (
                        <DropdownMenuItem
                          key={status.value}
                          onClick={() => handleStatusSelect(status.value)}
                          className={status.color}
                        >
                          {status.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {onBulkDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isLoading || isProcessing}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected
                  </Button>
                )}
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {operationType === "status"
                    ? "Updating status..."
                    : "Deleting applications..."}
                </span>
                <span className="text-gray-600">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Application Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update the status of{" "}
              {selectedArray.length}
              application{selectedArray.length !== 1 ? "s" : ""} to &quot;
              {statusOptions.find((s) => s.value === selectedStatus)?.label}
              &quot;?
              This will also update the reviewed timestamp for all selected
              applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleBulkStatusChange(selectedStatus)}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Applications
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedArray.length}
              application{selectedArray.length !== 1 ? "s" : ""}? This action
              cannot be undone and will permanently remove all application data
              including resumes and portfolio files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Applications"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

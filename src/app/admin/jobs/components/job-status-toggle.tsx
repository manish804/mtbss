"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";

interface JobStatusToggleProps {
  jobId: string;
  jobTitle: string;
  isActive: boolean;
  onStatusChange: (jobId: string, isActive: boolean) => Promise<void>;
  disabled?: boolean;
  showConfirmation?: boolean;
  variant?: "switch" | "badge" | "button";
  size?: "sm" | "md" | "lg";
}

export function JobStatusToggle({
  jobId,
  jobTitle,
  isActive,
  onStatusChange,
  disabled = false,
  showConfirmation = false,
  variant = "switch",
  size = "md",
}: JobStatusToggleProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<boolean | null>(null);
  const buttonSize = size === "md" ? "default" : size;

  const handleToggle = async (newStatus?: boolean) => {
    const targetStatus = newStatus !== undefined ? newStatus : !isActive;

    if (showConfirmation && !newStatus) {
      setPendingStatus(targetStatus);
      setShowConfirmDialog(true);
      return;
    }

    setIsLoading(true);
    try {
      await onStatusChange(jobId, targetStatus);

      toast({
        title: "Job Status Updated",
        description: `"${jobTitle}" has been ${
          targetStatus ? "activated" : "deactivated"
        }.`,
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating job status:", error);

      toast({
        title: "Failed to Update Status",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmStatusChange = async () => {
    if (pendingStatus !== null) {
      await handleToggle(pendingStatus);
      setPendingStatus(null);
      setShowConfirmDialog(false);
    }
  };

  const cancelStatusChange = () => {
    setPendingStatus(null);
    setShowConfirmDialog(false);
  };

  if (variant === "switch") {
    return (
      <>
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          <Switch
            checked={isActive}
            onCheckedChange={handleToggle}
            disabled={disabled || isLoading}
            aria-label={`Toggle job status for ${jobTitle}`}
          />
          {size !== "sm" && (
            <span
              className={`text-${size === "lg" ? "base" : "sm"} text-gray-600`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          )}
        </div>

        {showConfirmation && (
          <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {pendingStatus ? "Activate" : "Deactivate"} Job
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to{" "}
                  {pendingStatus ? "activate" : "deactivate"} &quot;{jobTitle}
                  &quot;?
                  {!pendingStatus && (
                    <span className="block mt-2 text-amber-600">
                      This will hide the job from public listings and prevent
                      new applications.
                    </span>
                  )}
                  {pendingStatus && (
                    <span className="block mt-2 text-green-600">
                      This will make the job visible to applicants again.
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelStatusChange}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmStatusChange}>
                  {pendingStatus ? "Activate" : "Deactivate"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </>
    );
  }

  if (variant === "badge") {
    return (
      <>
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={`cursor-pointer transition-colors ${
            isActive
              ? "bg-green-100 text-green-800 hover:bg-green-200"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          } ${disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={() => !disabled && !isLoading && handleToggle()}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
          ) : isActive ? (
            <CheckCircle className="h-3 w-3 mr-1" />
          ) : (
            <XCircle className="h-3 w-3 mr-1" />
          )}
          {isActive ? "Active" : "Inactive"}
        </Badge>

        {showConfirmation && (
          <AlertDialog
            open={showConfirmDialog}
            onOpenChange={setShowConfirmDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {pendingStatus ? "Activate" : "Deactivate"} Job
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to{" "}
                  {pendingStatus ? "activate" : "deactivate"} &quot;{jobTitle}
                  &quot;?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={cancelStatusChange}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={confirmStatusChange}>
                  {pendingStatus ? "Activate" : "Deactivate"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </>
    );
  }

  return (
    <>
      <Button
        variant={isActive ? "default" : "outline"}
        size={buttonSize}
        onClick={() => handleToggle()}
        disabled={disabled || isLoading}
        className={isActive ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : isActive ? (
          <CheckCircle className="h-4 w-4 mr-2" />
        ) : (
          <XCircle className="h-4 w-4 mr-2" />
        )}
        {isActive ? "Active" : "Inactive"}
      </Button>

      {showConfirmation && (
        <AlertDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingStatus ? "Activate" : "Deactivate"} Job
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to{" "}
                {pendingStatus ? "activate" : "deactivate"} &quot;{jobTitle}
                &quot;?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelStatusChange}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={confirmStatusChange}>
                {pendingStatus ? "Activate" : "Deactivate"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import {
  Check,
  ChevronDown,
  Clock,
  Eye,
  Users,
  UserCheck,
  UserX,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export type JobApplicationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEWED"
  | "SELECTED"
  | "REJECTED"
  | "WITHDRAWN";

interface StatusSelectorProps {
  applicationId: string;
  currentStatus: JobApplicationStatus;
  onStatusChange: (
    applicationId: string,
    status: JobApplicationStatus
  ) => Promise<void>;
  disabled?: boolean;
  variant?: "default" | "compact";
  size?: "sm" | "md" | "lg";
}

const statusConfig = {
  SUBMITTED: {
    label: "Submitted",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
    description: "Application received and pending review",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: Eye,
    description: "Application is being reviewed by the team",
  },
  SHORTLISTED: {
    label: "Shortlisted",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Users,
    description: "Candidate has been shortlisted for next round",
  },
  INTERVIEWED: {
    label: "Interviewed",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: UserCheck,
    description: "Interview has been completed",
  },
  SELECTED: {
    label: "Selected",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Check,
    description: "Candidate has been selected for the position",
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: X,
    description: "Application has been rejected",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: UserX,
    description: "Application has been withdrawn by candidate",
  },
};

const statusOrder: JobApplicationStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "SHORTLISTED",
  "INTERVIEWED",
  "SELECTED",
  "REJECTED",
  "WITHDRAWN",
];

export function StatusSelector({
  applicationId,
  currentStatus,
  onStatusChange,
  disabled = false,
  variant = "default",
  size = "md",
}: StatusSelectorProps) {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [optimisticStatus, setOptimisticStatus] =
    useState<JobApplicationStatus | null>(null);

  const displayStatus = optimisticStatus || currentStatus;
  const currentConfig = statusConfig[displayStatus];
  const IconComponent = currentConfig.icon;

  const handleStatusChange = async (newStatus: JobApplicationStatus) => {
    if (newStatus === currentStatus || isUpdating) return;

    setOptimisticStatus(newStatus);
    setIsUpdating(true);

    try {
      await onStatusChange(applicationId, newStatus);

      toast({
        title: "Status Updated",
        description: `Application status changed to ${statusConfig[newStatus].label}`,
        variant: "default",
      });
    } catch (error) {
      setOptimisticStatus(null);

      console.error("Error updating status:", error);
      toast({
        title: "Failed to Update Status",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setOptimisticStatus(null);
    }
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-2",
    lg: "text-base px-4 py-3",
  };

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || isUpdating}
            className="h-auto p-0"
          >
            <Badge
              className={`${currentConfig.color} ${sizeClasses[size]} cursor-pointer hover:opacity-80 transition-opacity`}
            >
              <IconComponent className="h-3 w-3 mr-1" />
              {currentConfig.label}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {statusOrder.map((status) => {
            const config = statusConfig[status];
            const StatusIcon = config.icon;
            const isSelected = status === displayStatus;

            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isSelected || isUpdating}
                className="flex items-center gap-2 cursor-pointer"
              >
                <StatusIcon className="h-4 w-4" />
                <span className="flex-1">{config.label}</span>
                {isSelected && <Check className="h-4 w-4 text-green-600" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Status</span>
        {isUpdating && (
          <span className="text-xs text-gray-500">Updating...</span>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled || isUpdating}
            className={`w-full justify-between ${sizeClasses[size]}`}
          >
            <div className="flex items-center gap-2">
              <IconComponent className="h-4 w-4" />
              <span>{currentConfig.label}</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          {statusOrder.map((status) => {
            const config = statusConfig[status];
            const StatusIcon = config.icon;
            const isSelected = status === displayStatus;

            return (
              <DropdownMenuItem
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isSelected || isUpdating}
                className="flex flex-col items-start gap-1 cursor-pointer p-3"
              >
                <div className="flex items-center gap-2 w-full">
                  <StatusIcon className="h-4 w-4" />
                  <span className="font-medium flex-1">{config.label}</span>
                  {isSelected && <Check className="h-4 w-4 text-green-600" />}
                </div>
                <p className="text-xs text-gray-500 ml-6">
                  {config.description}
                </p>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <p className="text-xs text-gray-500">{currentConfig.description}</p>
    </div>
  );
}

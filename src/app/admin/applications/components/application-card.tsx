"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Eye,
  Trash2,
  Calendar,
  Building,
  Mail,
  Phone,
  FileText,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export interface ApplicationListItem {
  id: string;
  jobId: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: Date;
  reviewedAt?: Date;
  hasReviewNotes: boolean;
  resumeUrl?: string;
}

interface ApplicationCardProps {
  application: ApplicationListItem;
  onDelete: (applicationId: string) => Promise<void>;
  isSelected?: boolean;
  onSelectionChange?: (applicationId: string, selected: boolean) => void;
  showSelection?: boolean;
  isLoading?: boolean;
}

const statusConfig = {
  SUBMITTED: { label: "Submitted", color: "bg-blue-100 text-blue-800" },
  UNDER_REVIEW: {
    label: "Under Review",
    color: "bg-yellow-100 text-yellow-800",
  },
  SHORTLISTED: { label: "Shortlisted", color: "bg-purple-100 text-purple-800" },
  INTERVIEWED: { label: "Interviewed", color: "bg-indigo-100 text-indigo-800" },
  SELECTED: { label: "Selected", color: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
  WITHDRAWN: { label: "Withdrawn", color: "bg-gray-100 text-gray-800" },
};

export function ApplicationCard({
  application,
  onDelete,
  isSelected = false,
  onSelectionChange,
  showSelection = false,
  isLoading = false,
}: ApplicationCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(application.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting application:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const statusInfo = statusConfig[
    application.status as keyof typeof statusConfig
  ] || {
    label: application.status,
    color: "bg-gray-100 text-gray-800",
  };

  const fullName = `${application.firstName} ${application.lastName}`;

  return (
    <>
      <Card
        className={`hover:shadow-md transition-shadow duration-200 ${
          isSelected ? "ring-2 ring-blue-500" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {showSelection && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onSelectionChange?.(application.id, !!checked)
                  }
                  className="mt-1"
                />
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {fullName}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span className="truncate">{application.jobTitle}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/applications/view?id=${application.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={isLoading}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Application
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span className="truncate">{application.email}</span>
            </div>
            {application.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{application.phone}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                Applied {format(new Date(application.createdAt), "MMM d, yyyy")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {application.resumeUrl && (
                <div className="flex items-center gap-1 text-green-600">
                  <FileText className="h-4 w-4" />
                  <span className="text-xs">Resume</span>
                </div>
              )}
              {application.hasReviewNotes && (
                <div className="flex items-center gap-1 text-blue-600">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs">Notes</span>
                </div>
              )}
            </div>
          </div>

          {application.reviewedAt && (
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-1 border-t">
              <Calendar className="h-3 w-3" />
              <span>
                Reviewed{" "}
                {format(new Date(application.reviewedAt), "MMM d, yyyy")}
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={`/admin/applications/view?id=${application.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the application from {fullName}{" "}
              for &quot;{application.jobTitle}&quot;? This action cannot be
              undone and
              will permanently remove all application data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

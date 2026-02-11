"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  MapPin,
  Building,
  Clock,
  DollarSign,
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
import { JobListItem } from "@/lib/validation/job-schemas";
import { JobStatusToggle } from "./job-status-toggle";

interface JobCardProps {
  job: JobListItem;
  onStatusToggle: (jobId: string, isActive: boolean) => Promise<void>;
  onDelete: (jobId: string) => Promise<void>;
  isSelected?: boolean;
  onSelectionChange?: (jobId: string, selected: boolean) => void;
  showSelection?: boolean;
  isLoading?: boolean;
}

export function JobCard({
  job,
  onStatusToggle,
  onDelete,
  isSelected = false,
  onSelectionChange,
  showSelection = false,
  isLoading = false,
}: JobCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(job.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting job:", error);
    } finally {
      setIsDeleting(false);
    }
  };

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
                    onSelectionChange?.(job.id, !!checked)
                  }
                  className="mt-1"
                />
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold text-gray-900 truncate">
                  {job.title}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>{job.department}</span>
                  <span>•</span>
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge
                variant={job.isActive ? "default" : "secondary"}
                className={
                  job.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }
              >
                {job.isActive ? "Active" : "Inactive"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/jobs/${job.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/jobs/${job.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Job
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Job
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{job.type}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="h-4 w-4" />
              <span>{job.experience}</span>
            </div>
            {job.salary && (
              <div className="flex items-center gap-2 text-gray-600 col-span-2">
                <DollarSign className="h-4 w-4" />
                <span>{job.salary}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                {job.applicationCount} application
                {job.applicationCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>
                Posted {format(new Date(job.postedDate), "MMM d, yyyy")}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm font-medium text-gray-700">
              Job Status
            </span>
            <JobStatusToggle
              jobId={job.id}
              jobTitle={job.title}
              isActive={job.isActive}
              onStatusChange={onStatusToggle}
              disabled={isLoading}
              variant="switch"
              size="sm"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={`/admin/jobs/${job.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={`/admin/jobs/${job.id}/edit`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Opening</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{job.title}&quot;?
              {job.applicationCount > 0 && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Warning: This job has {job.applicationCount} application
                  {job.applicationCount !== 1 ? "s" : ""}. Deleting it will
                  permanently remove all associated data.
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

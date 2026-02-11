"use client";

import { memo } from "react";
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

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  jobTitle: string;
  applicationCount?: number;
  isDeleting: boolean;
}

export const DeleteDialog = memo(function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  jobTitle,
  applicationCount = 0,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Job Opening</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{jobTitle}&quot;?
            {applicationCount > 0 && (
              <span className="block mt-2 text-amber-600 font-medium">
                Warning: This job has {applicationCount} application
                {applicationCount !== 1 ? "s" : ""}. Deleting it will
                permanently remove all associated data.
              </span>
            )}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : "Delete Job"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

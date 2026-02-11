"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Save, Clock, CheckCircle, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ReviewNotesProps {
  applicationId: string;
  initialNotes?: string;
  lastUpdated?: Date;
  onNotesChange: (applicationId: string, notes: string) => Promise<void>;
  disabled?: boolean;
  maxLength?: number;
  autoSaveDelay?: number;
}

export function ReviewNotes({
  applicationId,
  initialNotes = "",
  lastUpdated,
  onNotesChange,
  disabled = false,
  maxLength = 2000,
  autoSaveDelay = 2000,
}: ReviewNotesProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState(initialNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(lastUpdated || null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const saveNotes = useCallback(
    async (notesToSave: string) => {
      const safeNotesToSave = notesToSave || "";
      const safeInitialNotes = initialNotes || "";
      if (safeNotesToSave === safeInitialNotes || isSaving) return;

      setIsSaving(true);
      setSaveStatus("saving");

      try {
        await onNotesChange(applicationId, safeNotesToSave);
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        setSaveStatus("saved");

        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Error saving notes:", error);
        setSaveStatus("error");

        toast({
          title: "Failed to Save Notes",
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    },
    [applicationId, initialNotes, isSaving, onNotesChange, toast]
  );

  useEffect(() => {
    if (!hasUnsavedChanges || disabled) return;

    const timer = setTimeout(() => {
      saveNotes(notes);
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [notes, hasUnsavedChanges, disabled, autoSaveDelay, saveNotes]);

  const handleNotesChange = (value: string) => {
    const safeValue = value || "";
    setNotes(safeValue);
    setHasUnsavedChanges(safeValue !== (initialNotes || ""));
    setSaveStatus("idle");
  };

  const handleManualSave = () => {
    if (!hasUnsavedChanges || isSaving) return;
    saveNotes(notes);
  };

  const remainingChars = maxLength - (notes || "").length;
  const isNearLimit = remainingChars < 100;
  const isOverLimit = remainingChars < 0;

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case "saving":
        return <Clock className="h-4 w-4 animate-spin" />;
      case "saved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case "saving":
        return "Saving...";
      case "saved":
        return "Saved";
      case "error":
        return "Save failed";
      default:
        return hasUnsavedChanges ? "Unsaved changes" : "";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Review Notes</CardTitle>
          <div className="flex items-center gap-2">
            {getSaveStatusIcon() && (
              <div className="flex items-center gap-1 text-sm">
                {getSaveStatusIcon()}
                <span
                  className={`
                  ${saveStatus === "saved" ? "text-green-600" : ""}
                  ${saveStatus === "error" ? "text-red-600" : ""}
                  ${saveStatus === "saving" ? "text-blue-600" : ""}
                  ${
                    hasUnsavedChanges && saveStatus === "idle"
                      ? "text-amber-600"
                      : ""
                  }
                `}
                >
                  {getSaveStatusText()}
                </span>
              </div>
            )}
            {hasUnsavedChanges && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualSave}
                disabled={isSaving || disabled}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Now
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add your review notes here..."
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            disabled={disabled || isSaving}
            className={`min-h-32 resize-y ${
              isOverLimit ? "border-red-500 focus:border-red-500" : ""
            }`}
            maxLength={maxLength}
          />

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {lastSaved && (
                <span className="text-gray-500">
                  Last saved: {format(lastSaved, "MMM d, yyyy 'at' h:mm a")}
                </span>
              )}
              {hasUnsavedChanges && saveStatus === "idle" && (
                <Badge variant="secondary" className="text-amber-600">
                  Auto-save in {autoSaveDelay / 1000}s
                </Badge>
              )}
            </div>

            <span
              className={`
              ${isOverLimit ? "text-red-600 font-medium" : ""}
              ${isNearLimit && !isOverLimit ? "text-amber-600" : ""}
              ${!isNearLimit ? "text-gray-500" : ""}
            `}
            >
              {remainingChars} characters remaining
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-medium">Tips:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Notes are automatically saved as you type</li>
            <li>
              Include interview feedback, skills assessment, and hiring
              recommendations
            </li>
            <li>Use clear, professional language for future reference</li>
          </ul>
        </div>

        {isOverLimit && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">
              Notes exceed the maximum length of {maxLength} characters. Please
              shorten your notes.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

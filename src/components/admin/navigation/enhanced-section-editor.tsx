"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SectionStatusIndicator,
  SectionValidationFeedback,
} from "./section-status-indicator";
import { AdminBreadcrumb } from "./admin-breadcrumb";
import {
  Save,
  RotateCcw,
  Eye,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface EnhancedSectionEditorProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onSave?: (data: unknown) => Promise<void>;
  onValidate?: (data: unknown) => ValidationResult;
  initialData?: unknown;
  breadcrumbItems?: Array<{ label: string; href?: string; current?: boolean }>;
  previewUrl?: string;
  className?: string;
}

export function EnhancedSectionEditor({
  title,
  description,
  children,
  onSave,
  onValidate,
  initialData,
  breadcrumbItems,
  previewUrl,
  className,
}: EnhancedSectionEditorProps) {
  const [data, setData] = useState<unknown>(initialData ?? {});
  const [validation, setValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (onValidate) {
      const result = onValidate(data);
      setValidation(result);
    }
  }, [data, onValidate]);

  const handleSave = async () => {
    if (!onSave) return;

    try {
      setIsSaving(true);
      await onSave(data);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setData(initialData ?? {});
    setHasUnsavedChanges(false);
  };

  const getStatus = () => {
    if (validation.errors.length > 0) return "error";
    if (validation.warnings.length > 0) return "incomplete";
    return "complete";
  };

  return (
    <div className={className}>
      {breadcrumbItems && (
        <div className="mb-6">
          <AdminBreadcrumb items={breadcrumbItems} />
        </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <SectionStatusIndicator status={getStatus()} />
          </div>
          <p className="text-gray-600">{description}</p>
          {lastSaved && (
            <p className="text-sm text-gray-500 mt-1">
              Last saved: {lastSaved.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {previewUrl && (
            <Button variant="outline" asChild>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </a>
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || validation.errors.length > 0}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <SectionValidationFeedback
        errors={validation.errors}
        warnings={validation.warnings}
        className="mb-6"
      />

      {hasUnsavedChanges && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">
                You have unsaved changes
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Section Content</CardTitle>
          <CardDescription>
            Edit the content and configuration for this section
          </CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

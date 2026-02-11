"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { JobsJsonEditor } from "@/components/admin/json-editors/jobs-json-editor";
import { useJobsPageData } from "@/hooks/use-jobs-data";
import { useToast } from "@/hooks/use-toast";
export function JobsAdminPage() {
  const { toast } = useToast();
  const { data, loading, error, saving, saveData, updateData, reload } =
    useJobsPageData();

  const handleSave = async () => {
    if (!data) return;

    const success = await saveData(data);
    if (success) {
      toast({
        title: "Jobs Configuration Saved",
        description: "The jobs page configuration has been updated.",
        variant: "success",
      });
    }
  };

  const handleDataChange = (newData: typeof data) => {
    if (newData) {
      updateData(newData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            Loading jobs page configuration...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            Error Loading Jobs Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={reload} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Jobs Configuration Not Found</CardTitle>
          <CardDescription>
            The jobs page configuration could not be loaded.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={reload} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs Page Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Manage all sections and settings for the careers/jobs page
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={reload}
            variant="outline"
            size="sm"
            disabled={loading || saving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saving && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Saving changes...</AlertDescription>
        </Alert>
      )}

      <JobsJsonEditor
        data={data}
        onChange={handleDataChange}
        onSave={handleSave}
      />
    </div>
  );
}

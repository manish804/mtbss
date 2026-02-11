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
import { Loader2, RefreshCw, AlertCircle, Database } from "lucide-react";
import { ContentDataEditor } from "@/components/admin/json-editors/content-data-editor";
import { useContentData } from "@/hooks/use-content-data";
import { ContentData } from "@/lib/types/content-data";
import { useToast } from "@/hooks/use-toast";
export function ContentDataAdminPage() {
  const { toast: Toast } = useToast();
  const {
    data,
    loading,
    error,
    saving,
    saveData,
    saveSection,
    updateData,
    reload,
  } = useContentData();

  const handleSave = async () => {
    if (!data) return;

    const success = await saveData(data);
    if (success) {
      Toast({
        title: "Content Data Saved",
        description: "The content data has been successfully saved.",
        variant: "success",
      });
    }
  };

  const handleSaveSection = (
    sectionType: keyof ContentData,
    sectionData: ContentData[keyof ContentData]
  ) => {
    saveSection(sectionType, sectionData).then((success) => {
      if (success) {
        Toast({
          title: "Section Saved",
          description: `The ${sectionType} section has been successfully saved.`,
          variant: "success",
        });
      }
    });
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
          <p className="text-muted-foreground">Loading content data...</p>
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
            Error Loading Content Data
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
          <CardTitle>Content Data Not Found</CardTitle>
          <CardDescription>
            The content data could not be loaded.
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
          <h1 className="text-3xl font-bold flex items-center">
            <Database className="h-8 w-8 mr-3" />
            Content Data Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage reference data for services, departments, benefits, and
            company culture
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

      <ContentDataEditor
        data={data}
        onChange={handleDataChange}
        onSave={handleSave}
        onSaveSection={handleSaveSection}
      />
    </div>
  );
}

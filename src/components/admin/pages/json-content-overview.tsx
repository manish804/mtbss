"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SectionStatusIndicator,
  SectionValidationFeedback,
} from "@/components/admin/navigation/section-status-indicator";
import {
  FileText,
  Edit,
  Eye,
  Home,
  Users,
  Wrench,
  Phone,
  Building,
} from "lucide-react";

interface JsonFileSection {
  id: string;
  name: string;
  description: string;
  status: "complete" | "incomplete" | "error";
  validationErrors?: string[];
  validationWarnings?: string[];
  lastModified?: string;
  sectionCount?: number;
}

interface JsonFileOverview {
  filename: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  editUrl: string;
  previewUrl?: string;
  status: "complete" | "incomplete" | "error";
  sections: JsonFileSection[];
  lastModified: string;
}

interface JsonValidationOverview {
  filename: string;
  title: string;
  description: string;
  status: "complete" | "incomplete" | "error";
  sections: JsonFileSection[];
  lastModified: string;
}

export function JsonContentOverview() {
  const [jsonFiles, setJsonFiles] = useState<JsonFileOverview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJsonContentOverview();
  }, []);

  const fetchJsonContentOverview = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/json-content/validation");
      if (!response.ok) {
        throw new Error("Failed to fetch validation data");
      }

      const result = await response.json();
      const validations: JsonValidationOverview[] = Array.isArray(result.data)
        ? result.data
        : [];

      const jsonFilesData: JsonFileOverview[] = validations.map(
        (validation) => {
          let icon = FileText;
          let previewUrl = undefined;

          if (validation.filename === "home.json") {
            icon = Home;
            previewUrl = "/";
          } else if (validation.filename === "about.json") {
            icon = Users;
            previewUrl = "/about";
          } else if (validation.filename === "services.json") {
            icon = Wrench;
            previewUrl = "/services";
          } else if (validation.filename === "contact.json") {
            icon = Phone;
            previewUrl = "/contact";
          } else if (validation.filename === "jobs.json") {
            icon = Building;
            previewUrl = "/jobs";
          }

          return {
            filename: validation.filename,
            title: validation.title,
            description: validation.description,
            icon,
            editUrl: `/admin/json-pages/${validation.filename.replace(
              ".json",
              ""
            )}`,
            previewUrl,
            status: validation.status,
            sections: validation.sections,
            lastModified: validation.lastModified,
          };
        }
      );

      setJsonFiles(jsonFilesData);
    } catch (error) {
      console.error("Failed to fetch JSON content overview:", error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallStatus = () => {
    const totalFiles = jsonFiles.length;
    const completeFiles = jsonFiles.filter(
      (file) => file.status === "complete"
    ).length;
    const errorFiles = jsonFiles.filter(
      (file) => file.status === "error"
    ).length;

    return {
      total: totalFiles,
      complete: completeFiles,
      incomplete: totalFiles - completeFiles - errorFiles,
      errors: errorFiles,
    };
  };

  const overallStatus = getOverallStatus();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {" "}
            Content Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage all website content organized by files
          </p>
        </div>
        <Button asChild className="w-full sm:w-auto shrink-0">
          <Link href="/admin/json-pages">
            <FileText className="h-4 w-4 mr-2" />
            View All Pages
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Content Status Overview</span>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>{overallStatus.complete} Complete</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>{overallStatus.incomplete} Incomplete</span>
              </div>
              {overallStatus.errors > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{overallStatus.errors} Errors</span>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (overallStatus.complete / overallStatus.total) * 100
                }%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {overallStatus.complete} of {overallStatus.total} files are complete
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {jsonFiles.map((file) => {
          const Icon = file.icon;
          const hasErrors = file.sections.some(
            (section) =>
              section.validationErrors && section.validationErrors.length > 0
          );
          const hasWarnings = file.sections.some(
            (section) =>
              section.validationWarnings &&
              section.validationWarnings.length > 0
          );

          return (
            <Card
              key={file.filename}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{file.title}</CardTitle>
                      <CardDescription>{file.description}</CardDescription>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {file.filename}
                        </Badge>
                        <SectionStatusIndicator
                          status={file.status}
                          showIcon={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-gray-900 mb-3">
                    Sections ({file.sections.length})
                  </h4>
                  <div className="space-y-2">
                    {file.sections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">
                              {section.name}
                            </span>
                            <SectionStatusIndicator
                              status={section.status}
                              showText={false}
                              className="scale-75"
                            />
                          </div>
                          <p className="text-xs text-gray-600">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {(hasErrors || hasWarnings) && (
                  <SectionValidationFeedback
                    errors={file.sections.flatMap(
                      (s) => s.validationErrors || []
                    )}
                    warnings={file.sections.flatMap(
                      (s) => s.validationWarnings || []
                    )}
                  />
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t gap-3 sm:gap-0">
                  <div className="text-xs text-gray-500">
                    Updated {new Date(file.lastModified).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.previewUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                        className="flex-1 sm:flex-none"
                      >
                        <Link href={file.previewUrl} target="_blank">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Link>
                      </Button>
                    )}
                    <Button size="sm" asChild className="flex-1 sm:flex-none">
                      <Link href={file.editUrl}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

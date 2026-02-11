"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Save, FileText, Settings, Eye } from "lucide-react";
import { HeroSectionEditor } from "@/components/admin/sections/hero-section-editor";
import { JobStatsSectionEditor } from "@/components/admin/sections/job-stats-section-editor";
import { DepartmentFiltersSectionEditor } from "@/components/admin/sections/department-filters-section-editor";
import { JobListingsSectionEditor } from "@/components/admin/sections/job-listings-section-editor";
import { BenefitsSectionEditor } from "@/components/admin/sections/benefits-section-editor";
import { JobsCallToActionSectionEditor } from "@/components/admin/sections/jobs-call-to-action-section-editor";
import { DepartmentsEditor } from "@/components/admin/sections/departments-editor";
import { BenefitsEditor } from "@/components/admin/sections/benefits-editor";
import { CompanyCultureEditor } from "@/components/admin/sections/company-culture-editor";
import { KeyValueListSectionEditor } from "@/components/admin/sections/key-value-list-section-editor";
import { jobsPageSchema } from "@/lib/validation/page-schemas";
import type { z } from "zod";

type JobsPageData = z.infer<typeof jobsPageSchema>;

interface JobsJsonEditorProps {
  data: JobsPageData;
  onChange: (data: JobsPageData) => void;
  onSave?: () => void;
}

export function JobsJsonEditor({
  data,
  onChange,
  onSave,
}: JobsJsonEditorProps) {
  const [activeTab, setActiveTab] = useState("hero");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSectionChange = <K extends keyof JobsPageData>(
    sectionKey: K,
    sectionData: JobsPageData[K]
  ) => {
    const updatedData = {
      ...data,
      [sectionKey]: sectionData,
      lastModified: new Date().toISOString(),
    };
    onChange(updatedData);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onSave?.();
    setHasUnsavedChanges(false);
  };

  const getSectionStatus = (sectionKey: keyof JobsPageData) => {
    const section = data[sectionKey];
    if (Array.isArray(section)) {
      return "active";
    }
    if (
      typeof section === "object" &&
      section !== null &&
      "enabled" in section
    ) {
      return section.enabled ? "enabled" : "disabled";
    }
    return "active";
  };

  const getSectionBadge = (status: string) => {
    switch (status) {
      case "enabled":
        return (
          <Badge variant="default" className="ml-2">
            Enabled
          </Badge>
        );
      case "disabled":
        return (
          <Badge variant="secondary" className="ml-2">
            Disabled
          </Badge>
        );
      case "active":
        return (
          <Badge variant="outline" className="ml-2">
            Active
          </Badge>
        );
      default:
        return null;
    }
  };

  const getListCountBadge = (list: unknown[] | undefined) => {
    if (!Array.isArray(list)) return null;
    return (
      <Badge variant="outline" className="ml-2">
        {list.length}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Jobs Page Configuration
              </CardTitle>
              <CardDescription>
                Configure all sections of the jobs/careers page
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <Badge variant="destructive">Unsaved Changes</Badge>
              )}
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview Page
              </Button>
              <Button onClick={handleSave} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Page ID:</span> {data.pageId}
            </div>
            <div>
              <span className="font-medium">Status:</span>{" "}
              {data.published ? (
                <Badge variant="default">Published</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
            <div>
              <span className="font-medium">Last Modified:</span>{" "}
              {new Date(data.lastModified).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
          <TabsTrigger value="hero" className="text-xs">
            Hero
            {getSectionBadge(getSectionStatus("hero"))}
          </TabsTrigger>
          <TabsTrigger value="jobStats" className="text-xs">
            Job Stats
            {getSectionBadge(getSectionStatus("jobStats"))}
          </TabsTrigger>
          <TabsTrigger value="departmentFilters" className="text-xs">
            Filters
            {getSectionBadge(getSectionStatus("departmentFilters"))}
          </TabsTrigger>
          <TabsTrigger value="departments" className="text-xs">
            Departments
            {getListCountBadge(data.departments)}
          </TabsTrigger>
          <TabsTrigger value="jobTypes" className="text-xs">
            Job Types
            {getListCountBadge(data.jobTypes)}
          </TabsTrigger>
          <TabsTrigger value="locations" className="text-xs">
            Locations
            {getListCountBadge(data.locations)}
          </TabsTrigger>
          <TabsTrigger value="experienceLevels" className="text-xs">
            Experience
            {getListCountBadge(data.experienceLevels)}
          </TabsTrigger>
          <TabsTrigger value="jobListings" className="text-xs">
            Listings
            {getSectionBadge(getSectionStatus("jobListings"))}
          </TabsTrigger>
          <TabsTrigger value="benefits" className="text-xs">
            Benefits
            {getSectionBadge(getSectionStatus("benefits"))}
          </TabsTrigger>
          <TabsTrigger value="benefitsList" className="text-xs">
            Benefits List
            {getListCountBadge(data.benefitsList)}
          </TabsTrigger>
          <TabsTrigger value="companyCultureList" className="text-xs">
            Culture List
            {getListCountBadge(data.companyCultureList)}
          </TabsTrigger>
          <TabsTrigger value="callToAction" className="text-xs">
            Call to Action
            {getSectionBadge(getSectionStatus("callToAction"))}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>
                Main hero section that appears at the top of the jobs page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HeroSectionEditor
                data={data.hero}
                onChange={(heroData) => handleSectionChange("hero", heroData)}
                onSave={handleSave}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobStats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Statistics Section</CardTitle>
              <CardDescription>
                Display job statistics like open positions and remote options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobStatsSectionEditor
                data={data.jobStats}
                onChange={(statsData) =>
                  handleSectionChange("jobStats", statsData)
                }
                onSave={handleSave}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departmentFilters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Filters Section</CardTitle>
              <CardDescription>
                Filter buttons to help users find jobs by department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentFiltersSectionEditor
                data={data.departmentFilters}
                onChange={(filtersData) =>
                  handleSectionChange("departmentFilters", filtersData)
                }
                onSave={handleSave}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>
                Manage department filter options for the jobs page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentsEditor
                departments={data.departments || []}
                onChange={(departmentsData) =>
                  handleSectionChange("departments", departmentsData)
                }
                onSave={(departmentsData) => {
                  handleSectionChange("departments", departmentsData);
                  handleSave();
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobTypes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Types</CardTitle>
              <CardDescription>
                Manage job type filter options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KeyValueListSectionEditor
                data={data.jobTypes || []}
                onChange={(jobTypesData) =>
                  handleSectionChange("jobTypes", jobTypesData)
                }
                onSave={handleSave}
                title="Job Types"
                description="Job type options shown for filtering."
                itemLabel="Job Type"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Locations</CardTitle>
              <CardDescription>
                Manage location filter options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KeyValueListSectionEditor
                data={data.locations || []}
                onChange={(locationsData) =>
                  handleSectionChange("locations", locationsData)
                }
                onSave={handleSave}
                title="Locations"
                description="Location options shown for filtering."
                itemLabel="Location"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experienceLevels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Experience Levels</CardTitle>
              <CardDescription>
                Manage experience level filter options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KeyValueListSectionEditor
                data={data.experienceLevels || []}
                onChange={(experienceLevelsData) =>
                  handleSectionChange("experienceLevels", experienceLevelsData)
                }
                onSave={handleSave}
                title="Experience Levels"
                description="Experience level options shown for filtering."
                itemLabel="Experience Level"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobListings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Listings Section</CardTitle>
              <CardDescription>
                Configuration for how job listings are displayed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobListingsSectionEditor
                data={data.jobListings}
                onChange={(listingsData) =>
                  handleSectionChange("jobListings", listingsData)
                }
                onSave={handleSave}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Section</CardTitle>
              <CardDescription>
                Showcase company benefits and culture to attract candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BenefitsSectionEditor
                data={data.benefits}
                onChange={(benefitsData) =>
                  handleSectionChange("benefits", benefitsData)
                }
                onSave={handleSave}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefitsList" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benefits List</CardTitle>
              <CardDescription>
                Manage benefit cards displayed in the jobs page benefits section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BenefitsEditor
                benefits={data.benefitsList || []}
                onChange={(benefitsListData) =>
                  handleSectionChange("benefitsList", benefitsListData)
                }
                onSave={(benefitsListData) => {
                  handleSectionChange("benefitsList", benefitsListData);
                  handleSave();
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companyCultureList" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Culture List</CardTitle>
              <CardDescription>
                Manage company culture cards shown on the jobs page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyCultureEditor
                companyCulture={data.companyCultureList || []}
                onChange={(companyCultureData) =>
                  handleSectionChange("companyCultureList", companyCultureData)
                }
                onSave={(companyCultureData) => {
                  handleSectionChange("companyCultureList", companyCultureData);
                  handleSave();
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="callToAction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call to Action Section</CardTitle>
              <CardDescription>
                Final call-to-action section to encourage applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobsCallToActionSectionEditor
                data={data.callToAction}
                onChange={(ctaData) =>
                  handleSectionChange("callToAction", ctaData)
                }
                onSave={handleSave}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {hasUnsavedChanges ? (
                <span className="text-orange-600">
                  You have unsaved changes
                </span>
              ) : (
                <span>All changes saved</span>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Page Settings
              </Button>
              <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save All Changes
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

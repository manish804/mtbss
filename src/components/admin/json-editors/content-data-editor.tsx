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
import { Save } from "lucide-react";
import { ContentData } from "@/lib/types/content-data";
import { ServicesEditor } from "@/components/admin/sections/services-editor";
import { DepartmentsEditor } from "@/components/admin/sections/departments-editor";
import { BenefitsEditor } from "@/components/admin/sections/benefits-editor";
import { CompanyCultureEditor } from "@/components/admin/sections/company-culture-editor";

interface ContentDataEditorProps {
  data: ContentData;
  onChange: (data: ContentData) => void;
  onSave?: () => void;
  onSaveSection?: (
    sectionType: keyof ContentData,
    sectionData: ContentData[keyof ContentData]
  ) => void;
}

export function ContentDataEditor({
  data,
  onChange,
  onSave,
  onSaveSection,
}: ContentDataEditorProps) {
  const [activeTab, setActiveTab] = useState("services");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleSectionChange = (
    sectionKey: keyof ContentData,
    sectionData: ContentData[keyof ContentData]
  ) => {
    const updatedData = {
      ...data,
      [sectionKey]: sectionData,
    } as ContentData;
    onChange(updatedData);
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    onSave?.();
    setHasUnsavedChanges(false);
  };

  const handleSaveSection = (
    sectionType: keyof ContentData,
    sectionData: ContentData[keyof ContentData]
  ) => {
    onSaveSection?.(sectionType, sectionData);
    setHasUnsavedChanges(false);
  };

  const getSectionCount = (sectionKey: keyof ContentData) => {
    const section = data[sectionKey];
    if (Array.isArray(section)) {
      return section.length;
    }
    return 0;
  };

  const getSectionBadge = (count: number) => {
    return (
      <Badge variant="outline" className="ml-2">
        {count} items
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="services" className="text-xs">
            Services
            {getSectionBadge(getSectionCount("services"))}
          </TabsTrigger>
          <TabsTrigger value="departments" className="text-xs">
            Departments
            {getSectionBadge(getSectionCount("departments"))}
          </TabsTrigger>
          <TabsTrigger value="benefits" className="text-xs">
            Benefits
            {getSectionBadge(getSectionCount("benefits"))}
          </TabsTrigger>
          <TabsTrigger value="companyCulture" className="text-xs">
            Company Culture
            {getSectionBadge(getSectionCount("companyCulture"))}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Services Management</CardTitle>
              <CardDescription>
                Manage the services offered by the company
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServicesEditor
                services={data.services || []}
                onChange={(services) =>
                  handleSectionChange("services", services)
                }
                onSave={(services) => handleSaveSection("services", services)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Departments Management</CardTitle>
              <CardDescription>
                Manage department categories for job filtering and organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentsEditor
                departments={data.departments || []}
                onChange={(departments) =>
                  handleSectionChange("departments", departments)
                }
                onSave={(departments) =>
                  handleSaveSection("departments", departments)
                }
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Management</CardTitle>
              <CardDescription>
                Manage employee benefits and perks displayed on the careers page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BenefitsEditor
                benefits={data.benefits || []}
                onChange={(benefits) =>
                  handleSectionChange("benefits", benefits)
                }
                onSave={(benefits) => handleSaveSection("benefits", benefits)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companyCulture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Company Culture Management</CardTitle>
              <CardDescription>
                Manage company culture values and principles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompanyCultureEditor
                companyCulture={data.companyCulture || []}
                onChange={(companyCulture) =>
                  handleSectionChange("companyCulture", companyCulture)
                }
                onSave={(companyCulture) =>
                  handleSaveSection("companyCulture", companyCulture)
                }
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

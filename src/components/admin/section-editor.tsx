"use client";

import { useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Eye,
  GripVertical,
} from "lucide-react";
import { getSectionDisplayName } from "@/lib/utils/data-transform";
import type { PageContent } from "@/lib/types/page";

const loadSectionEditor = <P extends object>(
  loader: () => Promise<ComponentType<P>>
) =>
  dynamic<P>(loader, {
    ssr: false,
    loading: () => (
      <div className="p-4 text-sm text-muted-foreground">Loading editor...</div>
    ),
  });

const HeroSectionEditor = loadSectionEditor(
  () => import("./sections/hero-section-editor").then((mod) => mod.HeroSectionEditor),
);
const AboutServicesSectionEditor = loadSectionEditor(
  () => import("./sections/about-services-section-editor").then((mod) => mod.AboutServicesSectionEditor),
);
const IndustriesSectionEditor = loadSectionEditor(
  () => import("./sections/industries-section-editor").then((mod) => mod.IndustriesSectionEditor),
);
const TrustSectionEditor = loadSectionEditor(
  () => import("./sections/trust-section-editor").then((mod) => mod.TrustSectionEditor),
);
const CustomersSectionEditor = loadSectionEditor(
  () => import("./sections/customers-section-editor").then((mod) => mod.CustomersSectionEditor),
);
const CallToActionSectionEditor = loadSectionEditor(
  () => import("./sections/call-to-action-section-editor").then((mod) => mod.CallToActionSectionEditor),
);
const IntroductionSectionEditor = loadSectionEditor(
  () => import("./sections/introduction-section-editor").then((mod) => mod.IntroductionSectionEditor),
);
const ChooseUsSectionEditor = loadSectionEditor(
  () => import("./sections/choose-us-section-editor").then((mod) => mod.ChooseUsSectionEditor),
);
const ValuesSectionEditor = loadSectionEditor(
  () => import("./sections/values-section-editor").then((mod) => mod.ValuesSectionEditor),
);
const TeamSectionEditor = loadSectionEditor(
  () => import("./sections/team-section-editor").then((mod) => mod.TeamSectionEditor),
);
const ContactSectionEditor = loadSectionEditor(
  () => import("./sections/contact-section-editor").then((mod) => mod.ContactSectionEditor),
);
const ContactInfoSectionEditor = loadSectionEditor(
  () => import("./sections/contact-info-section-editor").then((mod) => mod.ContactInfoSectionEditor),
);
const FormSectionEditor = loadSectionEditor(
  () => import("./sections/form-section-editor").then((mod) => mod.FormSectionEditor),
);
const TestimonialSectionEditor = loadSectionEditor(
  () => import("./sections/testimonial-section-editor").then((mod) => mod.TestimonialSectionEditor),
);
const ServiceHighlightsSectionEditor = loadSectionEditor(
  () => import("./sections/service-highlights-section-editor").then((mod) => mod.ServiceHighlightsSectionEditor),
);
const JobStatsSectionEditor = loadSectionEditor(
  () => import("./sections/job-stats-section-editor").then((mod) => mod.JobStatsSectionEditor),
);
const DepartmentFiltersSectionEditor = loadSectionEditor(
  () => import("./sections/department-filters-section-editor").then((mod) => mod.DepartmentFiltersSectionEditor),
);
const JobListingsSectionEditor = loadSectionEditor(
  () => import("./sections/job-listings-section-editor").then((mod) => mod.JobListingsSectionEditor),
);
const BenefitsSectionEditor = loadSectionEditor(
  () => import("./sections/benefits-section-editor").then((mod) => mod.BenefitsSectionEditor),
);
const ServiceDetailsSectionEditor = loadSectionEditor(
  () => import("./sections/service-details-section-editor").then((mod) => mod.ServiceDetailsSectionEditor),
);
const ServiceStatsSectionEditor = loadSectionEditor(
  () => import("./sections/service-stats-section-editor").then((mod) => mod.ServiceStatsSectionEditor),
);
const AdditionalServiceHighlightsSectionEditor = loadSectionEditor(
  () => import("./sections/additional-service-highlights-section-editor").then((mod) => mod.AdditionalServiceHighlightsSectionEditor),
);
const AboutSectionEditor = loadSectionEditor(
  () => import("./sections/about-section-editor").then((mod) => mod.AboutSectionEditor),
);
const BenefitsListEditor = loadSectionEditor(
  () => import("./sections/benefits-editor").then((mod) => mod.BenefitsEditor),
);
const CompanyCultureListEditor = loadSectionEditor(
  () => import("./sections/company-culture-editor").then((mod) => mod.CompanyCultureEditor),
);
const DepartmentsEditor = loadSectionEditor(
  () => import("./sections/departments-editor").then((mod) => mod.DepartmentsEditor),
);
const KeyValueListSectionEditor = loadSectionEditor(
  () => import("./sections/key-value-list-section-editor").then((mod) => mod.KeyValueListSectionEditor),
);

const SECTION_ORDER_MAP: Record<string, string[]> = {
  home: [
    "hero",
    "aboutServices",
    "industries",
    "trust",
    "customers",
    "callToAction",
  ],
  about: ["hero", "introduction", "chooseUs", "values", "team", "contact"],
  services: [
   
    "serviceDetails",
  ],
  jobs: [
    "hero",
    "jobStats",
    "departmentFilters",
    "departments",
    "jobTypes",
    "locations",
    "experienceLevels",
    "jobListings",
    "benefits",
    "benefitsList",
    "companyCultureList",
    "callToAction",
  ],
  contact: ["hero", "contactInfo", "form", "testimonial"],
};

interface SectionEditorProps {
  content: PageContent;
  onChange: (content: PageContent) => void;
  onSave?: () => void;
}

export function SectionEditor({
  content,
  onChange,
  onSave,
}: SectionEditorProps) {
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const toggleSection = (sectionKey: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionKey)) {
      newOpenSections.delete(sectionKey);
    } else {
      newOpenSections.add(sectionKey);
    }
    setOpenSections(newOpenSections);
  };

  const updateSection = (sectionKey: string, sectionData: unknown) => {
    const updatedContent = {
      ...(content as Record<string, unknown>),
      [sectionKey]: sectionData,
    } as PageContent;
    onChange(updatedContent);
  };

  const renderSectionEditor = (sectionKey: string, sectionData: unknown) => {
    const commonProps = {
      data: sectionData as never,
      onChange: ((data: unknown) => updateSection(sectionKey, data)) as never,
      onSave,
    };

    switch (sectionKey) {
      case "hero":
        return <HeroSectionEditor {...commonProps} />;
      case "aboutServices":
        return <AboutServicesSectionEditor {...commonProps} />;
      case "industries":
        return <IndustriesSectionEditor {...commonProps} />;
      case "trust":
        return <TrustSectionEditor {...commonProps} />;
      case "customers":
        return <CustomersSectionEditor {...commonProps} />;
      case "callToAction":
        return <CallToActionSectionEditor {...commonProps} />;
      case "introduction":
        return <IntroductionSectionEditor {...commonProps} />;
      case "chooseUs":
        return <ChooseUsSectionEditor {...commonProps} />;
      case "values":
        return <ValuesSectionEditor {...commonProps} />;
      case "team":
        return <TeamSectionEditor {...commonProps} />;
      case "contact":
        return <ContactSectionEditor {...commonProps} />;
      case "contactInfo":
        return <ContactInfoSectionEditor {...commonProps} />;
      case "form":
        return <FormSectionEditor {...commonProps} />;
      case "testimonial":
        return <TestimonialSectionEditor {...commonProps} />;
      case "serviceHighlights":
        return <ServiceHighlightsSectionEditor {...commonProps} />;
      case "jobStats":
        return <JobStatsSectionEditor {...commonProps} />;
      case "departmentFilters":
        return <DepartmentFiltersSectionEditor {...commonProps} />;
      case "jobListings":
        return <JobListingsSectionEditor {...commonProps} />;
      case "benefits":
        return <BenefitsSectionEditor {...commonProps} />;
      case "benefitsList":
        return (
          <BenefitsListEditor
            benefits={Array.isArray(sectionData) ? sectionData : []}
            onChange={(data: unknown) => updateSection(sectionKey, data)}
            onSave={(data: unknown) => {
              updateSection(sectionKey, data);
              onSave?.();
            }}
          />
        );
      case "companyCultureList":
        return (
          <CompanyCultureListEditor
            companyCulture={Array.isArray(sectionData) ? sectionData : []}
            onChange={(data: unknown) => updateSection(sectionKey, data)}
            onSave={(data: unknown) => {
              updateSection(sectionKey, data);
              onSave?.();
            }}
          />
        );
      case "departments":
        return (
          <DepartmentsEditor
            departments={Array.isArray(sectionData) ? sectionData : []}
            onChange={(data: unknown) => updateSection(sectionKey, data)}
            onSave={(data: unknown) => {
              updateSection(sectionKey, data);
              onSave?.();
            }}
          />
        );
      case "jobTypes":
        return (
          <KeyValueListSectionEditor
            data={Array.isArray(sectionData) ? sectionData : []}
            onChange={(data: unknown) => updateSection(sectionKey, data)}
            onSave={onSave}
            title="Job Types"
            description="Manage job type filters shown on the jobs page."
            itemLabel="Job Type"
          />
        );
      case "locations":
        return (
          <KeyValueListSectionEditor
            data={Array.isArray(sectionData) ? sectionData : []}
            onChange={(data: unknown) => updateSection(sectionKey, data)}
            onSave={onSave}
            title="Locations"
            description="Manage location filters shown on the jobs page."
            itemLabel="Location"
          />
        );
      case "experienceLevels":
        return (
          <KeyValueListSectionEditor
            data={Array.isArray(sectionData) ? sectionData : []}
            onChange={(data: unknown) => updateSection(sectionKey, data)}
            onSave={onSave}
            title="Experience Levels"
            description="Manage experience level filters for jobs."
            itemLabel="Experience Level"
          />
        );
      case "serviceDetails":
        return <ServiceDetailsSectionEditor {...commonProps} />;
      case "serviceStats":
        return <ServiceStatsSectionEditor {...commonProps} />;
      case "additionalServiceHighlights":
        return <AdditionalServiceHighlightsSectionEditor {...commonProps} />;
      default:
        return (
          <div className="p-4 text-center text-gray-500">
            <p>Custom section editor not implemented yet</p>
            <p className="text-sm">Section type: {sectionKey}</p>
          </div>
        );
    }
  };

  const pageId = content.pageId || "home";

  // Special case for about page - use the AboutSectionEditor
  if (pageId === "about") {
    return (
      <AboutSectionEditor
        data={content}
        onChange={(data: unknown) =>
          onChange({
            ...content,
            ...(data as Record<string, unknown>),
          } as PageContent)
        }
        onSave={onSave}
      />
    );
  }

  const sectionOrder = SECTION_ORDER_MAP[pageId] || [];

  const allSections = Object.keys(content).filter(
    (key) =>
      !["pageId", "title", "description", "lastModified", "published"].includes(
        key
      )
  );

  const existingSections = [
    ...sectionOrder.filter((section) => allSections.includes(section)),
    ...allSections.filter((section) => !sectionOrder.includes(section)),
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Page Sections</h2>
          <p className="text-gray-600">
            Edit the existing content sections for this page
          </p>
        </div>
      </div>

      {existingSections.length > 0 ? (
        <div className="space-y-4">
          {existingSections.map((sectionKey) => {
            const sectionData = content[sectionKey];
            const isOpen = openSections.has(sectionKey);
            const isEditing = editingSection === sectionKey;

            return (
              <Card
                key={sectionKey}
                className={isEditing ? "ring-2 ring-blue-500" : ""}
              >
                <Collapsible
                  open={isOpen}
                  onOpenChange={() => toggleSection(sectionKey)}
                >
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {isOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">
                              {getSectionDisplayName(sectionKey)}
                            </CardTitle>
                            <CardDescription>
                              {sectionData?.title || "No title set"}
                            </CardDescription>
                          </div>
                        </div>

                        <div
                          className="flex items-center space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Badge variant="secondary">{sectionKey}</Badge>
                          <Button
                            size="sm"
                            variant={isEditing ? "default" : "outline"}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const newEditingSection = isEditing
                                ? null
                                : sectionKey;
                              setEditingSection(newEditingSection);

                              if (!isEditing) {
                                const newOpenSections = new Set(openSections);
                                newOpenSections.add(sectionKey);
                                setOpenSections(newOpenSections);
                              }
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {isEditing ? (
                        <div className="border-t pt-4">
                          {renderSectionEditor(sectionKey, sectionData)}
                        </div>
                      ) : (
                        <div className="border-t pt-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Preview</h4>
                            <div className="text-sm text-gray-600 space-y-1">
                              {sectionData?.title && (
                                <p>
                                  <strong>Title:</strong> {sectionData.title}
                                </p>
                              )}
                              {sectionData?.subtitle && (
                                <p>
                                  <strong>Subtitle:</strong>{" "}
                                  {sectionData.subtitle}
                                </p>
                              )}
                              {sectionData?.description && (
                                <p>
                                  <strong>Description:</strong>{" "}
                                  {sectionData.description.substring(0, 100)}...
                                </p>
                              )}
                              {sectionData?.items &&
                                Array.isArray(sectionData.items) && (
                                  <p>
                                    <strong>Items:</strong>{" "}
                                    {sectionData.items.length} items
                                  </p>
                                )}
                              {sectionData?.statistics &&
                                Array.isArray(sectionData.statistics) && (
                                  <p>
                                    <strong>Statistics:</strong>{" "}
                                    {sectionData.statistics.length} stats
                                  </p>
                                )}
                              {sectionData?.testimonials &&
                                Array.isArray(sectionData.testimonials) && (
                                  <p>
                                    <strong>Testimonials:</strong>{" "}
                                    {sectionData.testimonials.length}{" "}
                                    testimonials
                                  </p>
                                )}
                              {Array.isArray(sectionData) && (
                                <p>
                                  <strong>Entries:</strong> {sectionData.length}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              className="mt-3"
                              onClick={() => setEditingSection(sectionKey)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Section
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Eye className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sections found
            </h3>
            <p className="text-gray-600">
              This page doesn&apos;t have any content sections to edit
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

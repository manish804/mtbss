"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Loader2, ChevronDown, ChevronRight, Edit } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { z } from "zod";
import { imageDataSchema, sectionStylingSchema } from "@/lib/validation/page-schemas";
import { useFormSync } from "@/hooks/use-form-sync";
import type { PageContent } from "@/lib/types/page";

const teamMemberSchema = z.object({
  name: z.string(),
  bio: z.string(),
  image: imageDataSchema.optional(),
});

const serviceItemSchema = z.object({
  number: z.number(),
  title: z.string(),
  description: z.string(),
});

const featureSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const teamImageSchema = z.object({
  imageUrl: z.string(),
  description: z.string(),
  imageHint: z.string(),
});

const contactSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  styling: sectionStylingSchema,
});

const teamSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  teamImages: z.array(teamImageSchema),
  styling: sectionStylingSchema,
});

const aboutPageSchema = z.object({
  hero: z.object({
    title: z.string(),
    subtitle: z.string(),
    ctaLink: z.string().optional(),
    ctaText: z.string().optional(),
    styling: sectionStylingSchema,
  }),
  introduction: z.object({
    title: z.string(),
    image: imageDataSchema,
    description: z.string(),
    teamIntro: z.string(),
    teamMembers: z.array(teamMemberSchema),
    styling: sectionStylingSchema,
  }),
  values: z.object({
    title: z.string(),
    subtitle: z.string(),
    items: z.array(serviceItemSchema),
    styling: sectionStylingSchema,
  }),
  chooseUs: z.object({
    title: z.string(),
    image: imageDataSchema,
    features: z.array(featureSchema),
    styling: sectionStylingSchema,
  }),
  team: teamSectionSchema,
  contact: contactSchema,
});

type AboutPageFormData = z.infer<typeof aboutPageSchema>;

interface AboutSectionEditorProps {
  data: AboutPageFormData | PageContent;
  onChange: (data: AboutPageFormData) => void;
  onSave?: () => void;
}

export function AboutSectionEditor({
  data,
  onChange,
  onSave,
}: AboutSectionEditorProps) {
  const aboutData = data as AboutPageFormData;
  const [isSaving, setIsSaving] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["hero", "introduction"]));
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionKey: string) => {
    const newOpenSections = new Set(openSections);
    if (newOpenSections.has(sectionKey)) {
      newOpenSections.delete(sectionKey);
    } else {
      newOpenSections.add(sectionKey);
    }
    setOpenSections(newOpenSections);
  };

  const toggleEditing = (sectionKey: string) => {
    const newEditingSections = new Set(editingSections);
    if (newEditingSections.has(sectionKey)) {
      newEditingSections.delete(sectionKey);
    } else {
      newEditingSections.add(sectionKey);
      // Ensure section is open when editing
      const newOpenSections = new Set(openSections);
      newOpenSections.add(sectionKey);
      setOpenSections(newOpenSections);
    }
    setEditingSections(newEditingSections);
  };

  const form = useForm<AboutPageFormData>({
    resolver: zodResolver(aboutPageSchema),
    defaultValues: aboutData,
    mode: "onChange",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = async (formData: AboutPageFormData) => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      onChange(formData);
      if (onSave) {
        await Promise.resolve(onSave());
      }
    } catch (error) {
      console.error("Failed to save section:", error);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Hero Section */}
      <Card>
        <Collapsible
          open={openSections.has("hero")}
          onOpenChange={() => toggleSection("hero")}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {openSections.has("hero") ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">Hero Section</CardTitle>
                    <CardDescription>Configure the hero section of the about page</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    size="sm"
                    variant={editingSections.has("hero") ? "default" : "outline"}
                    onClick={() => toggleEditing("hero")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {editingSections.has("hero") ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero.title">Title</Label>
                    <Input id="hero.title" {...form.register("hero.title")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero.subtitle">Subtitle</Label>
                    <Textarea id="hero.subtitle" {...form.register("hero.subtitle")} rows={3} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hero.ctaText">CTA Text</Label>
                      <Input id="hero.ctaText" {...form.register("hero.ctaText")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hero.ctaLink">CTA Link</Label>
                      <Input id="hero.ctaLink" {...form.register("hero.ctaLink")} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Title:</strong> {aboutData.hero?.title || "No title set"}</p>
                    <p><strong>Subtitle:</strong> {aboutData.hero?.subtitle || "No subtitle set"}</p>
                    {aboutData.hero?.ctaText && <p><strong>CTA Text:</strong> {aboutData.hero.ctaText}</p>}
                    {aboutData.hero?.ctaLink && <p><strong>CTA Link:</strong> {aboutData.hero.ctaLink}</p>}
                  </div>
                  <Button type="button" size="sm" className="mt-3" onClick={() => toggleEditing("hero")}>
                    <Edit className="h-4 w-4 mr-2" /> Edit Section
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Introduction Section */}
      <Card>
        <Collapsible
          open={openSections.has("introduction")}
          onOpenChange={() => toggleSection("introduction")}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {openSections.has("introduction") ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">About Us Section</CardTitle>
                    <CardDescription>Configure the about us section with company description and team information</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    size="sm"
                    variant={editingSections.has("introduction") ? "default" : "outline"}
                    onClick={() => toggleEditing("introduction")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {editingSections.has("introduction") ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="introduction.title">Title</Label>
                    <Input id="introduction.title" {...form.register("introduction.title")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="introduction.description">Description</Label>
                    <Textarea id="introduction.description" {...form.register("introduction.description")} rows={4} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="introduction.teamIntro">Team Introduction</Label>
                    <Textarea id="introduction.teamIntro" {...form.register("introduction.teamIntro")} rows={2} />
                  </div>

                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <h5 className="font-medium">About Us Image</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="introduction.image.id">Image ID</Label>
                        <Input id="introduction.image.id" {...form.register("introduction.image.id")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="introduction.image.imageUrl">Image URL</Label>
                        <Input id="introduction.image.imageUrl" {...form.register("introduction.image.imageUrl")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="introduction.image.description">Description</Label>
                        <Input id="introduction.image.description" {...form.register("introduction.image.description")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="introduction.image.imageHint">Image Hint</Label>
                        <Input id="introduction.image.imageHint" {...form.register("introduction.image.imageHint")} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium">Team Members</h5>
                    {aboutData.introduction.teamMembers.map((_: unknown, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`introduction.teamMembers.${index}.name`}>Name</Label>
                          <Input id={`introduction.teamMembers.${index}.name`} {...form.register(`introduction.teamMembers.${index}.name`)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`introduction.teamMembers.${index}.bio`}>Bio</Label>
                          <Textarea id={`introduction.teamMembers.${index}.bio`} {...form.register(`introduction.teamMembers.${index}.bio`)} rows={3} />
                        </div>
                        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                          <h6 className="font-medium">Team Member Image</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`introduction.teamMembers.${index}.image.id`}>Image ID</Label>
                              <Input id={`introduction.teamMembers.${index}.image.id`} {...form.register(`introduction.teamMembers.${index}.image.id`)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`introduction.teamMembers.${index}.image.imageUrl`}>Image URL</Label>
                              <Input id={`introduction.teamMembers.${index}.image.imageUrl`} {...form.register(`introduction.teamMembers.${index}.image.imageUrl`)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`introduction.teamMembers.${index}.image.description`}>Description</Label>
                              <Input id={`introduction.teamMembers.${index}.image.description`} {...form.register(`introduction.teamMembers.${index}.image.description`)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`introduction.teamMembers.${index}.image.imageHint`}>Image Hint</Label>
                              <Input id={`introduction.teamMembers.${index}.image.imageHint`} {...form.register(`introduction.teamMembers.${index}.image.imageHint`)} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Title:</strong> {aboutData.introduction?.title || "No title set"}</p>
                    <p><strong>Description:</strong> {aboutData.introduction?.description ? aboutData.introduction.description.substring(0, 100) + "..." : "No description set"}</p>
                    <p><strong>Team Introduction:</strong> {aboutData.introduction?.teamIntro || "No team intro set"}</p>
                    <p><strong>Team Members:</strong> {aboutData.introduction?.teamMembers?.length || 0} members</p>
                  </div>
                  <Button type="button" size="sm" className="mt-3" onClick={() => toggleEditing("introduction")}>
                    <Edit className="h-4 w-4 mr-2" /> Edit Section
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Values Section */}
      <Card>
        <Collapsible
          open={openSections.has("values")}
          onOpenChange={() => toggleSection("values")}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {openSections.has("values") ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">Values Section</CardTitle>
                    <CardDescription>Configure the values/services overview section</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    size="sm"
                    variant={editingSections.has("values") ? "default" : "outline"}
                    onClick={() => toggleEditing("values")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {editingSections.has("values") ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="values.title">Title</Label>
                    <Input id="values.title" {...form.register("values.title")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="values.subtitle">Subtitle</Label>
                    <Textarea id="values.subtitle" {...form.register("values.subtitle")} rows={3} />
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium">Service Items</h5>
                    {aboutData.values.items.map((_: unknown, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`values.items.${index}.number`}>Number</Label>
                            <Input
                              id={`values.items.${index}.number`}
                              type="number"
                              {...form.register(`values.items.${index}.number`, { valueAsNumber: true })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`values.items.${index}.title`}>Title</Label>
                            <Input id={`values.items.${index}.title`} {...form.register(`values.items.${index}.title`)} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`values.items.${index}.description`}>Description</Label>
                          <Textarea id={`values.items.${index}.description`} {...form.register(`values.items.${index}.description`)} rows={3} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Title:</strong> {aboutData.values?.title || "No title set"}</p>
                    <p><strong>Subtitle:</strong> {aboutData.values?.subtitle || "No subtitle set"}</p>
                    <p><strong>Service Items:</strong> {aboutData.values?.items?.length || 0} items</p>
                  </div>
                  <Button type="button" size="sm" className="mt-3" onClick={() => toggleEditing("values")}>
                    <Edit className="h-4 w-4 mr-2" /> Edit Section
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Choose Us Section */}
      <Card>
        <Collapsible
          open={openSections.has("chooseUs")}
          onOpenChange={() => toggleSection("chooseUs")}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {openSections.has("chooseUs") ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">Choose Us Section</CardTitle>
                    <CardDescription>Configure the choose us section with features</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    size="sm"
                    variant={editingSections.has("chooseUs") ? "default" : "outline"}
                    onClick={() => toggleEditing("chooseUs")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {editingSections.has("chooseUs") ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chooseUs.title">Title</Label>
                    <Input id="chooseUs.title" {...form.register("chooseUs.title")} />
                  </div>

                  <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                    <h5 className="font-medium">Choose Us Image</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="chooseUs.image.id">Image ID</Label>
                        <Input id="chooseUs.image.id" {...form.register("chooseUs.image.id")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chooseUs.image.imageUrl">Image URL</Label>
                        <Input id="chooseUs.image.imageUrl" {...form.register("chooseUs.image.imageUrl")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chooseUs.image.description">Description</Label>
                        <Input id="chooseUs.image.description" {...form.register("chooseUs.image.description")} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="chooseUs.image.imageHint">Image Hint</Label>
                        <Input id="chooseUs.image.imageHint" {...form.register("chooseUs.image.imageHint")} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium">Features</h5>
                    {aboutData.chooseUs.features.map((_: unknown, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`chooseUs.features.${index}.title`}>Title</Label>
                          <Input id={`chooseUs.features.${index}.title`} {...form.register(`chooseUs.features.${index}.title`)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`chooseUs.features.${index}.description`}>Description</Label>
                          <Textarea id={`chooseUs.features.${index}.description`} {...form.register(`chooseUs.features.${index}.description`)} rows={3} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Title:</strong> {aboutData.chooseUs?.title || "No title set"}</p>
                    <p><strong>Features:</strong> {aboutData.chooseUs?.features?.length || 0} features</p>
                  </div>
                  <Button type="button" size="sm" className="mt-3" onClick={() => toggleEditing("chooseUs")}>
                    <Edit className="h-4 w-4 mr-2" /> Edit Section
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Team Section */}
      <Card>
        <Collapsible
          open={openSections.has("team")}
          onOpenChange={() => toggleSection("team")}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {openSections.has("team") ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">Team Section</CardTitle>
                    <CardDescription>Configure the team section with images</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    size="sm"
                    variant={editingSections.has("team") ? "default" : "outline"}
                    onClick={() => toggleEditing("team")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {editingSections.has("team") ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="team.title">Title</Label>
                    <Input id="team.title" {...form.register("team.title")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team.subtitle">Subtitle</Label>
                    <Textarea id="team.subtitle" {...form.register("team.subtitle")} rows={2} />
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-medium">Team Images</h5>
                    {aboutData.team.teamImages.map((_: unknown, index: number) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`team.teamImages.${index}.imageUrl`}>Image URL</Label>
                            <Input id={`team.teamImages.${index}.imageUrl`} {...form.register(`team.teamImages.${index}.imageUrl`)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`team.teamImages.${index}.description`}>Description</Label>
                            <Input id={`team.teamImages.${index}.description`} {...form.register(`team.teamImages.${index}.description`)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`team.teamImages.${index}.imageHint`}>Image Hint</Label>
                            <Input id={`team.teamImages.${index}.imageHint`} {...form.register(`team.teamImages.${index}.imageHint`)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Title:</strong> {aboutData.team?.title || "No title set"}</p>
                    <p><strong>Subtitle:</strong> {aboutData.team?.subtitle || "No subtitle set"}</p>
                    <p><strong>Team Images:</strong> {aboutData.team?.teamImages?.length || 0} images</p>
                  </div>
                  <Button type="button" size="sm" className="mt-3" onClick={() => toggleEditing("team")}>
                    <Edit className="h-4 w-4 mr-2" /> Edit Section
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Contact Section */}
      <Card>
        <Collapsible
          open={openSections.has("contact")}
          onOpenChange={() => toggleSection("contact")}
        >
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {openSections.has("contact") ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">Contact Section</CardTitle>
                    <CardDescription>Configure the contact section</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    type="button"
                    size="sm"
                    variant={editingSections.has("contact") ? "default" : "outline"}
                    onClick={() => toggleEditing("contact")}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              {editingSections.has("contact") ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact.title">Title</Label>
                    <Input id="contact.title" {...form.register("contact.title")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact.subtitle">Subtitle</Label>
                    <Textarea id="contact.subtitle" {...form.register("contact.subtitle")} rows={2} />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Preview</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Title:</strong> {aboutData.contact?.title || "No title set"}</p>
                    <p><strong>Subtitle:</strong> {aboutData.contact?.subtitle || "No subtitle set"}</p>
                  </div>
                  <Button type="button" size="sm" className="mt-3" onClick={() => toggleEditing("contact")}>
                    <Edit className="h-4 w-4 mr-2" /> Edit Section
                  </Button>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

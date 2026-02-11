"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trustSectionSchema } from "@/lib/validation/page-schemas";
import { Save, Trash2, GripVertical, X, Loader2 } from "lucide-react";
import type { TrustSection } from "@/lib/types/page";
import { z } from "zod";
import { useFormSync } from "@/hooks/use-form-sync";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { normalizeColorValue } from "@/lib/color-utils";

type TrustSectionFormData = z.infer<typeof trustSectionSchema>;

interface TrustSectionEditorProps {
  data: TrustSection;
  onChange: (data: TrustSection) => void;
  onSave?: () => void;
}

export function TrustSectionEditor({
  data,
  onChange,
  onSave,
}: TrustSectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const form = useForm<TrustSectionFormData>({
    resolver: zodResolver(trustSectionSchema),
    defaultValues: {
      ...data,
      ctaText: data.ctaText || "",
      ctaLink: data.ctaLink || "",
      image: data.image || undefined,
      features: data.features || [],
      statistics: data.statistics || [],
    },
    mode: "onChange",
  });

  const { fields: statisticsFields, remove: removeStatistic } = useFieldArray({
    control: form.control,
    name: "statistics",
  });



  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = async (formData: TrustSectionFormData) => {
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
      <Card>
        <CardHeader>
          <CardTitle>Trust Section</CardTitle>
          <CardDescription>
            Configure the trust and statistics section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter section title..."
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              placeholder="Enter subtitle..."
              rows={3}
              {...form.register("subtitle")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Call-to-Action Text</Label>
              <Input
                id="ctaText"
                placeholder="Our Services"
                {...form.register("ctaText")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaLink">Call-to-Action Link</Label>
              <Input
                id="ctaLink"
                placeholder="#about-services"
                {...form.register("ctaLink")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Add key statistics and numbers</CardDescription>
            </div>
            {/* <Button type="button" onClick={addStatistic}>
              <Plus className="h-4 w-4 mr-2" />
              Add Statistic
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          {statisticsFields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No statistics added yet</p>
              {/* <Button type="button" onClick={addStatistic}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Statistic
              </Button> */}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statisticsFields.map((field, index) => (
                <Card key={field.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex flex-col items-center space-y-2">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeStatistic(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`statistics.${index}.number`}>
                            Number
                          </Label>
                          <Input
                            placeholder="100+"
                            {...form.register(`statistics.${index}.number`)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`statistics.${index}.label`}>
                            Label
                          </Label>
                          <Input
                            placeholder="Happy Clients"
                            {...form.register(`statistics.${index}.label`)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>



      <Card>
        <CardHeader>
          <CardTitle>Section Image</CardTitle>
          <CardDescription>
            Configure the image displayed in the trust section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.image && (
            <div className="flex items-center space-x-4 p-4 border rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.image.imageUrl}
                alt={data.image.description}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-medium">
                  {data.image.description}
                </p>
                <p className="text-sm text-gray-500">
                  {data.image.imageUrl}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  onChange({
                    ...data,
                    image: undefined,
                  });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={data.image?.imageUrl || ""}
                onChange={(e) => {
                  const imageUrl = e.target.value;
                  if (imageUrl) {
                    onChange({
                      ...data,
                      image: {
                        id: data.image?.id || "trust-image",
                        description:
                          data.image?.description ||
                          "Trust section image",
                        imageUrl,
                        imageHint:
                          data.image?.imageHint || "professional office environment",
                      },
                    });
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageDescription">Image Description</Label>
              <Input
                id="imageDescription"
                placeholder="Describe the image..."
                value={data.image?.description || ""}
                onChange={(e) => {
                  if (data.image) {
                    onChange({
                      ...data,
                      image: {
                        ...data.image,
                        description: e.target.value,
                      },
                    });
                  }
                }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageHint">Image Hint (for AI generation)</Label>
            <Input
              id="imageHint"
              placeholder="professional office environment"
              value={data.image?.imageHint || ""}
              onChange={(e) => {
                if (data.image) {
                  onChange({
                    ...data,
                    image: {
                      ...data.image,
                      imageHint: e.target.value,
                    },
                  });
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the trust section
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ColorPickerInput
              label="Background Color"
              value={normalizeColorValue(data.styling.backgroundColor)}
              onChange={(value) => {
                onChange({
                  ...data,
                  styling: {
                    ...data.styling,
                    backgroundColor: value,
                  },
                });
              }}
              supportGradient={true}
              gradientDirection={data.styling.gradientDirection || "to-r"}
            />

            <ColorPickerInput
              label="Text Color"
              value={normalizeColorValue(data.styling.textColor)}
              onChange={(value) => {
                onChange({
                  ...data,
                  styling: {
                    ...data.styling,
                    textColor: typeof value === "string" ? value : value[0],
                  },
                });
              }}
              supportGradient={false}
            />

            <div className="space-y-2">
              <Label htmlFor="padding">Padding</Label>
              <Select
                value={data.styling.padding || "py-16 px-4"}
                onValueChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      padding: value,
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="py-12 px-4">Small</SelectItem>
                  <SelectItem value="py-16 px-4">Medium</SelectItem>
                  <SelectItem value="py-24 px-4">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {Array.isArray(data.styling.backgroundColor) && (
            <div className="space-y-2">
              <Label htmlFor="gradientDirection">Gradient Direction</Label>
              <Select
                value={data.styling.gradientDirection || "to-r"}
                onValueChange={(value: "to-r" | "to-b" | "to-br" | "to-bl") => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      gradientDirection: value,
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to-r">Left to Right</SelectItem>
                  <SelectItem value="to-b">Top to Bottom</SelectItem>
                  <SelectItem value="to-br">
                    Top-Left to Bottom-Right
                  </SelectItem>
                  <SelectItem value="to-bl">
                    Top-Right to Bottom-Left
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          {isSaving ? "Saving..." : "Save Section"}
        </Button>
      </div>
    </form>
  );
}

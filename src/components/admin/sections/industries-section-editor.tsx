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
import { industriesSectionSchema } from "@/lib/validation/page-schemas";
import { Save, Trash2, GripVertical, X, Loader2 } from "lucide-react";
import type { IndustriesSection } from "@/lib/types/page";
import { z } from "zod";
import { useFormSync } from "@/hooks/use-form-sync";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { normalizeColorValue } from "@/lib/color-utils";

type IndustriesSectionFormData = z.infer<typeof industriesSectionSchema>;

interface IndustriesSectionEditorProps {
  data: IndustriesSection;
  onChange: (data: IndustriesSection) => void;
  onSave?: () => void;
}

const iconOptions = [
  { value: "Hospital", label: "Hospital" },
  { value: "Building2", label: "Building" },
  { value: "Bike", label: "Bike" },
  { value: "Factory", label: "Factory" },
  { value: "Car", label: "Car" },
  { value: "Plane", label: "Plane" },
  { value: "ShoppingCart", label: "Shopping Cart" },
  { value: "Briefcase", label: "Briefcase" },
  { value: "Users", label: "Users" },
  { value: "Globe", label: "Globe" },
];

export function IndustriesSectionEditor({
  data,
  onChange,
  onSave,
}: IndustriesSectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<IndustriesSectionFormData>({
    resolver: zodResolver(industriesSectionSchema),
    defaultValues: {
      ...data,
      ctaText: data.ctaText || "",
      ctaLink: data.ctaLink || "",
      image: data.image || undefined,
    },
    mode: "onChange",
  });

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = async (formData: IndustriesSectionFormData) => {
    if (isSaving) return; // Prevent multiple submissions
    
    try {
      setIsSaving(true);
      onChange(formData);
      if (onSave) {
        await Promise.resolve(onSave()); // Handle both sync and async onSave
      }
    } catch (error) {
      console.error("Failed to save section:", error);
    } finally {
      // Add a small delay to show the loading state
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Industries Section</CardTitle>
          <CardDescription>
            Configure the industries section content and items
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
              rows={2}
              {...form.register("subtitle")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Call-to-Action Text</Label>
              <Input
                id="ctaText"
                placeholder="About us"
                {...form.register("ctaText")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaLink">Call-to-Action Link</Label>
              <Input
                id="ctaLink"
                placeholder="/about"
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
              <CardTitle>Industry Items</CardTitle>
              <CardDescription>
                Add and manage industry items with icons
              </CardDescription>
            </div>
            {/* <Button type="button" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Industry
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No industry items added yet</p>
              {/* <Button type="button" onClick={addItem}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Industry
              </Button> */}
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex flex-col items-center space-y-2">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => remove(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`items.${index}.title`}>
                              Title
                            </Label>
                            <Input
                              placeholder="Industry title"
                              {...form.register(`items.${index}.title`)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`items.${index}.icon`}>Icon</Label>
                            <Select
                              value={form.watch(`items.${index}.icon`)}
                              onValueChange={(value) => {
                                form.setValue(`items.${index}.icon`, value);
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {iconOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`items.${index}.description`}>
                            Description
                          </Label>
                          <Textarea
                            placeholder="Industry description"
                            rows={2}
                            {...form.register(`items.${index}.description`)}
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
            Configure the image displayed in the industries section
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
                        id: data.image?.id || "industries-image",
                        description:
                          data.image?.description ||
                          "Industries section image",
                        imageUrl,
                        imageHint:
                          data.image?.imageHint || "professional team working",
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

         
          {/* <div className="space-y-2">
            <Label htmlFor="imageHint">Image Hint (for AI generation)</Label>
            <Input
              id="imageHint"
              placeholder="professional team working"
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
          </div> */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the industries section
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

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Card Styling</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPickerInput
                label="Card Background Color"
                value={normalizeColorValue(
                  data.styling.cardStyle?.backgroundColor
                )}
                onChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      cardStyle: {
                        ...data.styling.cardStyle,
                        backgroundColor: value,
                      },
                    },
                  });
                }}
                supportGradient={true}
                gradientDirection="to-r"
              />

              <ColorPickerInput
                label="Card Hover Background"
                value={normalizeColorValue(
                  data.styling.cardStyle?.hoverBackgroundColor
                )}
                onChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      cardStyle: {
                        ...data.styling.cardStyle,
                        hoverBackgroundColor: value,
                      },
                    },
                  });
                }}
                supportGradient={true}
                gradientDirection="to-r"
              />

              <ColorPickerInput
                label="Card Border Color"
                value={normalizeColorValue(data.styling.cardStyle?.borderColor)}
                onChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      cardStyle: {
                        ...data.styling.cardStyle,
                        borderColor:
                          typeof value === "string" ? value : value[0],
                      },
                    },
                  });
                }}
                supportGradient={false}
              />

              <ColorPickerInput
                label="Card Hover Border Color"
                value={normalizeColorValue(
                  data.styling.cardStyle?.hoverBorderColor
                )}
                onChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      cardStyle: {
                        ...data.styling.cardStyle,
                        hoverBorderColor:
                          typeof value === "string" ? value : value[0],
                      },
                    },
                  });
                }}
                supportGradient={false}
              />
            </div>
          </div>
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

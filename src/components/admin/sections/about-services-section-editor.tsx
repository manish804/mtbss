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
import { aboutServicesSectionSchema } from "@/lib/validation/page-schemas";
import { Save, Trash2, GripVertical, Loader2 } from "lucide-react";
import { z } from "zod";
import { useFormSync } from "@/hooks/use-form-sync";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { normalizeColorValue } from "@/lib/color-utils";

type AboutServicesSectionFormData = z.infer<typeof aboutServicesSectionSchema>;

interface AboutServicesSectionEditorProps {
  data: AboutServicesSectionFormData;
  onChange: (data: AboutServicesSectionFormData) => void;
  onSave?: () => void;
}

export function AboutServicesSectionEditor({
  data,
  onChange,
  onSave,
}: AboutServicesSectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AboutServicesSectionFormData>({
    resolver: zodResolver(aboutServicesSectionSchema),
    defaultValues: {
      ...data,
      services: data.services || [],
    },
    mode: "onChange",
  });

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "services",
  });

  useFormSync(form, onChange, {
    validateBeforeSync: false,
    enableRealTimeSync: true,
    debounceMs: 500,
  });

  const onSubmit = async (formData: AboutServicesSectionFormData) => {
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
          <CardTitle>About Services Content</CardTitle>
          <CardDescription>
            Configure the about services section content
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
            <Input
              id="subtitle"
              placeholder="Enter subtitle..."
              {...form.register("subtitle")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter section description..."
              rows={4}
              {...form.register("description")}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ctaText">Call-to-Action Text</Label>
              <Input
                id="ctaText"
                placeholder="Learn More"
                {...form.register("ctaText")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaLink">Call-to-Action Link</Label>
              <Input
                id="ctaLink"
                placeholder="/services"
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
              <CardTitle>Services</CardTitle>
              <CardDescription>Configure services displayed in this section</CardDescription>
            </div>
            {/* <Button type="button" onClick={addService}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No services added yet</p>
              {/* <Button type="button" onClick={addService}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Service
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
                            <Label htmlFor={`services.${index}.title`}>Title</Label>
                            <Input
                              placeholder="Service title"
                              {...form.register(`services.${index}.title`)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`services.${index}.href`}>Link</Label>
                            <Input
                              placeholder="/services/service-name"
                              {...form.register(`services.${index}.href`)}
                            />
                          </div>
                        </div>

                        <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                          <h5 className="font-medium">Service Image</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`services.${index}.image.imageUrl`}>Image URL</Label>
                              <Input
                                placeholder="https://example.com/image.jpg"
                                value={form.watch(`services.${index}.image.imageUrl`) || ""}
                                onChange={(e) => {
                                  const imageUrl = e.target.value;
                                  form.setValue(`services.${index}.image`, {
                                    id: form.watch(`services.${index}.image.id`) || `service-${index}`,
                                    description: form.watch(`services.${index}.image.description`) || "Service image",
                                    imageUrl,
                                    imageHint: form.watch(`services.${index}.image.imageHint`) || "service image",
                                  });
                                }}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor={`services.${index}.image.description`}>Image Description</Label>
                              <Input
                                placeholder="Describe the image..."
                                value={form.watch(`services.${index}.image.description`) || ""}
                                onChange={(e) => {
                                  const currentImage = form.watch(`services.${index}.image`);
                                  form.setValue(`services.${index}.image`, {
                                    id: currentImage?.id || `service-${index}`,
                                    description: e.target.value,
                                    imageUrl: currentImage?.imageUrl || "",
                                    imageHint: currentImage?.imageHint || "service image",
                                  });
                                }}
                              />
                            </div>
                          </div>
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
          <CardTitle>Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the about services section
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

          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Button Styling</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ColorPickerInput
                label="Button Background Color"
                value={normalizeColorValue(
                  data.styling.buttonStyle?.backgroundColor
                )}
                onChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      buttonStyle: {
                        ...data.styling.buttonStyle,
                        backgroundColor: value,
                      },
                    },
                  });
                }}
                supportGradient={true}
                gradientDirection="to-r"
              />

              <ColorPickerInput
                label="Button Text Color"
                value={normalizeColorValue(data.styling.buttonStyle?.textColor)}
                onChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      buttonStyle: {
                        ...data.styling.buttonStyle,
                        textColor: typeof value === "string" ? value : value[0],
                      },
                    },
                  });
                }}
                supportGradient={false}
              />

              <ColorPickerInput
                label="Button Hover Background"
                value={normalizeColorValue(
                  data.styling.buttonStyle?.hoverBackgroundColor
                )}
                onChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      buttonStyle: {
                        ...data.styling.buttonStyle,
                        hoverBackgroundColor: value,
                      },
                    },
                  });
                }}
                supportGradient={true}
                gradientDirection="to-r"
              />

              <div className="space-y-2">
                <Label htmlFor="buttonSize">Button Size</Label>
                <Select
                  value={data.styling.buttonStyle?.size || "lg"}
                  onValueChange={(value) => {
                    onChange({
                      ...data,
                      styling: {
                        ...data.styling,
                        buttonStyle: {
                          ...data.styling.buttonStyle,
                          size: value,
                        },
                      },
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

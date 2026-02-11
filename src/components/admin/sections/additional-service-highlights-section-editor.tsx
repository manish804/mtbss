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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Trash2, Loader2 } from "lucide-react";
import { z } from "zod";
import {
  serviceHighlightItemSchema,
  sectionStylingSchema,
} from "@/lib/validation/page-schemas";
import { useFormSync } from "@/hooks/use-form-sync";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { normalizeColorValue } from "@/lib/color-utils";

const additionalServiceHighlightsSectionSchema = z.object({
  enabled: z.boolean(),
  title: z.string().optional(),
  items: z.array(serviceHighlightItemSchema),
  styling: sectionStylingSchema,
});

type AdditionalServiceHighlightsSectionFormData = z.infer<
  typeof additionalServiceHighlightsSectionSchema
>;

interface AdditionalServiceHighlightsSectionEditorProps {
  data: AdditionalServiceHighlightsSectionFormData;
  onChange: (data: AdditionalServiceHighlightsSectionFormData) => void;
  onSave?: () => void;
}

export function AdditionalServiceHighlightsSectionEditor({
  data,
  onChange,
  onSave,
}: AdditionalServiceHighlightsSectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<AdditionalServiceHighlightsSectionFormData>({
    resolver: zodResolver(additionalServiceHighlightsSectionSchema),
    defaultValues: {
      ...data,
      items: data.items || [],
    },
    mode: "onChange",
  });

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = async (formData: AdditionalServiceHighlightsSectionFormData) => {
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

  // const addHighlight = () => {
  //   append({ icon: "Briefcase", title: "New Service", description: "Service description" });
  // };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Additional Service Highlights Configuration</CardTitle>
          <CardDescription>
            Configure additional service highlights that appear at the bottom of
            service pages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="enabled"
              checked={data.enabled}
              onCheckedChange={(checked) => {
                onChange({
                  ...data,
                  enabled: checked,
                });
              }}
            />
            <Label htmlFor="enabled">
              Enable additional service highlights
            </Label>
          </div>

          {data.enabled && (
            <div className="space-y-4 pl-6 border-l-2 border-primary/20">
              <div className="space-y-2">
                <Label htmlFor="title">Section Title (Optional)</Label>
                <Input
                  id="title"
                  placeholder="Additional Services"
                  {...form.register("title")}
                />
                <p className="text-xs text-gray-500">
                  Leave empty to hide the section title
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {data.enabled && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Service Highlights</CardTitle>
                <CardDescription>
                  Add and manage additional service highlight items
                </CardDescription>
              </div>
              {/* <Button type="button" onClick={addHighlight}>
                <Plus className="h-4 w-4 mr-2" />
                Add Highlight
              </Button> */}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Highlight {index + 1}</h4>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`items.${index}.icon`}>Icon *</Label>
                    <Input
                      id={`items.${index}.icon`}
                      placeholder="Briefcase"
                      {...form.register(`items.${index}.icon`)}
                    />
                    {form.formState.errors.items?.[index]?.icon && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.items[index]?.icon?.message}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Use Lucide icon names (e.g., Briefcase, FileText,
                      Handshake)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`items.${index}.title`}>Title *</Label>
                    <Input
                      id={`items.${index}.title`}
                      placeholder="Professional Tax Preparation"
                      {...form.register(`items.${index}.title`)}
                    />
                    {form.formState.errors.items?.[index]?.title && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.items[index]?.title?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.description`}>
                    Description *
                  </Label>
                  <Textarea
                    id={`items.${index}.description`}
                    placeholder="Hire a professional and take the stress out of taxes."
                    rows={3}
                    {...form.register(`items.${index}.description`)}
                  />
                  {form.formState.errors.items?.[index]?.description && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.items[index]?.description?.message}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="mb-4">No service highlights added yet</p>
                {/* <Button type="button" onClick={addHighlight}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Highlight
                </Button> */}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {data.enabled && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Section Styling</CardTitle>
              <CardDescription>
                Customize the appearance of the additional service highlights
                section
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
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

                  {Array.isArray(data.styling.backgroundColor) && (
                    <div className="space-y-2">
                      <Label htmlFor="gradientDirection">
                        Gradient Direction
                      </Label>
                      <Select
                        value={data.styling.gradientDirection || "to-r"}
                        onValueChange={(
                          value: "to-r" | "to-b" | "to-br" | "to-bl"
                        ) => {
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
                </div>

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
                    value={data.styling.padding || "py-10 md:py-12"}
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
                      <SelectItem value="py-8 md:py-10">Small</SelectItem>
                      <SelectItem value="py-10 md:py-12">Medium</SelectItem>
                      <SelectItem value="py-12 md:py-16">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Highlight Card Styling</CardTitle>
              <CardDescription>
                Customize the appearance of individual service highlight cards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                />

                <div className="space-y-2">
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <Select
                    value={data.styling.cardStyle?.borderRadius || "rounded-lg"}
                    onValueChange={(value) => {
                      onChange({
                        ...data,
                        styling: {
                          ...data.styling,
                          cardStyle: {
                            ...data.styling.cardStyle,
                            borderRadius: value,
                          },
                        },
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded-none">None</SelectItem>
                      <SelectItem value="rounded-sm">Small</SelectItem>
                      <SelectItem value="rounded-md">Medium</SelectItem>
                      <SelectItem value="rounded-lg">Large</SelectItem>
                      <SelectItem value="rounded-xl">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardPadding">Card Padding</Label>
                  <Select
                    value={data.styling.cardStyle?.padding || "p-6"}
                    onValueChange={(value) => {
                      onChange({
                        ...data,
                        styling: {
                          ...data.styling,
                          cardStyle: {
                            ...data.styling.cardStyle,
                            padding: value,
                          },
                        },
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p-4">Small</SelectItem>
                      <SelectItem value="p-6">Medium</SelectItem>
                      <SelectItem value="p-8">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

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

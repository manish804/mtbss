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
import { Save, Trash2, GripVertical, Loader2 } from "lucide-react";
import { useFormSync } from "@/hooks/use-form-sync";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { normalizeColorValue } from "@/lib/color-utils";
import { z } from "zod";
import { valueItemSchema, sectionStylingSchema } from "@/lib/validation/page-schemas";

const valuesSectionSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  items: z.array(valueItemSchema),
  styling: sectionStylingSchema,
});

type ValuesSectionFormData = z.infer<typeof valuesSectionSchema>;

interface ValuesSectionEditorProps {
  data: ValuesSectionFormData;
  onChange: (data: ValuesSectionFormData) => void;
  onSave?: () => void;
}

export function ValuesSectionEditor({
  data,
  onChange,
  onSave,
}: ValuesSectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ValuesSectionFormData>({
    resolver: zodResolver(valuesSectionSchema),
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

  const onSubmit = async (formData: ValuesSectionFormData) => {
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
          <CardTitle>Values Section</CardTitle>
          <CardDescription>
            Configure the values section content
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Values</CardTitle>
              <CardDescription>
                Add company values and principles
              </CardDescription>
            </div>

          </div>
        </CardHeader>
        <CardContent>
          {fields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No values added yet</p>

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
                            <Label htmlFor={`items.${index}.number`}>
                              Number
                            </Label>
                            <Input
                              type="number"
                              placeholder="1"
                              {...form.register(`items.${index}.number`, {
                                valueAsNumber: true,
                              })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`items.${index}.title`}>
                              Title
                            </Label>
                            <Input
                              placeholder="Value title"
                              {...form.register(`items.${index}.title`)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`items.${index}.description`}>
                            Description
                          </Label>
                          <Textarea
                            placeholder="Value description"
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
          <CardTitle>Styling</CardTitle>
          <CardDescription>
            Customize the appearance of the values section
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
                  <SelectItem value="py-8 px-4">Small</SelectItem>
                  <SelectItem value="py-10 md:py-12">Medium</SelectItem>
                  <SelectItem value="py-16 px-4">Large</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="cardBorderRadius">Card Border Radius</Label>
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

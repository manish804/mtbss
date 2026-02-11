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

import { customersSectionSchema } from "@/lib/validation/page-schemas";
import { Save, Trash2, GripVertical, Star, Loader2 } from "lucide-react";
import type { CustomersSection } from "@/lib/types/page";
import { z } from "zod";
import { useFormSync } from "@/hooks/use-form-sync";
import { ColorPickerInput } from "@/components/ui/color-picker-input";
import { normalizeColorValue } from "@/lib/color-utils";

type CustomersSectionFormData = z.infer<typeof customersSectionSchema>;

interface CustomersSectionEditorProps {
  data: CustomersSection;
  onChange: (data: CustomersSection) => void;
  onSave?: () => void;
}

export function CustomersSectionEditor({
  data,
  onChange,
  onSave,
}: CustomersSectionEditorProps) {
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CustomersSectionFormData>({
    resolver: zodResolver(customersSectionSchema),
    defaultValues: {
      ...data,
      customerLogos: data.customerLogos || [],
      testimonials: data.testimonials || [],
    },
    mode: "onChange",
  });

  const { fields: testimonialFields, remove: removeTestimonial } = useFieldArray({
    control: form.control,
    name: "testimonials",
  });

  useFormSync(form, onChange, { validateBeforeSync: false });

  const onSubmit = async (formData: CustomersSectionFormData) => {
    
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };


  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customers Section</CardTitle>
          <CardDescription>
            Configure the customer testimonials section
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Customer Testimonials</CardTitle>
              <CardDescription>
                Add customer reviews and testimonials
              </CardDescription>
            </div>
            {/* <Button type="button" onClick={addTestimonial}>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          {testimonialFields.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No testimonials added yet</p>
              {/* <Button type="button" onClick={addTestimonial}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Testimonial
              </Button> */}
            </div>
          ) : (
            <div className="space-y-6">
              {testimonialFields.map((field, index) => (
                <Card key={field.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="pt-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex flex-col items-center space-y-2">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => removeTestimonial(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`testimonials.${index}.name`}>
                              Customer Name
                            </Label>
                            <Input
                              placeholder="John Doe"
                              {...form.register(`testimonials.${index}.name`)}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`testimonials.${index}.company`}>
                              Company
                            </Label>
                            <Input
                              placeholder="Company Name"
                              {...form.register(
                                `testimonials.${index}.company`
                              )}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`testimonials.${index}.content`}>
                            Testimonial
                          </Label>
                          <Textarea
                            placeholder="Enter the customer testimonial..."
                            rows={3}
                            {...form.register(`testimonials.${index}.content`)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`testimonials.${index}.rating`}>
                            Rating
                          </Label>
                          <div className="flex items-center space-x-4">
                            <Select
                              value={form
                                .watch(`testimonials.${index}.rating`)
                                ?.toString()}
                              onValueChange={(value) => {
                                form.setValue(
                                  `testimonials.${index}.rating`,
                                  parseInt(value)
                                );
                              }}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 Star</SelectItem>
                                <SelectItem value="2">2 Stars</SelectItem>
                                <SelectItem value="3">3 Stars</SelectItem>
                                <SelectItem value="4">4 Stars</SelectItem>
                                <SelectItem value="5">5 Stars</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="flex space-x-1">
                              {renderStars(
                                form.watch(`testimonials.${index}.rating`) || 5
                              )}
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
            Customize the appearance of the customers section
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
                label="Card Shadow Color"
                value={normalizeColorValue(data.styling.cardStyle?.shadowColor)}
                onChange={(value) => {
                  onChange({
                    ...data,
                    styling: {
                      ...data.styling,
                      cardStyle: {
                        ...data.styling.cardStyle,
                        shadowColor:
                          typeof value === "string" ? value : value[0],
                      },
                    },
                  });
                }}
                supportGradient={false}
              />

              <div className="space-y-2">
                <Label htmlFor="cardBorderRadius">Card Border Radius</Label>
                <Select
                  value={data.styling.cardStyle?.borderRadius || "rounded-xl"}
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
                  value={data.styling.cardStyle?.padding || "p-8"}
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

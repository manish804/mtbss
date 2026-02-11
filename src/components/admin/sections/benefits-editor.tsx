"use client";

import React, { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Save } from "lucide-react";
import { ContentDataBenefit, BenefitFormData } from "@/lib/types/content-data";

interface BenefitsEditorProps {
  benefits: ContentDataBenefit[];
  onChange: (benefits: ContentDataBenefit[]) => void;
  onSave: (benefits: ContentDataBenefit[]) => void;
}

const BENEFIT_CATEGORIES = [
  { value: "health", label: "Health & Wellness" },
  { value: "financial", label: "Financial" },
  { value: "flexibility", label: "Work Flexibility" },
  { value: "growth", label: "Professional Growth" },
  { value: "time-off", label: "Time Off" },
  { value: "wellness", label: "Wellness Programs" },
  { value: "technology", label: "Technology" },
];

const BENEFIT_COLORS = [
  { value: "emerald", label: "Emerald" },
  { value: "blue", label: "Blue" },
  { value: "purple", label: "Purple" },
  { value: "orange", label: "Orange" },
  { value: "green", label: "Green" },
  { value: "pink", label: "Pink" },
  { value: "indigo", label: "Indigo" },
  { value: "yellow", label: "Yellow" },
  { value: "red", label: "Red" },
];

const COMMON_ICONS = [
  "Heart",
  "PiggyBank",
  "Home",
  "GraduationCap",
  "Calendar",
  "Dumbbell",
  "Laptop",
  "Trophy",
  "Shield",
  "Clock",
  "Coffee",
  "Car",
  "Plane",
  "Book",
  "Users",
];

export function BenefitsEditor({
  benefits,
  onChange,
  onSave,
}: BenefitsEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<BenefitFormData>({
    title: "",
    description: "",
    icon: "Heart",
    category: "health",
    color: "emerald",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      icon: "Heart",
      category: "health",
      color: "emerald",
    });
  };

  const handleEdit = (benefit: ContentDataBenefit) => {
    setEditingId(benefit.id);
    setFormData({
      title: benefit.title,
      description: benefit.description,
      icon: benefit.icon,
      category: benefit.category,
      color: benefit.color,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
  };

  const handleSave = () => {
    const newBenefit: ContentDataBenefit = {
      id: editingId || `benefit-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      category: formData.category,
      color: formData.color,
    };

    let updatedBenefits;
    if (isCreating) {
      updatedBenefits = [...benefits, newBenefit];
    } else {
      updatedBenefits = benefits.map((b) =>
        b.id === editingId ? newBenefit : b
      );
    }

    onChange(updatedBenefits);
    handleCancel();
  };

  const handleDelete = (id: string) => {
    const updatedBenefits = benefits.filter((b) => b.id !== id);
    onChange(updatedBenefits);
  };

  const handleSaveAll = () => {
    onSave(benefits);
  };

  const getCategoryLabel = (category: string) => {
    return (
      BENEFIT_CATEGORIES.find((c) => c.value === category)?.label || category
    );
  };

  const getColorBadge = (color: string) => {
    const colorClasses = {
      emerald: "bg-emerald-100 text-emerald-800",
      blue: "bg-blue-100 text-blue-800",
      purple: "bg-purple-100 text-purple-800",
      orange: "bg-orange-100 text-orange-800",
      green: "bg-green-100 text-green-800",
      pink: "bg-pink-100 text-pink-800",
      indigo: "bg-indigo-100 text-indigo-800",
      yellow: "bg-yellow-100 text-yellow-800",
      red: "bg-red-100 text-red-800",
    };

    return (
      <Badge
        className={
          colorClasses[color as keyof typeof colorClasses] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {color}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Benefits ({benefits.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage employee benefits and perks
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSaveAll} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Benefits
          </Button>
        </div>
      </div>

      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? "Create New Benefit" : "Edit Benefit"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Benefit Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Comprehensive Health Coverage"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {BENEFIT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed description of the benefit"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) =>
                    setFormData({ ...formData, icon: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_ICONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="color">Color Theme</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) =>
                    setFormData({ ...formData, color: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {BENEFIT_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.title || !formData.description}
              >
                {isCreating ? "Create Benefit" : "Update Benefit"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {benefits.map((benefit) => (
          <Card key={benefit.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">{benefit.title}</h4>
                    <Badge variant="outline">
                      {getCategoryLabel(benefit.category)}
                    </Badge>
                    {getColorBadge(benefit.color)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {benefit.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Icon: {benefit.icon}</span>
                    <span>ID: {benefit.id}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(benefit)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(benefit.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {benefits.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No benefits configured yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

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
import {
  ContentDataCompanyCulture,
  CompanyCultureFormData,
} from "@/lib/types/content-data";

interface CompanyCultureEditorProps {
  companyCulture: ContentDataCompanyCulture[];
  onChange: (companyCulture: ContentDataCompanyCulture[]) => void;
  onSave: (companyCulture: ContentDataCompanyCulture[]) => void;
}

const CULTURE_COLORS = [
  { value: "yellow", label: "Yellow" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "purple", label: "Purple" },
  { value: "indigo", label: "Indigo" },
  { value: "orange", label: "Orange" },
  { value: "pink", label: "Pink" },
  { value: "emerald", label: "Emerald" },
];

const CULTURE_ICONS = [
  "Lightbulb",
  "Users",
  "TrendingUp",
  "Target",
  "Scale",
  "MessageCircle",
  "Heart",
  "Star",
  "Award",
  "Zap",
  "Shield",
  "Compass",
  "Rocket",
  "Globe",
  "Handshake",
];

export function CompanyCultureEditor({
  companyCulture,
  onChange,
  onSave,
}: CompanyCultureEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CompanyCultureFormData>({
    title: "",
    description: "",
    icon: "Lightbulb",
    color: "yellow",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      icon: "Lightbulb",
      color: "yellow",
    });
  };

  const handleEdit = (culture: ContentDataCompanyCulture) => {
    setEditingId(culture.id);
    setFormData({
      title: culture.title,
      description: culture.description,
      icon: culture.icon,
      color: culture.color,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
  };

  const handleSave = () => {
    const newCulture: ContentDataCompanyCulture = {
      id: editingId || `culture-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      icon: formData.icon,
      color: formData.color,
    };

    let updatedCulture;
    if (isCreating) {
      updatedCulture = [...companyCulture, newCulture];
    } else {
      updatedCulture = companyCulture.map((c) =>
        c.id === editingId ? newCulture : c
      );
    }

    onChange(updatedCulture);
    handleCancel();
  };

  const handleDelete = (id: string) => {
    const updatedCulture = companyCulture.filter((c) => c.id !== id);
    onChange(updatedCulture);
  };

  const handleSaveAll = () => {
    onSave(companyCulture);
  };

  const getColorBadge = (color: string) => {
    const colorClasses = {
      yellow: "bg-yellow-100 text-yellow-800",
      blue: "bg-blue-100 text-blue-800",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
      purple: "bg-purple-100 text-purple-800",
      indigo: "bg-indigo-100 text-indigo-800",
      orange: "bg-orange-100 text-orange-800",
      pink: "bg-pink-100 text-pink-800",
      emerald: "bg-emerald-100 text-emerald-800",
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
            Company Culture ({companyCulture.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage company culture values and principles
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSaveAll} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Culture Values
          </Button>
        </div>
      </div>

      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? "Create New Culture Value" : "Edit Culture Value"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Culture Value Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Innovation First"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe what this culture value means to your organization"
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
                    {CULTURE_ICONS.map((icon) => (
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
                    {CULTURE_COLORS.map((color) => (
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
                {isCreating ? "Create Culture Value" : "Update Culture Value"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {companyCulture.map((culture) => (
          <Card key={culture.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">{culture.title}</h4>
                    {getColorBadge(culture.color)}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {culture.description}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Icon: {culture.icon}</span>
                    <span>ID: {culture.id}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(culture)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(culture.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {companyCulture.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No company culture values configured yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

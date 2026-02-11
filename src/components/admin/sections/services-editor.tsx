"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Save, X, ExternalLink } from "lucide-react";
import { ContentDataService, ServiceFormData } from "@/lib/types/content-data";

interface ServicesEditorProps {
  services: ContentDataService[];
  onChange: (services: ContentDataService[]) => void;
  onSave: (services: ContentDataService[]) => void;
}

export function ServicesEditor({
  services,
  onChange,
  onSave,
}: ServicesEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    description: "",
    shortDescription: "",
    features: [""],
    imageUrl: "",
    imageDescription: "",
    imageHint: "",
    ctaText: "Learn More",
    ctaLink: "/contact",
    published: true,
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      shortDescription: "",
      features: [""],
      imageUrl: "",
      imageDescription: "",
      imageHint: "",
      ctaText: "Learn More",
      ctaLink: "/contact",
      published: true,
    });
  };

  const handleEdit = (service: ContentDataService) => {
    setEditingId(service.id);
    setFormData({
      title: service.title,
      description: service.description,
      shortDescription: service.shortDescription,
      features: service.features,
      imageUrl: service.image.imageUrl,
      imageDescription: service.image.description,
      imageHint: service.image.imageHint,
      ctaText: service.ctaText,
      ctaLink: service.ctaLink,
      published: service.published,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    resetForm();
  };

  const handleSave = () => {
    const newService: ContentDataService = {
      id: editingId || `service-${Date.now()}`,
      type: "service",
      slug: formData.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
      title: formData.title,
      description: formData.description,
      shortDescription: formData.shortDescription,
      features: formData.features.filter((f) => f.trim() !== ""),
      image: {
        id: `service-${formData.title.toLowerCase().replace(/\s+/g, "-")}`,
        description: formData.imageDescription,
        imageUrl: formData.imageUrl,
        imageHint: formData.imageHint,
      },
      ctaText: formData.ctaText,
      ctaLink: formData.ctaLink,
      styling: {
        cardStyle: {
          backgroundColor: "bg-white",
          textColor: "text-gray-900",
          borderColor: "border-blue-200",
          hoverBackgroundColor: "hover:bg-blue-50",
          hoverBorderColor: "hover:border-blue-300",
          shadowColor: "shadow-lg",
          hoverShadowColor: "hover:shadow-xl",
        },
        buttonStyle: {
          backgroundColor: "bg-blue-600",
          textColor: "text-white",
          hoverBackgroundColor: "hover:bg-blue-700",
          variant: "primary",
        },
      },
      published: formData.published,
      lastModified: new Date().toISOString(),
    };

    let updatedServices;
    if (isCreating) {
      updatedServices = [...services, newService];
    } else {
      updatedServices = services.map((s) =>
        s.id === editingId ? newService : s
      );
    }

    onChange(updatedServices);
    handleCancel();
  };

  const handleDelete = (id: string) => {
    const updatedServices = services.filter((s) => s.id !== id);
    onChange(updatedServices);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const handleSaveAll = () => {
    onSave(services);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Services ({services.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage the services offered by your company
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSaveAll} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Services
          </Button>
        </div>
      </div>

      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? "Create New Service" : "Edit Service"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Tax Returns"
                />
              </div>
              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  placeholder="Brief description for cards"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Detailed description of the service"
                rows={3}
              />
            </div>

            <div>
              <Label>Features</Label>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 mt-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    placeholder="Service feature"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature(index)}
                    disabled={formData.features.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="imageDescription">Image Description</Label>
                <Input
                  id="imageDescription"
                  value={formData.imageDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      imageDescription: e.target.value,
                    })
                  }
                  placeholder="Alt text for the image"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ctaText">CTA Button Text</Label>
                <Input
                  id="ctaText"
                  value={formData.ctaText}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaText: e.target.value })
                  }
                  placeholder="Learn More"
                />
              </div>
              <div>
                <Label htmlFor="ctaLink">CTA Link</Label>
                <Input
                  id="ctaLink"
                  value={formData.ctaLink}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaLink: e.target.value })
                  }
                  placeholder="/contact"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked })
                  }
                />
                <Label htmlFor="published">Published</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {isCreating ? "Create Service" : "Update Service"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-semibold">{service.title}</h4>
                    <Badge
                      variant={service.published ? "default" : "secondary"}
                    >
                      {service.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {service.shortDescription}
                  </p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>{service.features.length} features</span>
                    <span>Slug: {service.slug}</span>
                    {service.ctaLink && (
                      <a
                        href={service.ctaLink}
                        className="flex items-center hover:text-blue-600"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        {service.ctaText}
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {services.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No services configured yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

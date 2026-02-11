"use client";

import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface KeyLabelItem {
  key: string;
  label: string;
}

interface KeyValueListSectionEditorProps {
  data: KeyLabelItem[];
  onChange: (data: KeyLabelItem[]) => void;
  onSave?: () => void;
  title: string;
  description: string;
  itemLabel?: string;
  protectedKeys?: string[];
}

export function KeyValueListSectionEditor({
  data,
  onChange,
  onSave,
  title,
  description,
  itemLabel = "Item",
  protectedKeys = ["all"],
}: KeyValueListSectionEditorProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<KeyLabelItem>({
    key: "",
    label: "",
  });
  const { toast } = useToast();

  const protectedKeySet = useMemo(() => new Set(protectedKeys), [protectedKeys]);

  const resetForm = () => {
    setFormData({ key: "", label: "" });
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingKey(null);
    resetForm();
  };

  const handleEdit = (item: KeyLabelItem) => {
    setEditingKey(item.key);
    setIsCreating(false);
    setFormData({
      key: item.key,
      label: item.label,
    });
  };

  const handleCancel = () => {
    setEditingKey(null);
    setIsCreating(false);
    resetForm();
  };

  const handleSave = () => {
    const key = formData.key.trim();
    const label = formData.label.trim();

    if (!key || !label) {
      toast({
        title: "Invalid input",
        description: "Both key and label are required.",
        variant: "destructive",
      });
      return;
    }

    if (
      data.some((item) => item.key === key && (!editingKey || item.key !== editingKey))
    ) {
      toast({
        title: "Duplicate key",
        description: `An item with key "${key}" already exists.`,
        variant: "destructive",
      });
      return;
    }

    const newItem: KeyLabelItem = { key, label };
    const updatedItems = isCreating
      ? [...data, newItem]
      : data.map((item) => (item.key === editingKey ? newItem : item));

    onChange(updatedItems);
    handleCancel();
  };

  const handleDelete = (key: string) => {
    if (protectedKeySet.has(key)) {
      toast({
        title: "Protected item",
        description: `Cannot delete "${key}" from this list.`,
        variant: "destructive",
      });
      return;
    }

    onChange(data.filter((item) => item.key !== key));
  };

  const handleSaveAll = () => {
    onSave?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {title} ({data.length})
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleCreate} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add {itemLabel}
          </Button>
          <Button onClick={handleSaveAll} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save {title}
          </Button>
        </div>
      </div>

      {(isCreating || editingKey) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? `Create ${itemLabel}` : `Edit ${itemLabel}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item-label">Label</Label>
                <Input
                  id="item-label"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, label: e.target.value }))
                  }
                  placeholder={`Enter ${itemLabel.toLowerCase()} label`}
                />
              </div>
              <div>
                <Label htmlFor="item-key">Key</Label>
                <Input
                  id="item-key"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, key: e.target.value }))
                  }
                  disabled={!isCreating}
                  placeholder={`Enter ${itemLabel.toLowerCase()} key`}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Keys are stable identifiers used by filters and references.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save {itemLabel}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {data.map((item) => (
          <Card key={item.key}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold">{item.label}</h4>
                    {protectedKeySet.has(item.key) && (
                      <Badge variant="secondary">Protected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Key: <code className="bg-gray-100 px-1 rounded">{item.key}</code>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(item.key)}
                    disabled={protectedKeySet.has(item.key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {data.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No {itemLabel.toLowerCase()} entries configured yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

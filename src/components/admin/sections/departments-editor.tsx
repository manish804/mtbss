"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Save, Plus } from "lucide-react";
import {
  ContentDataDepartment,
  DepartmentFormData,
} from "@/lib/types/content-data";
import { useToast } from "@/hooks/use-toast";

interface DepartmentsEditorProps {
  departments: ContentDataDepartment[];
  onChange: (departments: ContentDataDepartment[]) => void;
  onSave: (departments: ContentDataDepartment[]) => void;
}

export function DepartmentsEditor({
  departments,
  onChange,
  onSave,
}: DepartmentsEditorProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<DepartmentFormData>({
    key: "",
    label: "",
  });
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      key: "",
      label: "",
    });
  };

  const handleEdit = (department: ContentDataDepartment) => {
    setEditingKey(department.key);
    setFormData({
      key: department.key,
      label: department.label,
    });
  };

  const handleCancel = () => {
    setEditingKey(null);
    setIsCreating(false);
    resetForm();
  };

  const handleStartCreate = () => {
    setEditingKey(null);
    setIsCreating(true);
    resetForm();
  };

  const handleSave = () => {
    const newDepartment: ContentDataDepartment = {
      key: formData.key,
      label: formData.label,
    };

    let updatedDepartments;
    if (isCreating) {
      if (departments.some((d) => d.key === formData.key)) {
        toast({
          title: "Error",
          description:
            "Department key already exists. Please use a unique key.",
          variant: "destructive",
        });
        return;
      }
      updatedDepartments = [...departments, newDepartment];
    } else {
      updatedDepartments = departments.map((d) =>
        d.key === editingKey ? newDepartment : d
      );
    }

    onChange(updatedDepartments);
    handleCancel();
  };

  const handleDelete = (key: string) => {
    if (key === "all") {
      toast({
        title: "Error",
        description: 'Cannot delete the "All Departments" filter.',
        variant: "destructive",
      });
      return;
    }

    const updatedDepartments = departments.filter((d) => d.key !== key);
    onChange(updatedDepartments);
  };

  const handleKeyChange = (value: string) => {
    const key = value
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setFormData({ ...formData, key, label: value });
  };

  const handleSaveAll = () => {
    onSave(departments);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            Departments ({departments.length})
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage department categories for job filtering
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleStartCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
          <Button onClick={handleSaveAll} variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save Departments
          </Button>
        </div>
      </div>

      {(isCreating || editingKey) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? "Create New Department" : "Edit Department"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="label">Department Label</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => handleKeyChange(e.target.value)}
                  placeholder="e.g., Finance & Accounting"
                />
              </div>
              <div>
                <Label htmlFor="key">Department Key</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({ ...formData, key: e.target.value })
                  }
                  placeholder="e.g., finance"
                  disabled={!isCreating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Used for filtering and URL parameters. Cannot be changed after
                  creation.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!formData.key || !formData.label}
              >
                {isCreating ? "Create Department" : "Update Department"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {departments.map((department) => (
          <Card key={department.key}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold">{department.label}</h4>
                    {department.key === "all" && (
                      <Badge variant="secondary">Default Filter</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Key:{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {department.key}
                    </code>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(department)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(department.key)}
                    disabled={department.key === "all"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {departments.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">
                No departments configured yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, use, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useDepartments } from "@/hooks/use-departments";

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  contactNumber: string;
}

export default function EditEmployeePage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const router = useRouter();
  const { employeeId } = use(params);
  const { toast } = useToast();
  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
    getDepartmentLabel,
  } = useDepartments();
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    department: "",
    designation: "",
    contactNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchEmployee = useCallback(async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`);
      if (response.ok) {
        const result = await response.json();
        const employee: Employee = result.data;
        setFormData({
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          department: employee.department,
          designation: employee.designation,
          contactNumber: employee.contactNumber,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch employee details",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch employee details",
        variant: "destructive",
      });
    } finally {
      setFetching(false);
    }
  }, [employeeId, toast]);

  useEffect(() => {
    void fetchEmployee();
  }, [fetchEmployee]);

  const departmentOptions = useMemo(() => {
    const hasCurrentOption = departments.some(
      (department) => department.key === formData.department
    );

    if (!formData.department || hasCurrentOption) {
      return departments;
    }

    return [
      ...departments,
      {
        key: formData.department,
        label: `${getDepartmentLabel(formData.department)} (Unlisted)`,
      },
    ];
  }, [departments, formData.department, getDepartmentLabel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department) {
      toast({
        title: "Error",
        description: "Please select a valid department",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
        router.push("/admin/employees");
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.error || "Failed to update employee",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update employee",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (fetching) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Edit Employee</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="designation">Designation</Label>
              <Input
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full border rounded-md px-3 py-2"
                required
                disabled={departmentsLoading || departmentOptions.length === 0}
              >
                {departmentsLoading && <option value="">Loading departments...</option>}
                {!departmentsLoading && departmentOptions.length === 0 && (
                  <option value="">No departments configured</option>
                )}
                {departmentOptions.map((department) => (
                  <option key={department.key} value={department.key}>
                    {department.label}
                  </option>
                ))}
              </select>
              {departmentsError && (
                <p className="text-red-500 text-sm mt-1">{departmentsError}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Employee"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useDepartments } from "@/hooks/use-departments";

export default function AddEmployeePage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    departments,
    loading: departmentsLoading,
    error: departmentsError,
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

  useEffect(() => {
    if (!formData.department && departments.length > 0) {
      setFormData((prev) => ({ ...prev, department: departments[0].key }));
    }
  }, [departments, formData.department]);

  const handleInputChange = useCallback((field: keyof typeof formData) => 
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
    }, []);

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
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Employee added successfully",
        });
        router.push("/admin/employees");
      } else {
        let errorMessage = "Failed to add employee";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch {}
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Add Employee</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            required
            className="w-full border rounded-md px-3 py-2"
            value={formData.name}
            onChange={handleInputChange('name')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Employee ID</label>
          <input
            type="text"
            required
            className="w-full border rounded-md px-3 py-2"
            value={formData.employeeId}
            onChange={handleInputChange('employeeId')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Designation</label>
          <input
            type="text"
            required
            className="w-full border rounded-md px-3 py-2"
            value={formData.designation}
            onChange={handleInputChange('designation')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            className="w-full border rounded-md px-3 py-2"
            value={formData.email}
            onChange={handleInputChange('email')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contact Number</label>
          <input
            type="text"
            required
            className="w-full border rounded-md px-3 py-2"
            value={formData.contactNumber}
            onChange={handleInputChange('contactNumber')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select
            required
            className="w-full border rounded-md px-3 py-2"
            value={formData.department}
            onChange={handleInputChange('department')}
            disabled={departmentsLoading || departments.length === 0}
          >
            {departmentsLoading && <option value="">Loading departments...</option>}
            {!departmentsLoading && departments.length === 0 && (
              <option value="">No departments configured</option>
            )}
            {departments.map((department) => (
              <option key={department.key} value={department.key}>
                {department.label}
              </option>
            ))}
          </select>
          {departmentsError && (
            <p className="text-red-500 text-sm mt-1">{departmentsError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || departmentsLoading || departments.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
        >
          {loading ? "Adding..." : "Add Employee"}
        </button>
      </form>
    </div>
  );
}

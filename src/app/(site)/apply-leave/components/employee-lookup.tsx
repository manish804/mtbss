"use client";

import { memo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useDepartments } from "@/hooks/use-departments";

interface Employee {
  name: string;
  department: string;
  designation: string;
  contactNumber: string;
  email?: string;
}

interface EmployeeLookupProps {
  onEmployeeFound: (employee: Employee, employeeId: string) => void;
}

export const EmployeeLookup = memo(function EmployeeLookup({
  onEmployeeFound,
}: EmployeeLookupProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchEmployee = useCallback(async () => {
    if (!employeeId.trim()) {
      setError("Please enter an employee ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/employees/${employeeId}`);
      if (res.ok) {
        const emp = await res.json();
        if (emp?.data) {
          onEmployeeFound(emp.data, employeeId);
        } else {
          setError("Employee not found");
        }
      } else {
        setError("Employee not found");
      }
    } catch {
      setError("Failed to fetch employee details");
    } finally {
      setLoading(false);
    }
  }, [employeeId, onEmployeeFound]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchEmployee();
    }
  }, [fetchEmployee]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="employeeId">Employee ID</Label>
        <div className="flex gap-2">
          <Input
            id="employeeId"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your employee ID"
            disabled={loading}
          />
          <Button 
            onClick={fetchEmployee} 
            disabled={loading || !employeeId.trim()}
          >
            {loading ? "Checking..." : "Verify"}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
});

interface EmployeeDisplayProps {
  employee: Employee;
}

export const EmployeeDisplay = memo(function EmployeeDisplay({
  employee,
}: EmployeeDisplayProps) {
  const { getDepartmentLabel } = useDepartments();

  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">Employee Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <p><span className="font-medium">Name:</span> {employee.name}</p>
          <p><span className="font-medium">Department:</span> {getDepartmentLabel(employee.department)}</p>
          <p><span className="font-medium">Designation:</span> {employee.designation}</p>
          <p><span className="font-medium">Contact:</span> {employee.contactNumber}</p>
          <p className="sm:col-span-2">
            <span className="font-medium">Email:</span> {employee.email || 'N/A'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
});

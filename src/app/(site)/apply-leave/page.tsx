"use client";

import { useState, useCallback } from "react";
import { EmployeeLookup, EmployeeDisplay } from "./components/employee-lookup";
import { LeaveFormComponent } from "./components/leave-form";

interface Employee {
  name: string;
  department: string;
  designation: string;
  contactNumber: string;
  email?: string;
}

export default function ApplyLeavePage() {
  const [employeeId, setEmployeeId] = useState("");
  const [employee, setEmployee] = useState<Employee | null>(null);

  const handleEmployeeFound = useCallback((emp: Employee, empId: string) => {
    setEmployee(emp);
    setEmployeeId(empId);
  }, []);

  const handleFormSuccess = useCallback(() => {
    // Reset form after successful submission
    setEmployee(null);
    setEmployeeId("");
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold mb-2">Apply for Leave</h1>
        <p className="text-gray-600 text-sm">
          Please verify your employee details before submitting your leave request.
        </p>
      </div>

      {/* Employee Lookup Section */}
      {!employee && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Employee Verification</h2>
          <EmployeeLookup onEmployeeFound={handleEmployeeFound} />
        </div>
      )}

      {/* Employee Details Display */}
      {employee && (
        <div className="space-y-6">
          <EmployeeDisplay employee={employee} />
          
          {/* Leave Application Form */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Leave Application</h2>
            <LeaveFormComponent 
              employeeId={employeeId} 
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}
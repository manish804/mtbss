"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useDepartments } from "@/hooks/use-departments";

interface LeaveRequest {
  id: string;
  employeeName: string;
  department: string;
  designation: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  appliedDays: number;
  reason: string;
  isHalfDay: boolean;
  isPaidLeave: boolean;
  email: string;
}

export default function ApproveLeave() {
  const { getDepartmentLabel } = useDepartments();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [leave, setLeave] = useState<LeaveRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) {
      toast({
        title: "Error",
        description: "No leave request ID provided",
        variant: "destructive",
      });
      router.push("/admin/leaves");
      return;
    }

    const fetchLeave = async () => {
      try {
        setFetching(true);
        const response = await fetch(`/api/leave-requests/${id}`);
        if (response.ok) {
          const data = await response.json();
          setLeave(data);
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch leave request details",
            variant: "destructive",
          });
          router.push("/admin/leaves");
        }
      } catch (error) {
        console.error("Failed to fetch leave request:", error);
        toast({
          title: "Error",
          description: "Failed to fetch leave request details",
          variant: "destructive",
        });
        router.push("/admin/leaves");
      } finally {
        setFetching(false);
      }
    };
    fetchLeave();
  }, [id, toast, router]);

  const handleApprove = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED", reviewNotes: notes }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Leave request approved successfully",
        });
        router.push("/admin/leaves");
      } else {
        toast({
          title: "Error",
          description: "Failed to approve leave request",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to approve leave request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );

  if (!leave)
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500">Leave request not found</div>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Approve Leave Request</h1>

      <div className="bg-gray-50 p-4 rounded mb-6">
        <h3 className="font-semibold text-lg">{leave.employeeName}</h3>
        <p className="text-gray-600">
          {getDepartmentLabel(leave.department)} - {leave.designation}
        </p>
        <p className="mt-2">
          <strong>Leave Type:</strong> {leave.leaveType}
        </p>
        <p>
          <strong>Duration:</strong>{" "}
          {new Date(leave.startDate).toLocaleDateString()} -{" "}
          {new Date(leave.endDate).toLocaleDateString()}
        </p>
        <p>
          <strong>Applied Days:</strong> {leave.appliedDays}
        </p>
        <p>
          <strong>Reason:</strong> {leave.reason}
        </p>
        <p>
          <strong>Half Day:</strong> {leave.isHalfDay ? "Yes" : "No"}
        </p>
        <p>
          <strong>Paid Leave:</strong> {leave.isPaidLeave ? "Yes" : "No"}
        </p>
        <p>
          <strong>Email:</strong> {leave.email}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Review Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border rounded"
            rows={4}
            placeholder="Add any notes for approval..."
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleApprove}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? "Approving..." : "Approve Leave"}
          </button>
          <button
            onClick={() => router.push("/admin/leaves")}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

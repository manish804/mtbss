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

export default function RejectLeave() {
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
          let errorMessage = "Failed to fetch leave request details";
          if (response.status === 404) {
            errorMessage = "Leave request not found";
          } else if (response.status >= 500) {
            errorMessage = "Server error occurred";
          }
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          });
          router.push("/admin/leaves");
        }
      } catch {
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

  const handleReject = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/leave-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "REJECTED", reviewNotes: notes }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Leave request rejected successfully",
        });
        router.push("/admin/leaves");
      } else {
        toast({
          title: "Error",
          description: "Failed to reject leave request",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to reject leave request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex justify-center items-center py-8"><div className="text-gray-500">Loading...</div></div>;
  if (!leave) return <div className="flex justify-center items-center py-8"><div className="text-red-500">Leave request not found</div></div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Reject Leave Request</h1>

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
            Rejection Reason (Required)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border rounded"
            rows={4}
            placeholder="Please provide reason for rejection..."
            required
          />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleReject}
            disabled={!notes.trim() || loading}
            className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
          >
            {loading ? "Rejecting..." : "Reject Leave"}
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

"use client";

import { memo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash2, Building, MapPin } from "lucide-react";

interface JobHeaderProps {
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
    isActive: boolean;
  };
  onDelete: () => void;
}

export const JobHeader = memo(function JobHeader({ job, onDelete }: JobHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
          <div className="flex items-center gap-2 mt-1 text-gray-600">
            <Building className="h-4 w-4" />
            <span>{job.department}</span>
            <span>•</span>
            <MapPin className="h-4 w-4" />
            <span>{job.location}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant={job.isActive ? "default" : "secondary"}
          className={
            job.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }
        >
          {job.isActive ? "Active" : "Inactive"}
        </Badge>
        <Button variant="outline" asChild>
          <Link href={`/admin/jobs/${job.id}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Job
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
});
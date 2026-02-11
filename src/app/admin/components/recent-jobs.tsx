"use client";

import { memo } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

interface RecentJob {
  id: string;
  title: string;
  department: string;
  location: string;
  isActive: boolean;
  applicationCount: number;
  postedDate: string;
}

interface RecentJobsProps {
  jobs: RecentJob[];
  loading: boolean;
}

export const RecentJobs = memo(function RecentJobs({
  jobs,
  loading,
}: RecentJobsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
          <CardDescription>Recently posted job openings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Jobs</CardTitle>
        <CardDescription>Recently posted job openings</CardDescription>
      </CardHeader>
      <CardContent>
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3 sm:gap-0"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {job.title}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {job.department} • {job.location}
                  </p>
                  <p className="text-xs text-gray-400">
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <Badge
                    variant={job.isActive ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {job.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {job.applicationCount} apps
                  </Badge>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/jobs/${job.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No jobs found</p>
            <Button asChild className="mt-4">
              <Link href="/admin/jobs/create">Create First Job</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
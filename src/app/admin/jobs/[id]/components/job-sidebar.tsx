"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle 
} from "lucide-react";

interface JobSidebarProps {
  job: {
    id: string;
    isActive: boolean;
    postedDate: string;
    updatedAt: string;
    applicationDeadline?: string;
    _count?: { applications: number };
    company?: {
      name: string;
      logo?: string;
      website?: string;
    };
  };
  isToggling: boolean;
  onStatusToggle: () => void;
}

export const JobSidebar = memo(function JobSidebar({ 
  job, 
  isToggling, 
  onStatusToggle 
}: JobSidebarProps) {
  const daysActive = useMemo(() => {
    return Math.ceil(
      (new Date().getTime() - new Date(job.postedDate).getTime()) /
      (1000 * 60 * 60 * 24)
    );
  }, [job.postedDate]);

  const applicationsPerDay = useMemo(() => {
    if (!job._count?.applications || daysActive === 0) return 0;
    return (job._count.applications / Math.max(1, daysActive)).toFixed(1);
  }, [job._count?.applications, daysActive]);

  const isDeadlineExpired = useMemo(() => {
    return job.applicationDeadline && 
           new Date(job.applicationDeadline) < new Date();
  }, [job.applicationDeadline]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Status</CardTitle>
          <CardDescription>
            Control whether this job is visible to applicants
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {job.isActive ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-gray-400" />
              )}
              <span className="font-medium">
                {job.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <Switch
              checked={job.isActive}
              onCheckedChange={onStatusToggle}
              disabled={isToggling}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {job.isActive
              ? "This job is currently visible to applicants"
              : "This job is hidden from applicants"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Application Statistics</CardTitle>
          <CardDescription>
            Overview of applications and job performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Total Applications
                  </span>
                </div>
                <span className="font-bold text-xl text-blue-900">
                  {job._count?.applications || 0}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Job Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Posted Date</span>
                  </div>
                  <span className="font-medium">
                    {format(new Date(job.postedDate), "MMM d, yyyy")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Last Updated</span>
                  </div>
                  <span className="font-medium">
                    {format(new Date(job.updatedAt), "MMM d, yyyy")}
                  </span>
                </div>

                {job.applicationDeadline && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">Application Deadline</span>
                    </div>
                    <span
                      className={`font-medium ${
                        isDeadlineExpired ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {format(new Date(job.applicationDeadline), "MMM d, yyyy")}
                      {isDeadlineExpired && (
                        <span className="text-xs text-red-500 ml-1">(Expired)</span>
                      )}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Days Active</span>
                  </div>
                  <span className="font-medium">{daysActive} days</span>
                </div>
              </div>
            </div>

            {job._count?.applications ? (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Performance</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Applications per Day</span>
                      <span className="font-medium">{applicationsPerDay}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Rate</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/admin/applications?jobId=${job.id}`}>
                      <Users className="h-4 w-4 mr-2" />
                      View Applications
                    </Link>
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {job.company && (
        <Card>
          <CardHeader>
            <CardTitle>Company</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              {job.company.logo && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="font-medium">{job.company.name}</p>
                {job.company.website && (
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

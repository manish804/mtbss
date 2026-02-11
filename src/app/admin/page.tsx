"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase } from "lucide-react";

// Import optimized components
import { DashboardStats } from "./components/dashboard-stats";
import { RecentPages } from "./components/recent-pages";
import { RecentJobs } from "./components/recent-jobs";

interface DashboardData {
  stats: {
    jobs: {
      total: number;
      active: number;
      totalApplications: number;
    };
    pages: {
      total: number;
    };
  };
  recentPages: Array<{
    id: string;
    pageId: string;
    title: string;
    isPublished: boolean;
    updatedAt: string;
  }>;
  recentJobs: Array<{
    id: string;
    title: string;
    department: string;
    location: string;
    isActive: boolean;
    applicationCount: number;
    postedDate: string;
  }>;
}

interface JsonPageSummary {
  filename: string;
  id: string;
  title: string;
  published: boolean;
  lastModified: string;
}

interface JobSummary {
  id: string;
  title: string;
  department: string;
  location: string;
  isActive: boolean;
  postedDate: string;
  _count?: {
    applications?: number;
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize the data transformation to avoid recalculating
  const { stats, recentPages, recentJobs } = useMemo(() => {
    if (!data) {
      return {
        stats: null,
        recentPages: [],
        recentJobs: [],
      };
    }

    return {
      stats: data.stats,
      recentPages: data.recentPages,
      recentJobs: data.recentJobs,
    };
  }, [data]);

  // Optimized data fetching with parallel requests
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Execute all API calls in parallel for better performance
      const [jobStatsRes, pagesRes, jobsRes] = await Promise.allSettled([
        fetch("/api/jobs/stats"),
        fetch("/api/json-pages"),
        fetch("/api/jobs?limit=5&sortBy=postedDate&sortOrder=desc")
      ]);

      const dashboardData: DashboardData = {
        stats: {
          jobs: { total: 0, active: 0, totalApplications: 0 },
          pages: { total: 0 }
        },
        recentPages: [],
        recentJobs: []
      };

      // Process job stats
      if (jobStatsRes.status === "fulfilled" && jobStatsRes.value.ok) {
        const jobStatsData = await jobStatsRes.value.json();
        if (jobStatsData.data?.overview) {
          dashboardData.stats.jobs = {
            total: jobStatsData.data.overview.total || 0,
            active: jobStatsData.data.overview.active || 0,
            totalApplications: jobStatsData.data.overview.totalApplications || 0,
          };
        }
      }

      // Process pages data
      if (pagesRes.status === "fulfilled" && pagesRes.value.ok) {
        const pagesData = await pagesRes.value.json();
        const pages = (pagesData.data || []) as JsonPageSummary[];
        
        dashboardData.stats.pages.total = pages.length;
        dashboardData.recentPages = pages.slice(0, 5).map((page) => ({
          id: page.filename,
          pageId: page.id,
          title: page.title,
          isPublished: page.published,
          updatedAt: page.lastModified,
        }));
      }

      // Process jobs data
      if (jobsRes.status === "fulfilled" && jobsRes.value.ok) {
        const jobsData = await jobsRes.value.json();
        const jobs = (jobsData.data?.jobs || []) as JobSummary[];
        dashboardData.recentJobs = jobs.map((job) => ({
          id: job.id,
          title: job.title,
          department: job.department,
          location: job.location,
          isActive: job.isActive,
          applicationCount: job._count?.applications || 0,
          postedDate: job.postedDate,
        }));
      }

      setData(dashboardData);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage your website content, pages, and job openings
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/jobs/create">
              <Plus className="h-4 w-4 mr-2" />
              <span className="sm:inline">Add New Job</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/admin/jobs">
              <Briefcase className="h-4 w-4 mr-2" />
              <span className="sm:inline">View All Jobs</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <DashboardStats stats={stats} loading={loading} />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <RecentPages pages={recentPages} loading={loading} />
        <RecentJobs jobs={recentJobs} loading={loading} />
      </div>
    </div>
  );
}

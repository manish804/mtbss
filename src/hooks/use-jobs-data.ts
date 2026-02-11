"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { jobsPageSchema } from "@/lib/validation/page-schemas";
import { z } from "zod";
import type { DatabaseJob, Department } from "@/lib/types/jobs";

type JobsPageData = z.infer<typeof jobsPageSchema>;

export function useJobsPageData() {
  const [data, setData] = useState<JobsPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/json-pages/jobs.json");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to load jobs data");
      }

      const validatedData = jobsPageSchema.parse(result.data);
      setData(validatedData);
    } catch (err) {
      console.error("Error loading jobs data:", err);
      setError(err instanceof Error ? err.message : "Failed to load jobs data");
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData: JobsPageData) => {
    try {
      setSaving(true);
      setError(null);

      const validatedData = jobsPageSchema.parse(newData);

      const response = await fetch("/api/json-pages/jobs.json", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save jobs data");
      }

      setData(validatedData);
      return true;
    } catch (err) {
      console.error("Error saving jobs data:", err);
      setError(err instanceof Error ? err.message : "Failed to save jobs data");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateData = (newData: JobsPageData) => {
    setData(newData);
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    data,
    loading,
    error,
    saving,
    saveData,
    updateData,
    reload: loadData,
  };
}

function buildDepartments(jobs: DatabaseJob[]): Department[] {
  const uniqueDepartments = new Set<string>();

  jobs.forEach((job) => {
    if (job.department) {
      uniqueDepartments.add(job.department);
    }
  });

  return [
    { key: "all", label: "All Departments" },
    ...Array.from(uniqueDepartments).map((dept) => ({
      key: dept,
      label: dept.charAt(0).toUpperCase() + dept.slice(1),
    })),
  ];
}

function buildJobCounts(jobs: DatabaseJob[]): Record<string, number> {
  const counts: Record<string, number> = { all: jobs.length };

  jobs.forEach((job) => {
    if (job.department) {
      counts[job.department] = (counts[job.department] || 0) + 1;
    }
  });

  return counts;
}

interface UseJobsDataOptions {
  department?: string;
  initialJobs?: DatabaseJob[];
}

export function useJobsData(options?: UseJobsDataOptions) {
  const hasInitialJobs = Array.isArray(options?.initialJobs);
  const [jobs, setJobs] = useState<DatabaseJob[]>(options?.initialJobs ?? []);
  const [isLoading, setIsLoading] = useState(!hasInitialJobs);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/jobs?active=true&limit=100", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch jobs");
      }

      const fetchedJobs: DatabaseJob[] = Array.isArray(result.data?.jobs)
        ? (result.data.jobs as DatabaseJob[])
        : [];
      setJobs(fetchedJobs);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialJobs) {
      fetchJobs();
    }
  }, [fetchJobs, hasInitialJobs]);

  const filteredJobs = useMemo(
    () =>
      options?.department && options.department !== "all"
        ? jobs.filter((job) => job.department === options.department)
        : jobs,
    [jobs, options?.department]
  );

  const departments = useMemo(() => buildDepartments(jobs), [jobs]);
  const jobCounts = useMemo(() => buildJobCounts(jobs), [jobs]);

  return {
    jobs: filteredJobs,
    departments,
    isLoading,
    error,
    jobCount: filteredJobs.length,
    totalJobs: jobs.length,
    jobCounts,
    retry: fetchJobs,
  };
}

export function useDepartmentLabel(department: string) {
  if (department === "all") return "All Departments";
  return department.charAt(0).toUpperCase() + department.slice(1);
}

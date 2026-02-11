"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface DepartmentOption {
  key: string;
  label: string;
}

function formatDepartmentKey(key: string): string {
  return key
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function useDepartments(includeAll: boolean = false) {
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = includeAll ? "?includeAll=true" : "";
      const response = await fetch(`/api/departments${query}`, {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to load departments");
      }

      setDepartments(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Error loading departments:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load departments"
      );
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  }, [includeAll]);

  useEffect(() => {
    void loadDepartments();
  }, [loadDepartments]);

  const departmentMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const department of departments) {
      if (department?.key) {
        map.set(department.key, department.label || formatDepartmentKey(department.key));
      }
    }
    return map;
  }, [departments]);

  const getDepartmentLabel = useCallback(
    (key: string) => {
      if (!key) return "";
      return departmentMap.get(key) || formatDepartmentKey(key);
    },
    [departmentMap]
  );

  return {
    departments,
    loading,
    error,
    reload: loadDepartments,
    getDepartmentLabel,
  };
}

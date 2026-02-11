"use client";

import { useState, useEffect } from "react";
import { ContentData } from "@/lib/types/content-data";

export function useContentData() {
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/content");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to load content data");
      }

      setData(result.data);
    } catch (err) {
      console.error("Error loading content data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load content data"
      );
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData: ContentData) => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save content data");
      }

      setData(newData);
      return true;
    } catch (err) {
      console.error("Error saving content data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save content data"
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveSection = async (
    sectionType: keyof ContentData,
    sectionData: ContentData[keyof ContentData]
  ) => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/content", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: sectionType,
          data: sectionData,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save section");
      }

      if (data) {
        const updatedData = {
          ...data,
          [sectionType]: sectionData,
        } as ContentData;
        setData(updatedData);
      }

      return true;
    } catch (err) {
      console.error("Error saving section:", err);
      setError(err instanceof Error ? err.message : "Failed to save section");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateData = (newData: ContentData) => {
    setData(newData);
  };

  const updateSection = (
    sectionType: keyof ContentData,
    sectionData: ContentData[keyof ContentData]
  ) => {
    if (data) {
      const updatedData = {
        ...data,
        [sectionType]: sectionData,
      } as ContentData;
      setData(updatedData);
    }
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
    saveSection,
    updateData,
    updateSection,
    reload: loadData,
  };
}

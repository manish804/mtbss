"use client";

import { useEffect, useCallback, useRef } from "react";
import { UseFormReturn, FieldValues } from "react-hook-form";

/**
 * Custom hook to sync form changes with parent component
 * Uses debouncing to prevent excessive updates and infinite loops
 * @param form - React Hook Form instance
 * @param onChange - Callback to call when form data changes
 * @param options - Configuration options
 */
export function useFormSync<T extends FieldValues>(
  form: UseFormReturn<T>,
  onChange: (data: T) => void,
  options: {
    validateBeforeSync?: boolean;
    debounceMs?: number;
    enableRealTimeSync?: boolean;
  } = {}
) {
  const {
    validateBeforeSync = false,
    debounceMs = 500,
    enableRealTimeSync = true,
  } = options;

  const watchedValues = form.watch();
  const lastSyncedData = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialRender = useRef(true);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      lastSyncedData.current = JSON.stringify(watchedValues);
      return;
    }

    if (!enableRealTimeSync) return;

    const currentDataString = JSON.stringify(watchedValues);

    if (currentDataString !== lastSyncedData.current) {
      lastSyncedData.current = currentDataString;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        try {
          if (validateBeforeSync) {
            if (form.formState.isValid) {
              onChangeRef.current(watchedValues);
            }
          } else {
            onChangeRef.current(watchedValues);
          }
        } catch (error) {
          console.error("Form sync error:", error);
        }
      }, debounceMs);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    watchedValues,
    validateBeforeSync,
    form.formState.isValid,
    debounceMs,
    enableRealTimeSync,
  ]);

  const manualSync = useCallback(() => {
    try {
      if (validateBeforeSync) {
        if (form.formState.isValid) {
          onChangeRef.current(watchedValues);
        }
      } else {
        onChangeRef.current(watchedValues);
      }
    } catch (error) {
      console.error("Manual sync error:", error);
    }
  }, [watchedValues, validateBeforeSync, form.formState.isValid]);

  return { manualSync };
}

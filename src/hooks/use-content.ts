/**
 * React Hook for Content Management
 *
 * Custom React hooks for loading, caching, and managing dynamic content
 * with error handling, loading states, and performance optimization.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  ContentLoader,
  ContentManagementError,
  contentCache,
} from "@/lib/content-management";
import { ContentPerformanceMonitor } from "@/lib/dev-content-tools";
import { ContentUtils } from "@/lib/content-utils";

interface UseContentState<T> {
  data: T | null;
  loading: boolean;
  error: ContentManagementError | null;
  fromCache: boolean;
}

interface UseContentOptions {
  useCache?: boolean;
  cacheTTL?: number;
  retries?: number;
  retryDelay?: number;
  refreshInterval?: number;
  onError?: (error: ContentManagementError) => void;
  onSuccess?: (data: unknown) => void;
}

interface UseContentActions {
  refresh: () => Promise<void>;
  clearError: () => void;
  invalidateCache: () => void;
  preload: () => Promise<void>;
}

type UseContentResult<T> = UseContentState<T> & UseContentActions;

/**
 * Base hook for loading content with comprehensive error handling and caching
 */
export function useContent<T>(
  key: string,
  loader: () => Promise<T> | T,
  options: UseContentOptions = {}
): UseContentResult<T> {
  const {
    useCache = true,
    cacheTTL,
    retries = 3,
    retryDelay = 1000,
    refreshInterval,
    onError,
    onSuccess,
  } = options;

  const [state, setState] = useState<UseContentState<T>>({
    data: null,
    loading: true,
    error: null,
    fromCache: false,
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const loadContent = useCallback(
    async (isRefresh = false) => {
      if (!mountedRef.current) return;

      if (!isRefresh) {
        setState((prev) => ({ ...prev, loading: true, error: null }));
      }

      const stopTiming = ContentPerformanceMonitor.startTiming(
        `useContent:${key}`
      );

      try {
        const result = await ContentLoader.loadContent(key, loader, {
          useCache,
          cacheTTL,
          retries,
          retryDelay,
        });

        stopTiming();

        if (!mountedRef.current) return;

        if (result.error) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: result.error!,
            fromCache: result.fromCache,
          }));

          if (onError) {
            onError(result.error);
          }
        } else {
          setState((prev) => ({
            ...prev,
            data: result.data!,
            loading: false,
            error: null,
            fromCache: result.fromCache,
          }));

          if (onSuccess) {
            onSuccess(result.data);
          }
        }
      } catch (error) {
        stopTiming();

        if (!mountedRef.current) return;

        const contentError =
          error instanceof ContentManagementError
            ? error
            : new ContentManagementError(
                `Unexpected error loading content: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`,
                "UNEXPECTED_ERROR"
              );

        setState((prev) => ({
          ...prev,
          loading: false,
          error: contentError,
          fromCache: false,
        }));

        if (onError) {
          onError(contentError);
        }
      }
    },
    [key, loader, useCache, cacheTTL, retries, retryDelay, onError, onSuccess]
  );

  const refresh = useCallback(async () => {
    await loadContent(true);
  }, [loadContent]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const invalidateCache = useCallback(() => {
    contentCache.delete(key);
  }, [key]);

  const preload = useCallback(async () => {
    await ContentLoader.preloadContent(key, loader, cacheTTL);
  }, [key, loader, cacheTTL]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    if (refreshInterval && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refresh();
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [refreshInterval, refresh]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refresh,
    clearError,
    invalidateCache,
    preload,
  };
}

/**
 * Hook for loading job content
 */
export function useJobs(options: UseContentOptions = {}) {
  return useContent(
    "all-jobs",
    () => {
      const result = ContentUtils.getAllJobs();
      if (result.error) {
        throw result.error;
      }
      return result.data || [];
    },
    options
  );
}

/**
 * Hook for loading jobs by department
 */
export function useJobsByDepartment(
  department: string,
  options: UseContentOptions = {}
) {
  return useContent(
    `jobs-${department}`,
    () => {
      const result = ContentUtils.getJobsByDepartment(department);
      if (result.error) {
        throw result.error;
      }
      return result.data || [];
    },
    {
      ...options,

      refreshInterval: options.refreshInterval || 30000,
    }
  );
}

/**
 * Hook for loading a specific job by ID
 */
export function useJob(jobId: string, options: UseContentOptions = {}) {
  return useContent(
    `job-${jobId}`,
    () => {
      const job = ContentUtils.getJobById(jobId);
      if (!job) {
        throw new ContentManagementError(
          `Job not found: ${jobId}`,
          "NOT_FOUND"
        );
      }
      return job;
    },
    options
  );
}

/**
 * Hook for loading departments
 */
export function useDepartments(options: UseContentOptions = {}) {
  return useContent(
    "departments",
    () => {
      const result = ContentUtils.getDepartments();
      if (result.error) {
        throw result.error;
      }
      return result.data || [];
    },
    options
  );
}

/**
 * Hook for loading services
 */
export function useServices(options: UseContentOptions = {}) {
  return useContent(
    "all-services",
    () => ContentUtils.getAllServices(),
    options
  );
}

/**
 * Hook for loading a specific service by slug
 */
export function useService(slug: string, options: UseContentOptions = {}) {
  return useContent(
    `service-${slug}`,
    () => {
      const service = ContentUtils.getServiceBySlug(slug);
      if (!service) {
        throw new ContentManagementError(
          `Service not found: ${slug}`,
          "NOT_FOUND"
        );
      }
      return service;
    },
    options
  );
}

/**
 * Hook for loading page content
 */
export function usePageContent(
  pageId: string,
  options: UseContentOptions = {}
) {
  return useContent(
    `page-${pageId}`,
    () => {
      const page = ContentUtils.getPageContent(pageId);
      if (!page) {
        throw new ContentManagementError(
          `Page not found: ${pageId}`,
          "NOT_FOUND"
        );
      }
      return page;
    },
    options
  );
}

/**
 * Hook for searching jobs with debounced search
 */
export function useJobSearch(
  query: string,
  debounceMs: number = 300,
  options: UseContentOptions = {}
) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  return useContent(
    `job-search-${debouncedQuery}`,
    () => {
      if (!debouncedQuery.trim()) {
        return [];
      }
      return ContentUtils.searchJobs(debouncedQuery);
    },
    {
      ...options,
      useCache: false,
    }
  );
}

/**
 * Hook for loading multiple content types in parallel
 */
export function useMultipleContent<T extends Record<string, unknown>>(
  loaders: {
    [K in keyof T]: {
      key: string;
      loader: () => Promise<T[K]> | T[K];
      options?: UseContentOptions;
    };
  },
  options: UseContentOptions = {}
): {
  data: Partial<T>;
  loading: boolean;
  errors: Record<keyof T, ContentManagementError | null>;
  fromCache: Record<keyof T, boolean>;
  refresh: () => Promise<void>;
  clearErrors: () => void;
} {
  const [state, setState] = useState<{
    data: Partial<T>;
    loading: boolean;
    errors: Record<keyof T, ContentManagementError | null>;
    fromCache: Record<keyof T, boolean>;
  }>({
    data: {},
    loading: true,
    errors: {} as Record<keyof T, ContentManagementError | null>,
    fromCache: {} as Record<keyof T, boolean>,
  });

  const loadAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));

    const loaderArray = Object.values(loaders).map((config) => ({
      key: config.key,
      loader: config.loader,
      options: { ...options, ...config.options },
    }));

    const results = await ContentLoader.loadMultiple(loaderArray);

    const newData: Partial<T> = {};
    const newErrors = {} as Record<keyof T, ContentManagementError | null>;
    const newFromCache = {} as Record<keyof T, boolean>;

    results.forEach((result, index) => {
      const key = Object.keys(loaders)[index] as keyof T;

      if (result.error) {
        newErrors[key] = result.error;
      } else {
        newData[key] = result.data as T[keyof T];
        newErrors[key] = null;
      }

      newFromCache[key] = result.fromCache;
    });

    setState({
      data: newData,
      loading: false,
      errors: newErrors,
      fromCache: newFromCache,
    });
  }, [loaders, options]);

  const refresh = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: Object.keys(prev.errors).reduce((acc, key) => {
        acc[key as keyof T] = null;
        return acc;
      }, {} as Record<keyof T, ContentManagementError | null>),
    }));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return {
    ...state,
    refresh,
    clearErrors,
  };
}

/**
 * Hook for content with optimistic updates
 */
export function useOptimisticContent<T>(
  key: string,
  loader: () => Promise<T> | T,
  options: UseContentOptions = {}
) {
  const baseResult = useContent(key, loader, options);
  const [optimisticData, setOptimisticData] = useState<T | null>(null);

  const updateOptimistically = useCallback((newData: T) => {
    setOptimisticData(newData);
  }, []);

  const commitOptimisticUpdate = useCallback(() => {
    if (optimisticData) {
      contentCache.set(key, optimisticData, options.cacheTTL);
      setOptimisticData(null);
      baseResult.refresh();
    }
  }, [optimisticData, key, options.cacheTTL, baseResult]);

  const revertOptimisticUpdate = useCallback(() => {
    setOptimisticData(null);
  }, []);

  return {
    ...baseResult,
    data: optimisticData || baseResult.data,
    isOptimistic: optimisticData !== null,
    updateOptimistically,
    commitOptimisticUpdate,
    revertOptimisticUpdate,
  };
}

/**
 * Hook for content cache statistics
 */
export function useContentCacheStats() {
  const [stats, setStats] = useState(contentCache.getStats());

  const refreshStats = useCallback(() => {
    setStats(contentCache.getStats());
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshStats, 5000);
    return () => clearInterval(interval);
  }, [refreshStats]);

  return {
    stats,
    refreshStats,
    clearCache: () => {
      contentCache.clear();
      refreshStats();
    },
    cleanupCache: () => {
      const removed = contentCache.cleanup();
      refreshStats();
      return removed;
    },
  };
}

/**
 * Hook for content performance monitoring
 */
export function useContentPerformance() {
  const [metrics, setMetrics] = useState(
    ContentPerformanceMonitor.getMetrics()
  );

  const refreshMetrics = useCallback(() => {
    setMetrics(ContentPerformanceMonitor.getMetrics());
  }, []);

  useEffect(() => {
    const interval = setInterval(refreshMetrics, 10000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  return {
    metrics,
    refreshMetrics,
    clearMetrics: () => {
      ContentPerformanceMonitor.clearMetrics();
      refreshMetrics();
    },
    getReport: () => ContentPerformanceMonitor.getPerformanceReport(),
  };
}

const contentHooks = {
  useContent,
  useJobs,
  useJobsByDepartment,
  useJob,
  useDepartments,
  useServices,
  useService,
  usePageContent,
  useJobSearch,
  useMultipleContent,
  useOptimisticContent,
  useContentCacheStats,
  useContentPerformance,
};

export default contentHooks;

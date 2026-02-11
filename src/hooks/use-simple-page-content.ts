"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PageContent } from '@/lib/types/page';

interface UseSimplePageContentState {
  data: PageContent | null;
  loading: boolean;
  error: string | null;
  source: 'database' | 'json' | null;
}

interface JsonPageApiResponse {
  success: boolean;
  data?: PageContent;
  source?: 'database' | 'json';
}

const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff
const MAX_RETRIES = 3;

export function useSimplePageContent(pageId: string) {
  const [state, setState] = useState<UseSimplePageContentState>({
    data: null,
    loading: true,
    error: null,
    source: null,
  });

  const mountedRef = useRef(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchWithRetry = useCallback(async <T,>(url: string, retryCount: number = 0): Promise<T> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      if (retryCount < MAX_RETRIES - 1) {
        const delay = RETRY_DELAYS[retryCount];
        
        return new Promise<T>((resolve, reject) => {
          retryTimeoutRef.current = setTimeout(async () => {
            try {
              const result = await fetchWithRetry<T>(url, retryCount + 1);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        });
      }
      throw error;
    }
  }, []);

  const loadContent = useCallback(async (forceRefresh: boolean = false) => {
    if (!mountedRef.current) return;

    // Don't show loading if we already have data and this isn't a force refresh
    if (!state.data || forceRefresh) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      
      // Use the simplified API that handles database-first with JSON fallback
      const result = await fetchWithRetry<JsonPageApiResponse>(
        `/api/json-pages/${pageId}.json`
      );
      
      if (result.success && result.data) {
        if (!mountedRef.current) return;
        
        setState({
          data: result.data,
          loading: false,
          error: null,
          source: result.source || 'database',
        });
        
        return;
      }

      // If we reach here, the API call succeeded but no data was returned
      if (!mountedRef.current) return;
      setState({
        data: null,
        loading: false,
        error: `Page '${pageId}' not found`,
        source: null,
      });
      
    } catch (error) {
      if (!mountedRef.current) return;
      console.error(`❌ Failed to load page '${pageId}':`, error);
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load page content',
        source: null,
      });
    }
  }, [pageId, fetchWithRetry, state.data]);

  const refresh = useCallback(() => {
    loadContent(true);
  }, [loadContent]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refresh,
  };
}

// Specific hooks for different page types
export function useSimpleHomeContent() {
  return useSimplePageContent('home');
}

export function useSimpleAboutContent() {
  return useSimplePageContent('about');
}

export function useSimpleServicesContent() {
  return useSimplePageContent('services');
}

export function useSimpleContactContent() {
  return useSimplePageContent('contact');
}

export function useSimpleJobsContent() {
  return useSimplePageContent('jobs');
}

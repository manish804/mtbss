"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PageContent } from '@/lib/types/page';

interface UseHybridPageContentState {
  data: PageContent | null;
  loading: boolean;
  error: string | null;
  fromDatabase: boolean;
  retryCount: number;
}

interface PageListApiResponse {
  success: boolean;
  data?: Array<{
    content: PageContent;
    isPublished: boolean;
  }>;
}

interface JsonPageApiResponse {
  success: boolean;
  data?: PageContent;
}

// Cache to persist successful database results across re-renders
const contentCache = new Map<string, { data: PageContent; fromDatabase: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

export function useHybridPageContent(pageId: string) {
  const [state, setState] = useState<UseHybridPageContentState>({
    data: null,
    loading: true,
    error: null,
    fromDatabase: false,
    retryCount: 0,
  });

  const mountedRef = useRef(true);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check cache first
  const getCachedContent = useCallback(() => {
    const cached = contentCache.get(pageId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
    return null;
  }, [pageId]);

  // Set cache
  const setCachedContent = useCallback((data: PageContent, fromDatabase: boolean) => {
    contentCache.set(pageId, { data, fromDatabase, timestamp: Date.now() });
  }, [pageId]);

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

  const loadContent = useCallback(async (skipCache: boolean = false) => {
    if (!mountedRef.current) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check cache first unless explicitly skipping
      if (!skipCache) {
        const cached = getCachedContent();
        if (cached) {
          setState({
            data: cached.data,
            loading: false,
            error: null,
            fromDatabase: cached.fromDatabase,
            retryCount: 0,
          });
          return;
        }
      }
      
      
      // Try database first with retry logic
      let databaseSuccess = false;
      try {
        const result = await fetchWithRetry<PageListApiResponse>(
          `/api/pages?pageId=${pageId}&published=true&limit=1`
        );
        
        if (result.success && result.data && result.data.length > 0) {
          const pageData = result.data[0];
          if (pageData.content && pageData.isPublished) {
            if (!mountedRef.current) return;
            
            const content = pageData.content;
            setCachedContent(content, true);
            setState({
              data: content,
              loading: false,
              error: null,
              fromDatabase: true,
              retryCount: 0,
            });
            databaseSuccess = true;
            return;
          }
        }
      } catch (dbError) {
        console.warn(`⚠️ Database API fetch failed for '${pageId}' after retries:`, dbError);
      }

      // Only fallback to JSON if database completely failed AND we don't have cached DB data
      const existingCached = getCachedContent();
      if (!databaseSuccess && (!existingCached || !existingCached.fromDatabase)) {
        try {
          const result = await fetchWithRetry<JsonPageApiResponse>(
            `/api/json-pages/${pageId}.json`
          );
          
          if (result.success && result.data) {
            if (!mountedRef.current) return;
            
            const content = result.data;
            setCachedContent(content, false);
            setState({
              data: content,
              loading: false,
              error: null,
              fromDatabase: false,
              retryCount: 0,
            });
            return;
          }
        } catch (jsonError) {
          console.warn(`⚠️ JSON API fetch failed for '${pageId}':`, jsonError);
        }
      } else if (existingCached && existingCached.fromDatabase) {
        // If we have cached database data and the new fetch failed, stick with the cached data
        setState({
          data: existingCached.data,
          loading: false,
          error: null,
          fromDatabase: true,
          retryCount: 0,
        });
        return;
      }

      // If everything fails
      if (!mountedRef.current) return;
      setState({
        data: null,
        loading: false,
        error: `Page '${pageId}' not found in database or JSON files`,
        fromDatabase: false,
        retryCount: 0,
      });
      console.error(`❌ Page '${pageId}' not found in either database or JSON`);

    } catch (error) {
      if (!mountedRef.current) return;
      console.error(`❌ Failed to load page '${pageId}':`, error);
      setState({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load page content',
        fromDatabase: false,
        retryCount: 0,
      });
    }
  }, [pageId, getCachedContent, setCachedContent, fetchWithRetry]);

  const refresh = useCallback((skipCache: boolean = false) => {
    loadContent(skipCache);
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
    forceRefresh: () => refresh(true),
  };
}

// Specific hooks for different page types
export function useHybridHomeContent() {
  return useHybridPageContent('home');
}

export function useHybridAboutContent() {
  return useHybridPageContent('about');
}

export function useHybridServicesContent() {
  return useHybridPageContent('services');
}

export function useHybridContactContent() {
  return useHybridPageContent('contact');
}

export function useHybridJobsContent() {
  return useHybridPageContent('jobs');
}

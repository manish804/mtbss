/**
 * Simplified Cache System
 * 
 * Single cache implementation to replace multiple caching layers
 * Designed for client-side use with proper invalidation
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  source: 'database' | 'json';
}

export interface CacheStats {
  totalEntries: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
}

export class SimpleCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private stats = {
    hits: 0,
    misses: 0
  };

  constructor(private defaultTTL: number = 5 * 60 * 1000) {} // 5 minutes

  /**
   * Get item from cache
   */
  get<T>(key: string): { data: T; source: 'database' | 'json' } | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return {
      data: entry.data as T,
      source: entry.source
    };
  }

  /**
   * Set item in cache
   */
  set<T>(key: string, data: T, source: 'database' | 'json' = 'database', ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      source
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Delete specific key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  /**
   * Invalidate all entries from a specific source
   */
  invalidateBySource(source: 'database' | 'json'): number {
    let removedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.source === source) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    return removedCount;
  }

  /**
   * Invalidate entries by pattern
   */
  invalidateByPattern(pattern: RegExp): number {
    let removedCount = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    return removedCount;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let removedCount = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removedCount++;
      }
    }
    
    return removedCount;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      totalEntries: this.cache.size,
      hitCount: this.stats.hits,
      missCount: this.stats.misses,
      hitRate: total > 0 ? Math.round((this.stats.hits / total) * 100) : 0
    };
  }

  /**
   * Get or set with factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<{ data: T; source: 'database' | 'json' }> | { data: T; source: 'database' | 'json' },
    ttl?: number
  ): Promise<{ data: T; source: 'database' | 'json'; fromCache: boolean }> {
    const cached = this.get<T>(key);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    const result = await factory();
    this.set(key, result.data, result.source, ttl);
    return { ...result, fromCache: false };
  }
}

// Single global cache instance
export const globalCache = new SimpleCache();

// Cache key builders for consistency
export const CacheKeys = {
  page: (pageId: string) => `page:${pageId}`,
  pages: (filters?: string) => `pages${filters ? `:${filters}` : ''}`,
  jsonPage: (filename: string) => `json-page:${filename}`,
  content: (type: string, id: string) => `content:${type}:${id}`,
};

export default globalCache;

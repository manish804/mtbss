"use client";

import { useState, useEffect, useCallback } from 'react';
import { usePublicCompanyContext } from "@/components/providers/public-company-provider";
import type { PublicCompanyData, PublicCompanyState } from "@/lib/types/company";

interface CompanyData {
  id: string;
  name: string;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  logo?: string | null;
  industry?: string | null;
  foundedYear?: number | null;
  employeeCount?: string | null;
  headquarters?: string | null;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    [key: string]: string | undefined;
  } | null;
  showName: boolean;
  showDescription: boolean;
  showWebsite: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showLogo: boolean;
  showIndustry: boolean;
  showFoundedYear: boolean;
  showEmployeeCount: boolean;
  showHeadquarters: boolean;
  showSocialLinks: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  jobOpenings?: Array<{
    id: string;
    title: string;
    isActive: boolean;
  }>;
}

interface CompanyStats {
  totalJobOpenings: number;
  activeJobOpenings: number;
  totalApplications: number;
  recentApplications: number;
}

const COMPANY_CACHE_TTL = 60 * 1000;

type CompanyFetchResult = {
  data: CompanyData | null;
  stats?: CompanyStats | null;
};

let companyCache: { data: CompanyData | null; timestamp: number } | null = null;
let statsCache: { data: CompanyStats | null; timestamp: number } | null = null;
let inFlightBase: Promise<CompanyFetchResult> | null = null;
let inFlightWithStats: Promise<CompanyFetchResult> | null = null;

const isCacheValid = (cache: { timestamp: number } | null) =>
  !!cache && Date.now() - cache.timestamp < COMPANY_CACHE_TTL;

const getCachedCompany = (includeStats: boolean): CompanyFetchResult | null => {
  if (!isCacheValid(companyCache)) return null;
  if (includeStats && !isCacheValid(statsCache)) return null;

  return {
    data: companyCache?.data ?? null,
    stats: includeStats ? statsCache?.data ?? null : undefined,
  };
};

const updateCompanyCache = (
  data: CompanyData | null,
  stats?: CompanyStats | null
) => {
  const timestamp = Date.now();
  companyCache = { data, timestamp };
  if (stats !== undefined) {
    statsCache = { data: stats ?? null, timestamp };
  }
};

const clearCompanyCache = () => {
  companyCache = null;
  statsCache = null;
};

const fetchCompanyData = async (
  includeStats: boolean,
  skipCache: boolean = false
): Promise<CompanyFetchResult> => {
  if (!skipCache) {
    const cached = getCachedCompany(includeStats);
    if (cached) return cached;
  }

  const inFlight = includeStats
    ? inFlightWithStats || inFlightBase
    : inFlightBase || inFlightWithStats;
  if (inFlight) return inFlight;

  const url = includeStats ? '/api/company?includeStats=true' : '/api/company';

  const request = (async () => {
    const response = await fetch(url);
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to load company data');
    }

    const data = result.data ?? null;
    const stats = includeStats ? result.stats ?? null : undefined;
    updateCompanyCache(data, stats);

    return { data, stats };
  })();

  if (includeStats) {
    inFlightWithStats = request;
  } else {
    inFlightBase = request;
  }

  try {
    return await request;
  } finally {
    if (includeStats) {
      inFlightWithStats = null;
    } else {
      inFlightBase = null;
    }
  }
};

export function useCompany(
  includeStats: boolean = false,
  options?: { enabled?: boolean }
) {
  const enabled = options?.enabled ?? true;
  const cached = getCachedCompany(includeStats);
  const [company, setCompany] = useState<CompanyData | null>(
    () => cached?.data ?? null
  );
  const [stats, setStats] = useState<CompanyStats | null>(
    () => (includeStats ? cached?.stats ?? null : null)
  );
  const [loading, setLoading] = useState(() => enabled && !cached);
  const [error, setError] = useState<string | null>(null);

  const fetchCompany = useCallback(async (options?: { skipCache?: boolean }) => {
    try {
      setError(null);

      if (!options?.skipCache) {
        const cachedResult = getCachedCompany(includeStats);
        if (cachedResult) {
          setCompany(cachedResult.data);
          if (includeStats) {
            setStats(cachedResult.stats ?? null);
          }
          setLoading(false);
          return;
        }
      }

      setLoading(true);
      const result = await fetchCompanyData(includeStats, options?.skipCache);

      setCompany(result.data);
      if (includeStats) {
        setStats(result.stats ?? null);
      }
    } catch (err) {
      console.error('Error fetching company:', err);
      setError('Failed to load company data');
    } finally {
      setLoading(false);
    }
  }, [includeStats]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    fetchCompany();
  }, [enabled, fetchCompany]);

  const updateCompany = useCallback(async (data: Partial<CompanyData>) => {
    try {
      const method = company ? 'PUT' : 'POST';
      const response = await fetch('/api/company', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setCompany(result.data);
        updateCompanyCache(result.data, undefined);
        return { success: true, data: result.data, message: result.message };
      } else {
        setError(result.error || 'Failed to update company');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error updating company:', err);
      const errorMessage = 'Failed to update company data';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [company]);

  const deleteCompany = useCallback(async () => {
    try {
      const response = await fetch('/api/company', {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setCompany(null);
        setStats(null);
        clearCompanyCache();
        return { success: true, message: result.message };
      } else {
        setError(result.error || 'Failed to delete company');
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error deleting company:', err);
      const errorMessage = 'Failed to delete company';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const refreshCompany = useCallback(() => {
    if (!enabled) return;
    fetchCompany({ skipCache: true });
  }, [enabled, fetchCompany]);

  return {
    company,
    stats,
    loading,
    error,
    updateCompany,
    deleteCompany,
    refreshCompany,
    refetch: fetchCompany
  };
}

// Hook for getting company data that should be visible on the website
export function usePublicCompany() {
  const contextValue = usePublicCompanyContext();
  const { company, loading, error } = useCompany(false, {
    enabled: !contextValue,
  });

  if (contextValue) return contextValue;

  const publicCompanyData: PublicCompanyData | null = company ? {
    id: company.id,
    name: company.showName ? company.name : null,
    description: company.showDescription ? (company.description ?? null) : null,
    website: company.showWebsite ? (company.website ?? null) : null,
    email: company.showEmail ? (company.email ?? null) : null,
    phone: company.showPhone ? (company.phone ?? null) : null,
    address: company.showAddress ? (company.address ?? null) : null,
    logo: company.showLogo ? (company.logo ?? null) : null,
    industry: company.showIndustry ? (company.industry ?? null) : null,
    foundedYear: company.showFoundedYear ? (company.foundedYear ?? null) : null,
    employeeCount: company.showEmployeeCount ? (company.employeeCount ?? null) : null,
    headquarters: company.showHeadquarters ? (company.headquarters ?? null) : null,
    socialLinks: company.showSocialLinks ? (company.socialLinks ?? null) : null,
    isActive: company.isActive,
  } : null;

  const result: PublicCompanyState = {
    company: publicCompanyData,
    loading,
    error,
    isCompanyActive: company?.isActive ?? false,
  };

  return result;
}

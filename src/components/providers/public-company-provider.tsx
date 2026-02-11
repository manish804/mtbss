"use client";

import { createContext, useContext } from "react";
import type { PublicCompanyState } from "@/lib/types/company";

const PublicCompanyContext = createContext<PublicCompanyState | null>(null);

interface PublicCompanyProviderProps {
  value: PublicCompanyState;
  children: React.ReactNode;
}

export function PublicCompanyProvider({
  value,
  children,
}: PublicCompanyProviderProps) {
  return (
    <PublicCompanyContext.Provider value={value}>
      {children}
    </PublicCompanyContext.Provider>
  );
}

export function usePublicCompanyContext() {
  return useContext(PublicCompanyContext);
}

export interface PublicCompanyData {
  id: string;
  name: string | null;
  description: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo: string | null;
  industry: string | null;
  foundedYear: number | null;
  employeeCount: string | null;
  headquarters: string | null;
  socialLinks: Record<string, string | undefined> | null;
  isActive: boolean;
}

export interface PublicCompanyState {
  company: PublicCompanyData | null;
  loading: boolean;
  error: string | null;
  isCompanyActive: boolean;
}

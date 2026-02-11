export interface JobCompany {
  name: string;
  logo?: string;
  website?: string;
}

export interface JobApplicationsCount {
  applications: number;
}

export interface DatabaseJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  salary?: string;
  description: string;
  requirements: unknown;
  responsibilities: unknown;
  skills?: unknown;
  benefits?: unknown;
  isActive: boolean;
  applicationDeadline?: string;
  postedDate: string;
  company?: JobCompany | null;
  _count?: JobApplicationsCount;
}

export interface Department {
  key: string;
  label: string;
}

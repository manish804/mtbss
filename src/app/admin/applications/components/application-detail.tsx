"use client";

import { format } from "date-fns";
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  Linkedin,
  ExternalLink,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Users,
  Settings,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactActions } from "./contact-actions";
import { FileViewer } from "./file-viewer";

type UnknownRecord = Record<string, unknown>;

interface EducationItem {
  degree?: string;
  title?: string;
  institution?: string;
  year?: string;
  description?: string;
}

interface CertificationItem {
  name?: string;
  title?: string;
  issuer?: string;
  date?: string;
}

interface ReferenceItem {
  name?: string;
  position?: string;
  company?: string;
  email?: string;
  phone?: string;
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function normalizeEducationItem(value: unknown): EducationItem {
  if (!isRecord(value)) return {};

  return {
    degree: asString(value.degree),
    title: asString(value.title),
    institution: asString(value.institution),
    year: asString(value.year),
    description: asString(value.description),
  };
}

function normalizeCertificationItem(value: unknown): CertificationItem {
  if (!isRecord(value)) return {};

  return {
    name: asString(value.name),
    title: asString(value.title),
    issuer: asString(value.issuer),
    date: asString(value.date),
  };
}

function normalizeReferenceItem(value: unknown): ReferenceItem {
  if (!isRecord(value)) return {};

  return {
    name: asString(value.name),
    position: asString(value.position),
    company: asString(value.company),
    email: asString(value.email),
    phone: asString(value.phone),
  };
}

export interface ApplicationDetail {
  id: string;
  jobId: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  linkedinProfile?: string;
  portfolioWebsite?: string;
  currentCompany?: string;
  currentPosition?: string;
  experienceYears?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  availableStartDate?: Date;
  coverLetter?: string;
  additionalInfo?: string;
  skills?: unknown;
  education?: unknown;
  certifications?: unknown;
  references?: unknown;
  resumeUrl?: string;
  portfolioFiles?: unknown;
  willingToRelocate: boolean;
  remoteWork: boolean;
  travelAvailability: boolean;
  visaSponsorship: boolean;
  backgroundCheck: boolean;
  termsAccepted: boolean;
  status: string;
  reviewNotes?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  job: {
    title: string;
    department: string;
    location: string;
    type: string;
  };
}

interface ApplicationDetailProps {
  application: ApplicationDetail;
  onBack?: () => void;
  showBackButton?: boolean;
  onContactLog?: (contactType: string, details: string) => void;
  onFileAccess?: (fileType: string, fileName: string, action: string) => void;
}

export function ApplicationDetail({
  application,
  onContactLog,
  onFileAccess,
}: ApplicationDetailProps) {
  const fullName = `${application.firstName} ${application.lastName}`;

  const formatAddress = () => {
    const parts = [
      application.address,
      application.city,
      application.state,
      application.zipCode,
      application.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  const fullAddress = formatAddress();

  const formatSkills = (skills: unknown): string[] => {
    if (!skills) return [];
    if (Array.isArray(skills)) {
      return skills.filter((skill): skill is string => typeof skill === "string");
    }
    if (typeof skills === "string")
      return skills.split(",").map((s) => s.trim());
    if (isRecord(skills) && Array.isArray(skills.skills)) {
      return skills.skills.filter((skill): skill is string => typeof skill === "string");
    }
    return [];
  };

  const formatEducation = (education: unknown): EducationItem[] => {
    if (!education) return [];
    if (Array.isArray(education)) return education.map(normalizeEducationItem);
    if (isRecord(education) && Array.isArray(education.education))
      return education.education.map(normalizeEducationItem);
    return [];
  };

  const formatCertifications = (certifications: unknown): CertificationItem[] => {
    if (!certifications) return [];
    if (Array.isArray(certifications))
      return certifications.map(normalizeCertificationItem);
    if (isRecord(certifications) && Array.isArray(certifications.certifications))
      return certifications.certifications.map(normalizeCertificationItem);
    return [];
  };

  const formatReferences = (references: unknown): ReferenceItem[] => {
    if (!references) return [];
    if (Array.isArray(references)) return references.map(normalizeReferenceItem);
    if (isRecord(references) && Array.isArray(references.references))
      return references.references.map(normalizeReferenceItem);
    return [];
  };

  const skills = formatSkills(application.skills);
  const education = formatEducation(application.education);
  const certifications = formatCertifications(application.certifications);
  const references = formatReferences(application.references);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Application Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Applied Date</p>
              <p className="text-sm text-gray-900">
                {format(new Date(application.createdAt), "MMM d, yyyy")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge variant="secondary">{application.status}</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Job Position</p>
              <p className="text-sm text-gray-900">{application.job.title}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500">Department</p>
              <p className="text-sm text-gray-900">
                {application.job.department}
              </p>
            </div>
          </div>

          {application.reviewedAt && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-500">
                Last reviewed on{" "}
                {format(new Date(application.reviewedAt), "MMM d, yyyy")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <ContactActions
        application={{
          id: application.id,
          firstName: application.firstName,
          lastName: application.lastName,
          email: application.email,
          phone: application.phone,
          linkedinProfile: application.linkedinProfile,
          job: application.job,
        }}
        onContactLog={onContactLog}
      />

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="files">Files & Links</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-900">
                      {application.email}
                    </span>
                  </div>
                  {application.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-900">
                        {application.phone}
                      </span>
                    </div>
                  )}
                  {fullAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-sm text-gray-900">
                        {fullAddress}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {application.linkedinProfile && (
                    <div className="flex items-center gap-2">
                      <Linkedin className="h-4 w-4 text-gray-500" />
                      <a
                        href={application.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    </div>
                  )}
                  {application.portfolioWebsite && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a
                        href={application.portfolioWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Portfolio Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {application.coverLetter && (
            <Card>
              <CardHeader>
                <CardTitle>Cover Letter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {application.coverLetter}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {application.additionalInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {application.additionalInfo}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="professional" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.currentCompany && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      Current Company
                    </p>
                    <p className="text-sm text-gray-900">
                      {application.currentCompany}
                    </p>
                  </div>
                )}
                {application.currentPosition && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      Current Position
                    </p>
                    <p className="text-sm text-gray-900">
                      {application.currentPosition}
                    </p>
                  </div>
                )}
                {application.experienceYears !== undefined && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      Years of Experience
                    </p>
                    <p className="text-sm text-gray-900">
                      {application.experienceYears} years
                    </p>
                  </div>
                )}
                {application.expectedSalary && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      Expected Salary
                    </p>
                    <p className="text-sm text-gray-900">
                      ${application.expectedSalary.toLocaleString()}
                    </p>
                  </div>
                )}
                {application.noticePeriod && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      Notice Period
                    </p>
                    <p className="text-sm text-gray-900">
                      {application.noticePeriod}
                    </p>
                  </div>
                )}
                {application.availableStartDate && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500">
                      Available Start Date
                    </p>
                    <p className="text-sm text-gray-900">
                      {format(
                        new Date(application.availableStartDate),
                        "MMM d, yyyy"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {education.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {education.map((edu, index: number) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-4">
                    <h4 className="font-medium text-gray-900">
                      {edu.degree || edu.title || "Education"}
                    </h4>
                    {edu.institution && (
                      <p className="text-sm text-gray-600">{edu.institution}</p>
                    )}
                    {edu.year && (
                      <p className="text-xs text-gray-500">{edu.year}</p>
                    )}
                    {edu.description && (
                      <p className="text-sm text-gray-700 mt-1">
                        {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {certifications.map((cert, index: number) => (
                  <div key={index} className="flex items-start gap-3">
                    <Award className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {cert.name || cert.title || "Certification"}
                      </h4>
                      {cert.issuer && (
                        <p className="text-sm text-gray-600">{cert.issuer}</p>
                      )}
                      {cert.date && (
                        <p className="text-xs text-gray-500">{cert.date}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {references.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  References
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {references.map((ref, index: number) => (
                  <div key={index} className="border rounded-lg p-3 bg-gray-50">
                    <h4 className="font-medium text-gray-900">
                      {ref.name || "Reference"}
                    </h4>
                    {ref.position && (
                      <p className="text-sm text-gray-600">{ref.position}</p>
                    )}
                    {ref.company && (
                      <p className="text-sm text-gray-600">{ref.company}</p>
                    )}
                    {ref.email && (
                      <p className="text-sm text-blue-600">{ref.email}</p>
                    )}
                    {ref.phone && (
                      <p className="text-sm text-gray-600">{ref.phone}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Work Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Remote Work</span>
                  {application.remoteWork ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">
                    Willing to Relocate
                  </span>
                  {application.willingToRelocate ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">
                    Travel Availability
                  </span>
                  {application.travelAvailability ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">
                    Visa Sponsorship Required
                  </span>
                  {application.visaSponsorship ? (
                    <CheckCircle className="h-5 w-5 text-orange-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">
                    Background Check Consent
                  </span>
                  {application.backgroundCheck ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">Terms Accepted</span>
                  {application.termsAccepted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <FileViewer
            resumeUrl={application.resumeUrl}
            portfolioFiles={application.portfolioFiles}
            applicantName={fullName}
            onFileAccess={onFileAccess}
          />

          {(application.linkedinProfile || application.portfolioWebsite) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  External Links
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {application.linkedinProfile && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Linkedin className="h-5 w-5 text-blue-600" />
                      <a
                        href={application.linkedinProfile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex-1"
                      >
                        LinkedIn Profile
                      </a>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                  {application.portfolioWebsite && (
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Globe className="h-5 w-5 text-green-600" />
                      <a
                        href={application.portfolioWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex-1"
                      >
                        Portfolio Website
                      </a>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

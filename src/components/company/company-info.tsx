"use client";

import Image from "next/image";
import { usePublicCompany } from "@/hooks/use-company";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Users,
  ExternalLink,
} from "lucide-react";

interface CompanyInfoProps {
  variant?: "full" | "compact" | "minimal";
  showSocialLinks?: boolean;
  showLogo?: boolean;
  className?: string;
}

export function CompanyInfo({
  variant = "full",
  showSocialLinks = true,
  showLogo = true,
  className = "",
}: CompanyInfoProps) {
  const { company, loading, error, isCompanyActive } = usePublicCompany();

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (error || !company || !isCompanyActive) {
    return null;
  }

  const socialPlatforms = [
    { key: "linkedin", name: "LinkedIn", icon: "🔗" },
    { key: "twitter", name: "Twitter", icon: "🐦" },
    { key: "facebook", name: "Facebook", icon: "📘" },
    { key: "instagram", name: "Instagram", icon: "📷" },
    { key: "youtube", name: "YouTube", icon: "📺" },
  ];

  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {company.logo && showLogo && (
          <Image
            src={company.logo}
            alt={company.name || "Company"}
            width={24}
            height={24}
            className="h-6 w-6 object-contain rounded"
          />
        )}
        {company.name && (
          <span className="font-medium text-sm">{company.name}</span>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-3">
          {company.logo && showLogo && (
            <Image
              src={company.logo}
              alt={company.name || "Company"}
              width={32}
              height={32}
              className="h-8 w-8 object-contain rounded"
            />
          )}
          <div>
            {company.name && (
              <h3 className="font-semibold text-lg">{company.name}</h3>
            )}
            {company.industry && (
              <p className="text-sm text-muted-foreground">{company.industry}</p>
            )}
          </div>
        </div>

        <div className="space-y-1 text-sm">
          {company.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a
                href={`mailto:${company.email}`}
                className="hover:underline"
              >
                {company.email}
              </a>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a
                href={`tel:${company.phone}`}
                className="hover:underline"
              >
                {company.phone}
              </a>
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline flex items-center gap-1"
              >
                Visit Website <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {company.logo && showLogo && (
            <Image
              src={company.logo}
              alt={company.name || "Company"}
              width={40}
              height={40}
              className="h-10 w-10 object-contain rounded"
            />
          )}
          <div>
            {company.name && (
              <h2 className="text-xl font-bold">{company.name}</h2>
            )}
            {company.industry && (
              <Badge variant="secondary" className="mt-1">
                {company.industry}
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {company.description && (
          <p className="text-muted-foreground">{company.description}</p>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          {company.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${company.email}`}
                className="hover:underline text-sm"
              >
                {company.email}
              </a>
            </div>
          )}

          {company.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a
                href={`tel:${company.phone}`}
                className="hover:underline text-sm"
              >
                {company.phone}
              </a>
            </div>
          )}

          {company.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-sm flex items-center gap-1"
              >
                Visit Website <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {company.headquarters && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{company.headquarters}</span>
            </div>
          )}

          {company.foundedYear && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Founded {company.foundedYear}</span>
            </div>
          )}

          {company.employeeCount && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{company.employeeCount} employees</span>
            </div>
          )}
        </div>

        {company.address && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-sm text-muted-foreground">{company.address}</p>
          </div>
        )}

        {showSocialLinks && company.socialLinks && (
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Connect with us</h4>
            <div className="flex gap-2 flex-wrap">
              {socialPlatforms.map((platform) => {
                const url = company.socialLinks?.[platform.key];
                if (!url) return null;

                return (
                  <Button
                    key={platform.key}
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <span>{platform.icon}</span>
                      {platform.name}
                    </a>
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specific components for different use cases
export function CompanyHeader({ className }: { className?: string }) {
  return (
    <CompanyInfo
      variant="compact"
      showSocialLinks={false}
      className={className}
    />
  );
}

export function CompanyFooter({ className }: { className?: string }) {
  return (
    <CompanyInfo
      variant="full"
      showSocialLinks={true}
      className={className}
    />
  );
}

export function CompanyBranding({ className }: { className?: string }) {
  return (
    <CompanyInfo
      variant="minimal"
      showSocialLinks={false}
      className={className}
    />
  );
}

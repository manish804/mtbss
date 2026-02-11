"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ContentUtils } from "@/lib/content-utils";
import {
  Heart,
  PiggyBank,
  Home,
  GraduationCap,
  Calendar,
  Dumbbell,
  Laptop,
  Trophy,
  Lightbulb,
  Users,
  TrendingUp,
  Target,
  Scale,
  MessageCircle,
} from "lucide-react";

const iconMap = {
  Heart,
  PiggyBank,
  Home,
  GraduationCap,
  Calendar,
  Dumbbell,
  Laptop,
  Trophy,
  Lightbulb,
  Users,
  TrendingUp,
  Target,
  Scale,
  MessageCircle,
};

const colorMap = {
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-200",
  blue: "bg-blue-50 text-blue-600 border-blue-200",
  purple: "bg-purple-50 text-purple-600 border-purple-200",
  orange: "bg-orange-50 text-orange-600 border-orange-200",
  green: "bg-green-50 text-green-600 border-green-200",
  pink: "bg-pink-50 text-pink-600 border-pink-200",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
  yellow: "bg-yellow-50 text-yellow-600 border-yellow-200",
  red: "bg-red-50 text-red-600 border-red-200",
};

interface BenefitsCultureSectionProps {
  benefits?: Array<{
    id: string;
    icon: string;
    color: string;
    title: string;
    description: string;
  }>;
  culture?: Array<{
    id: string;
    icon: string;
    color: string;
    title: string;
    description: string;
  }>;
  config?: {
    title?: string;
    subtitle?: string;
    enabled?: boolean;
    showCompanyCulture?: boolean;
  };
}

export function BenefitsCultureSection({ 
  benefits: propBenefits, 
  culture: propCulture, 
  config 
}: BenefitsCultureSectionProps = {}) {
  const fallbackBenefits = ContentUtils.getBenefits();
  const fallbackCulture = ContentUtils.getCompanyCulture();
  
  const benefits = propBenefits || fallbackBenefits;
  const companyCulture = propCulture || fallbackCulture;

  const renderIcon = (iconName: string, className: string = "") => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? (
      <IconComponent className={className} aria-hidden="true" />
    ) : null;
  };

  const getColorClasses = (color: string) => {
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <section
      className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/20"
      aria-labelledby="benefits-culture-heading"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto space-y-16">
          <div
            className="space-y-12"
            role="region"
            aria-labelledby="benefits-heading"
          >
            <div className="text-center space-y-4">
              <h2
                id="benefits-heading"
                className="text-3xl md:text-4xl font-bold font-headline"
              >
                {config?.title || "Comprehensive Benefits Package"}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {config?.subtitle ||
                  "We believe in taking care of our team with competitive benefits that support your health, financial security, and professional growth."}
              </p>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              role="list"
              aria-label="Employee benefits"
            >
              {benefits.map((benefit) => (
                <Card
                  key={benefit.id}
                  className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20 focus-within:ring-2 focus-within:ring-primary/20"
                  role="listitem"
                >
                  <CardContent className="p-6 space-y-4 min-h-[160px] flex flex-col">
                    <div
                      className={`inline-flex p-3 rounded-xl border-2 ${getColorClasses(
                        benefit.color
                      )} group-hover:scale-110 transition-transform duration-300 self-start`}
                    >
                      {renderIcon(benefit.icon, "h-6 w-6")}
                    </div>
                    <div className="space-y-2 flex-1">
                      <h3 className="font-semibold text-lg leading-tight">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {config?.showCompanyCulture !== false && (
            <div
              className="space-y-12"
              role="region"
              aria-labelledby="culture-heading"
            >
              <div className="text-center space-y-4">
                <h2
                  id="culture-heading"
                  className="text-3xl md:text-4xl font-bold font-headline"
                >
                  Our Company Culture
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Join a team that values innovation, collaboration, and
                  personal growth. Our culture is built on shared values that
                  drive everything we do.
                </p>
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                role="list"
                aria-label="Company culture values"
              >
                {companyCulture.map((culture) => (
                  <Card
                    key={culture.id}
                    className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-br from-card to-card/50 focus-within:ring-2 focus-within:ring-primary/20"
                    role="listitem"
                  >
                    <CardContent className="p-8 space-y-6 min-h-[200px] flex flex-col">
                      <div
                        className={`inline-flex p-4 rounded-2xl border-2 ${getColorClasses(
                          culture.color
                        )} group-hover:scale-110 transition-transform duration-300 self-start`}
                      >
                        {renderIcon(culture.icon, "h-8 w-8")}
                      </div>
                      <div className="space-y-3 flex-1">
                        <h3 className="font-bold text-xl leading-tight">
                          {culture.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {culture.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div
            className="text-center space-y-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-8 md:p-12 bg-[#ffe9f0]"
            role="region"
            aria-labelledby="cta-heading"
          >
            <h3 id="cta-heading" className="text-2xl md:text-3xl font-bold">
              Ready to Join Our Team?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience these benefits and be part of a culture that values
              your growth and success. Browse our open positions and take the
              next step in your career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="#available-positions"
                className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 min-h-[48px]"
                style={
                  {
                    transition: "all 0.2s ease-in-out",
                    "--hover-bg": "#8dcbdb",
                  } as React.CSSProperties & { [key: string]: string }
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8dcbdb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                }}
                aria-label="View available job positions"
              >
                View Open Positions
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 min-h-[48px]"
                style={
                  {
                    transition: "all 0.2s ease-in-out",
                    "--hover-bg": "#8dcbdb",
                    "--hover-border": "#8dcbdb",
                  } as React.CSSProperties & { [key: string]: string }
                }
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#8dcbdb";
                  e.currentTarget.style.borderColor = "#8dcbdb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "";
                  e.currentTarget.style.borderColor = "";
                }}
                aria-label="Contact us for more information"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

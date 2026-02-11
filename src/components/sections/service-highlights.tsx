import { cn } from "@/lib/utils";
import {
  generateSectionStyles,
  migrateLegacyColors,
  resolveBackgroundStyle,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";
import { Briefcase, FileText, Handshake, Users, Calculator, Globe } from "lucide-react";

interface ServiceHighlightItem {
  icon: string;
  title: string;
  description: string;
}

interface ServiceHighlightsSectionProps {
  content?: {
    items?: ServiceHighlightItem[];
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

const iconMap = {
  Briefcase: Briefcase,
  FileText: FileText,
  Handshake: Handshake,
  Users: Users,
  Calculator: Calculator,
  Globe: Globe,
};

export default function ServiceHighlightsSection({ content }: ServiceHighlightsSectionProps) {
  const items = content?.items || [];

  const migratedStyling = content?.styling
    ? migrateLegacyColors(content.styling)
    : undefined;
  const { sectionStyles, textStyles, paddingClass } = generateSectionStyles({
    ...migratedStyling,
    backgroundColor: migratedStyling?.backgroundColor || "#ffffff",
    textColor: migratedStyling?.textColor || "#000000",
    padding: migratedStyling?.padding || "py-10 md:py-12",
  });
  const { backgroundClassName, backgroundStyle } = resolveBackgroundStyle(
    content?.styling?.cardStyle?.backgroundColor
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <section id="service-highlights" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap];

            return (
              <div
                key={index}
                className={cn(
                  "text-center space-y-4",
                  backgroundClassName || "bg-white",
                  content?.styling?.cardStyle?.padding || "p-6",
                  content?.styling?.cardStyle?.borderRadius || "rounded-lg",
                  content?.styling?.cardStyle?.shadowColor || "shadow-sm"
                )}
                style={backgroundStyle}
              >
                {IconComponent && (
                  <div className="flex justify-center">
                    <IconComponent className="h-12 w-12 text-primary" />
                  </div>
                )}
                <h3
                  className="text-xl font-bold"
                  style={textStyles}
                >
                  {item.title}
                </h3>
                <p style={textStyles}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { cn } from "@/lib/utils";
import {
  generateSectionStyles,
  migrateLegacyColors,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";

interface StatisticItem {
  number: string;
  label: string;
}

interface ServiceStatsSectionProps {
  content?: {
    enabled?: boolean;
    statistics?: StatisticItem[];
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

export default function ServiceStatsSection({ content }: ServiceStatsSectionProps) {
  if (!content?.enabled) {
    return null;
  }

  const statistics = content?.statistics || [];

  const migratedStyling = content?.styling
    ? migrateLegacyColors(content.styling)
    : undefined;
  const { sectionStyles, textStyles, paddingClass } = generateSectionStyles({
    ...migratedStyling,
    backgroundColor: migratedStyling?.backgroundColor || "#f8fafc",
    textColor: migratedStyling?.textColor || "#000000",
    padding: migratedStyling?.padding || "py-6",
  });

  if (statistics.length === 0) {
    return null;
  }

  return (
    <section id="service-stats" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {statistics.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                {stat.number}
              </div>
              <div className="text-sm" style={textStyles}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
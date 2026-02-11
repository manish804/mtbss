import { cn } from "@/lib/utils";
import {
  generateSectionStyles,
  migrateLegacyColors,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";

interface IntroductionSectionProps {
  content?: {
    title?: string;
    description?: string;
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

export default function IntroductionSection({ content }: IntroductionSectionProps) {
  const title = content?.title || "Top quality accounting services for your business";
  const description = content?.description || 
    "With more than two decades of experience, we work with companies of all sizes, and in all industries. We are dedicated to handling all tax issues swiftly and accurately, so that you can focus on what really matters to your business.";

  const migratedStyling = content?.styling
    ? migrateLegacyColors(content.styling)
    : undefined;
  const { sectionStyles, textStyles, paddingClass } = generateSectionStyles({
    ...migratedStyling,
    backgroundColor: migratedStyling?.backgroundColor || "#ffffff",
    textColor: migratedStyling?.textColor || "#000000",
    padding: migratedStyling?.padding || "py-10 md:py-12",
  });

  return (
    <section id="introduction" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2
            className="text-3xl md:text-4xl font-bold font-headline"
            style={textStyles}
          >
            {title}
          </h2>
          <p className="text-lg" style={textStyles}>
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}
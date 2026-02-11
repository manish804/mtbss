import { cn } from "@/lib/utils";
import {
  generateSectionStyles,
  migrateLegacyColors,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";

interface ContactSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

export default function ContactSection({ content }: ContactSectionProps) {
  const title = content?.title || "Contact Us";
  const subtitle = content?.subtitle || "Have a question or want to work with us? Fill out the form below.";

  const migratedStyling = content?.styling
    ? migrateLegacyColors(content.styling)
    : undefined;
  const { sectionStyles, textStyles, paddingClass } = generateSectionStyles({
    ...migratedStyling,
    backgroundColor: migratedStyling?.backgroundColor || "#ffffff",
    textColor: migratedStyling?.textColor || "#000000",
    padding: migratedStyling?.padding || "py-12 md:py-24 lg:py-32",
  });

  return (
    <section id="contact" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center space-y-6">
          <h2
            className="text-3xl md:text-4xl font-bold font-headline"
            style={textStyles}
          >
            {title}
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={textStyles}>
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
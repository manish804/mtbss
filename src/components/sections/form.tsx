import ContactForm from "./contact-form";
import { cn } from "@/lib/utils";
import { SECTION_CONTAINER_CLASS } from "@/lib/ui/layout-tokens";
import {
  generateSectionStyles,
  migrateLegacyColors,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";

interface FormSectionProps {
  content?: {
    title?: string;
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

export default function FormSection({ content }: FormSectionProps) {
  const title = content?.title || "Tell us your details and we'll get right back to you.";
  const subtitle = "Share a few details and we will respond within one business day.";

  const migratedStyling = content?.styling
    ? migrateLegacyColors(content.styling)
    : undefined;
  const { sectionStyles, textStyles, paddingClass } = generateSectionStyles({
    ...migratedStyling,
    backgroundColor: migratedStyling?.backgroundColor || "#ffffff",
    textColor: migratedStyling?.textColor || "#000000",
    padding: migratedStyling?.padding || "py-12 md:py-16",
  });

  return (
    <section id="form" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className={cn(SECTION_CONTAINER_CLASS, "relative z-10")}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 space-y-3">
            <h2
              className="text-2xl md:text-3xl font-bold font-headline"
              style={textStyles}
            >
              {title}
            </h2>
            <p className="text-sm md:text-base opacity-90" style={textStyles}>
              {subtitle}
            </p>
          </div>
          <ContactForm styling={content?.styling} />
        </div>
      </div>
    </section>
  );
}

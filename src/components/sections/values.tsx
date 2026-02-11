import { cn } from "@/lib/utils";
import {
  generateSectionStyles,
  migrateLegacyColors,
  resolveBackgroundStyle,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";

interface ValueItem {
  number: number;
  title: string;
  description: string;
}

interface ValuesSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    items?: ValueItem[];
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

export default function ValuesSection({ content }: ValuesSectionProps) {
  const title = content?.title || "The city's top accounting firms for more than ten years in a row.";
  const subtitle = content?.subtitle || 
    "Our team of professionals has been working to provide solid solutions for your personal planning and business strategy needs for over 30 years. All of our services are tailored to meet the diverse phases of your personal and business growth.";
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

  return (
    <section id="values" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center space-y-6 mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold font-headline"
            style={textStyles}
          >
            {title}
          </h2>
          <p className="text-lg max-w-4xl mx-auto" style={textStyles}>
            {subtitle}
          </p>
        </div>
        
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <div
                key={item.number}
                className={cn(
                  "p-6 rounded-lg",
                  backgroundClassName || "bg-white",
                  content?.styling?.cardStyle?.shadowColor || "shadow-md",
                  content?.styling?.cardStyle?.borderRadius || "rounded-lg",
                  content?.styling?.cardStyle?.padding || ""
                )}
                style={backgroundStyle}
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                    {item.number}
                  </div>
                  <h3 className="text-xl font-semibold" style={textStyles}>
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-600" style={textStyles}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

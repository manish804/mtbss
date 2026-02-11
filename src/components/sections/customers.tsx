"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";
import { usePublicCompany } from "@/hooks/use-company";
import {
  generateSectionStyles,
  migrateLegacyColors,
  resolveBackgroundStyle,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";

interface ImageData {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
}

interface CustomerLogo {
  name: string;
  image?: ImageData;
}

interface CustomersSectionProps {
  content?: {
    title?: string;
    subtitle?: string;
    customerLogos?: CustomerLogo[];
    testimonials?: {
      name: string;
      company: string;
      content: string;
      rating: number;
    }[];
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

const defaultCustomers = [
  {
    name: "6898",
    image: PlaceHolderImages.find((p) => p.id === "customer-6898"),
  },
  {
    name: "Central",
    image: PlaceHolderImages.find((p) => p.id === "customer-central"),
  },
  {
    name: "Karlson",
    image: PlaceHolderImages.find((p) => p.id === "customer-karlson"),
  },
  { name: "W", image: PlaceHolderImages.find((p) => p.id === "customer-w") },
  {
    name: "Von Callen",
    image: PlaceHolderImages.find((p) => p.id === "customer-von-callen"),
  },
];

export default function CustomersSection({ content }: CustomersSectionProps) {
  const { company } = usePublicCompany();
  const title = content?.title || `${company?.name || "Our"} Customers`;
  const subtitle =
    content?.subtitle ||
    "Join our growing list of satisfied clients, including:";

  const testimonials = content?.testimonials || [];
  const customers = content?.customerLogos || defaultCustomers;

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
    <section id="customers" className={cn("relative", paddingClass)}>
      <div className="absolute inset-0" style={sectionStyles} />
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center">
          <h2
            className="text-3xl md:text-4xl font-bold font-headline"
            style={textStyles}
          >
            {title}
          </h2>
          <p className="mt-4" style={textStyles}>
            {subtitle}
          </p>
          <div className="mt-8">
            {testimonials.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-6 border",
                      backgroundClassName || "bg-white",
                      content?.styling?.cardStyle?.shadowColor || "shadow-md",
                      content?.styling?.cardStyle?.borderRadius || "rounded-lg",
                      content?.styling?.cardStyle?.padding || ""
                    )}
                    style={backgroundStyle}
                  >
                    <div className="flex items-center mb-4">
                      <div className="flex space-x-1">
                        {Array.from({ length: testimonial.rating }).map(
                          (_, i) => (
                            <Star
                              key={i}
                              className="w-4 h-4 text-yellow-500 fill-yellow-500"
                            />
                          )
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-semibold">
                      - {testimonial.name}, {testimonial.company}
                    </p>
                    <p className="mt-2 text-gray-600">{testimonial.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
          {customers.map((customer) => {
            const logoSrc = customer.image?.imageUrl?.trim();

            return (
              <div key={customer.name} className="relative h-12 w-32">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt={customer.image?.description || customer.name}
                    fill
                    className="object-contain"
                    data-ai-hint={customer.image?.imageHint}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-md border border-border/70 bg-muted/40 px-2">
                    <span className="text-center text-xs font-medium text-muted-foreground">
                      {customer.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

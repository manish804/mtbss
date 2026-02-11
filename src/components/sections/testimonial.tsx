"use client";

import Image from "next/image";
import { Quote } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePublicCompany } from "@/hooks/use-company";
import { cn } from "@/lib/utils";
import {
  generateSectionStyles,
  migrateLegacyColors,
  type SectionStyling as UiSectionStyling,
} from "@/lib/section-utils";
import type { SectionStyling as ContentSectionStyling } from "@/lib/content-types";
import type { SectionStyling as JsonSectionStyling } from "@/lib/types/json-schemas";

interface TestimonialSectionProps {
  content?: {
    enabled?: boolean;
    styling?: UiSectionStyling | ContentSectionStyling | JsonSectionStyling;
  };
}

export default function TestimonialSection({ content }: TestimonialSectionProps) {
  const { company } = usePublicCompany();
  
  // If disabled, don't render the section
  if (content?.enabled === false) {
    return null;
  }

  const mapImage = PlaceHolderImages.find((p) => p.id === "contact-map");
  const testimonialImage = PlaceHolderImages.find(
    (p) => p.id === "testimonial-group"
  );
  const avatarImage = PlaceHolderImages.find(
    (p) => p.id === "testimonial-avatar"
  );

  const migratedStyling = content?.styling
    ? migrateLegacyColors(content.styling)
    : undefined;
  const { sectionStyles, textStyles, paddingClass } = generateSectionStyles({
    ...migratedStyling,
    backgroundColor: migratedStyling?.backgroundColor || "#f8fafc",
    textColor: migratedStyling?.textColor || "#000000",
    padding: migratedStyling?.padding || "py-16 px-4",
  });

  return (
    <section className="w-full">
      <div className="relative h-96 w-full">
        <Image
          src={
            mapImage?.imageUrl ||
            "https://picsum.photos/seed/softax-map/1920/400"
          }
          alt={mapImage?.description || "A stylized map of a city."}
          fill
          className="object-cover"
          data-ai-hint={mapImage?.imageHint}
        />
      </div>
      <div className={cn("relative", paddingClass)}>
        <div className="absolute inset-0" style={sectionStyles} />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="relative aspect-[3/2] rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={
                  testimonialImage?.imageUrl ||
                  "https://picsum.photos/seed/softax-testimonial/600/400"
                }
                alt={
                  testimonialImage?.description ||
                  "A diverse group of three colleagues collaborating"
                }
                fill
                className="object-cover"
                data-ai-hint={testimonialImage?.imageHint}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="space-y-6">
              <Quote className="h-12 w-12 text-primary" />
              <blockquote className="text-2xl font-medium" style={textStyles}>
                {company?.name || "This company"} helps me handle the finances, so I can focus on what I do
                best: serving my customers and running my business.
              </blockquote>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage
                    src={avatarImage?.imageUrl}
                    alt={avatarImage?.description}
                  />
                  <AvatarFallback>LM</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold" style={textStyles}>Lucy Mendas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

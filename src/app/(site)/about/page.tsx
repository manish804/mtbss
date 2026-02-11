import { Suspense } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  generateSectionStyles,
  migrateLegacyColors,
  type SectionStyling,
} from "@/lib/section-utils";
import { HybridPageService } from "@/lib/services/hybrid-page-service";
import aboutData from "@/lib/pages/about.json";
import { PageLoader } from "@/components/ui/page-loader";

export const revalidate = 300;

async function AboutPageContent() {
  const dbContent = await HybridPageService.getCachedPageContent("about");
  const aboutContent = dbContent || aboutData;

  type StyleDefaults = {
    backgroundColor: string;
    textColor: string;
    padding: string;
  };

  const generateStyles = (styling: unknown, defaults: StyleDefaults) => {
    const migratedStyling =
      styling && typeof styling === "object" && !Array.isArray(styling)
        ? migrateLegacyColors(styling as SectionStyling)
        : undefined;

    return generateSectionStyles({
      backgroundColor: migratedStyling?.backgroundColor || defaults.backgroundColor,
      textColor: migratedStyling?.textColor || defaults.textColor,
      padding: migratedStyling?.padding || defaults.padding,
    });
  };

  const heroStyles = generateStyles(aboutContent.hero?.styling, {
    backgroundColor: "#f0f4f8",
    textColor: "#333333",
    padding: "py-12 px-4",
  });

  const introductionStyles = generateStyles(aboutContent.introduction?.styling, {
    backgroundColor: "bg-background",
    textColor: "text-foreground",
    padding: "py-10 md:py-12",
  });

  const valuesStyles = generateStyles(aboutContent.values?.styling, {
    backgroundColor: "#f9fafb",
    textColor: "#000000",
    padding: "py-10 md:py-12",
  });

  const chooseUsStyles = generateStyles(aboutContent.chooseUs?.styling, {
    backgroundColor: "bg-background",
    textColor: "text-foreground",
    padding: "py-10 md:py-12",
  });

  return (
    <main>
      {/* Hero Section */}
      <section className={cn("relative text-center", heroStyles.paddingClass)}>
        <div className="absolute inset-0" style={heroStyles.sectionStyles} />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={heroStyles.textStyles}>
            {aboutContent.hero?.title}
          </h1>
          <p className="text-lg md:text-xl mb-6 max-w-3xl mx-auto" style={heroStyles.textStyles}>
            {aboutContent.hero?.subtitle}
          </p>
          {aboutContent.hero?.ctaText && aboutContent.hero?.ctaLink && (
            <Button asChild size="lg" className="font-bold">
              <Link href={aboutContent.hero.ctaLink}>
                {aboutContent.hero.ctaText}
              </Link>
            </Button>
          )}
        </div>
      </section>

      {/* Introduction Section */}
      <section className={cn("relative", introductionStyles.paddingClass)}>
        <div className="absolute inset-0" style={introductionStyles.sectionStyles} />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold font-headline" style={introductionStyles.textStyles}>
                {aboutContent.introduction?.title}
              </h2>
              <div className="space-y-6">
                <p className="text-lg leading-relaxed" style={introductionStyles.textStyles}>
                  {aboutContent.introduction?.description}
                </p>
                <div className="space-y-4">
                  <p className="font-semibold" style={introductionStyles.textStyles}>
                    {aboutContent.introduction?.teamIntro}
                  </p>
                  <div className="space-y-6">
                    {aboutContent.introduction?.teamMembers?.map((member, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                          •
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold mb-2" style={introductionStyles.textStyles}>
                            {member.name}
                          </p>
                          <p style={introductionStyles.textStyles}>
                            {member.bio}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {aboutContent.introduction?.image && (
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={aboutContent.introduction.image.imageUrl}
                  alt={aboutContent.introduction.image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={aboutContent.introduction.image.imageHint}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={cn("relative", valuesStyles.paddingClass)}>
        <div className="absolute inset-0" style={valuesStyles.sectionStyles} />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-4" style={valuesStyles.textStyles}>
            {aboutContent.values?.title}
          </h2>
          <p className="max-w-3xl mx-auto mb-12" style={valuesStyles.textStyles}>
            {aboutContent.values?.subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aboutContent.values?.items?.map((item) => (
              <div key={item.number} className="bg-card p-6 rounded-lg border text-left">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center font-bold text-xl">
                    {item.number}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3" style={valuesStyles.textStyles}>
                  {item.title}
                </h3>
                <p style={valuesStyles.textStyles}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Choose Us Section */}
      <section className={cn("relative", chooseUsStyles.paddingClass)}>
        <div className="absolute inset-0" style={chooseUsStyles.sectionStyles} />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            {aboutContent.chooseUs?.image && (
              <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={aboutContent.chooseUs.image.imageUrl}
                  alt={aboutContent.chooseUs.image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={aboutContent.chooseUs.image.imageHint}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold font-headline" style={chooseUsStyles.textStyles}>
                {aboutContent.chooseUs?.title}
              </h2>
              <div className="space-y-6">
                {aboutContent.chooseUs?.features?.map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="bg-primary/10 text-primary rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1">
                      ✓
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2" style={chooseUsStyles.textStyles}>
                        {feature.title}
                      </h3>
                      <p style={chooseUsStyles.textStyles}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/* <section className={cn("relative", teamStyles.paddingClass)}>
        <div className="absolute inset-0" style={teamStyles.sectionStyles} />
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold font-headline" style={teamStyles.textStyles}>
                {aboutContent.team?.title}
              </h2>
              <p style={teamStyles.textStyles}>
                {aboutContent.team?.subtitle}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {aboutContent.team?.teamImages?.map((image, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section> */}


    </main>
  );
}

export default function AboutPage() {
  return (
    <Suspense fallback={<PageLoader text="Loading about page..." />}>
      <AboutPageContent />
    </Suspense>
  );
}

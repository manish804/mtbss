import { Suspense } from "react";
import { ContentUtils } from "@/lib/content-utils";
import { HybridPageService } from "@/lib/services/hybrid-page-service";
import HeroSection from "@/components/sections/hero";
import AboutServicesSection from "@/components/sections/about-services";
import IndustriesSection from "@/components/sections/industries";
import TrustSection from "@/components/sections/trust";
import CustomersSection from "@/components/sections/customers";
import CallToActionSection from "@/components/sections/cta";
import { PageLoader } from "@/components/ui/page-loader";

export const revalidate = 300;

async function HomeContent() {
  const dbContent = await HybridPageService.getCachedPageContent("home");

  const homeContent = dbContent || ContentUtils.getHomePageContent();

  if (!homeContent) {
    return (
      <>
        <HeroSection />
        <AboutServicesSection />
        <IndustriesSection />
        <TrustSection />
        <CustomersSection />
        <CallToActionSection />
      </>
    );
  }

  // Normalize and type-cast content for section components to handle DB and JSON sources
  type HeroContent = Parameters<typeof HeroSection>[0]['content'];
  type AboutServicesContent = Parameters<typeof AboutServicesSection>[0]['content'];
  type IndustriesContent = Parameters<typeof IndustriesSection>[0]['content'];
  type TrustContent = Parameters<typeof TrustSection>[0]['content'];
  type CustomersContent = Parameters<typeof CustomersSection>[0]['content'];
  type CtaContent = Parameters<typeof CallToActionSection>[0]['content'];

  const heroContent = homeContent.hero as HeroContent | undefined;
  const aboutServicesContent = homeContent.aboutServices as AboutServicesContent | undefined;
  const industriesContent = homeContent.industries as IndustriesContent | undefined;
  const trustContent = homeContent.trust as TrustContent | undefined;
  const customersContent = homeContent.customers as CustomersContent | undefined;
  const ctaContent = homeContent.callToAction as CtaContent | undefined;

  return (
    <>
      <HeroSection content={heroContent} />
      <AboutServicesSection content={aboutServicesContent} />
      <IndustriesSection content={industriesContent} />
      <TrustSection content={trustContent} />
      <CustomersSection content={customersContent} />
      <CallToActionSection content={ctaContent} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<PageLoader text="Loading page content..." />}>
      <HomeContent />
    </Suspense>
  );
}

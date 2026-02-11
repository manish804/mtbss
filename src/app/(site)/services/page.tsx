import { Suspense } from "react";
import { HybridPageService } from "@/lib/services/hybrid-page-service";
import { ContentUtils } from "@/lib/content-utils";
import HeroSection from "@/components/sections/hero";
import ServiceDetailsSection from "@/components/sections/service-details";
import { PageLoader } from "@/components/ui/page-loader";

export const revalidate = 300;

async function ServicesPageContent() {
  const dbContent = await HybridPageService.getCachedPageContent("services");
  const servicesContent = dbContent || ContentUtils.getServicesPageContent();

  if (!servicesContent) {
    return <FallbackServicesPage />;
  }

  // Type the content for section components
  type HeroContent = Parameters<typeof HeroSection>[0]['content'];
  type ServiceDetailsContent = Parameters<typeof ServiceDetailsSection>[0]['content'];

  const heroContent = servicesContent.hero as HeroContent | undefined;
  const serviceDetailsContent = servicesContent.serviceDetails as ServiceDetailsContent | undefined;

  return (
    <main>
      <HeroSection content={heroContent} />
      {serviceDetailsContent && (
        <ServiceDetailsSection content={serviceDetailsContent} />
      )}
    </main>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<PageLoader text="Loading services..." />}>
      <ServicesPageContent />
    </Suspense>
  );
}

function FallbackServicesPage() {
  return (
    <main>
      <section className="py-12 md:py-20 lg:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-6">
              Our Services
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12">
              We provide end-to-end financial and business support services tailored to meet the
              needs of growing organizations and overseas clients.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Bookkeeping Services</h3>
              <p className="text-muted-foreground">
                Accurate and timely recording of all financial transactions.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Accounts Receivable Management</h3>
              <p className="text-muted-foreground">
                Invoicing, collection tracking, and customer account reconciliation.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Accounts Payable Management</h3>
              <p className="text-muted-foreground">
                Vendor payments, expense management, and cash flow optimization.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Financial Statements Preparation</h3>
              <p className="text-muted-foreground">
                Balance sheet, profit & loss statements, and customized MIS reports.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Forecasting & Financial Planning</h3>
              <p className="text-muted-foreground">
                Data-driven insights to help businesses plan for the future.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-semibold mb-3">Invoice Preparation & Quotation Support</h3>
              <p className="text-muted-foreground">
                Professional preparation of invoices and quotations for clients.
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border md:col-span-2 lg:col-span-1">
              <h3 className="text-xl font-semibold mb-3">Staff Recruitment for Overseas Clients</h3>
              <p className="text-muted-foreground">
                Sourcing and hiring skilled professionals tailored to specific business needs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}



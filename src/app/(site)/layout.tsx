import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { PublicCompanyProvider } from "@/components/providers/public-company-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { getPublicCompanyData } from "@/lib/services/public-company-service";
import type { PublicCompanyState } from "@/lib/types/company";
import { Manrope, Playfair_Display } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-site-body",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-site-headline",
  weight: ["600", "700"],
});

interface SiteLayoutProps {
  children: React.ReactNode;
}

export default async function SiteLayout({ children }: SiteLayoutProps) {
  const company = await getPublicCompanyData();
  const companyState: PublicCompanyState = {
    company,
    loading: false,
    error: null,
    isCompanyActive: company?.isActive ?? false,
  };

  return (
    <PublicCompanyProvider value={companyState}>
      <div
        className={`${manrope.variable} ${playfairDisplay.variable} site-shell relative flex min-h-screen flex-col overflow-x-clip`}
      >
        <div className="site-atmosphere" aria-hidden="true" />
        <Header />
        <main id="main-content" className="site-main flex-grow">
          {children}
        </main>
        <Footer />
      </div>
      <Toaster />
      {process.env.NODE_ENV === "production" ? (
        <>
          <SpeedInsights />
          <Analytics />
        </>
      ) : null}
    </PublicCompanyProvider>
  );
}

import dynamic from 'next/dynamic';
import { NavBar } from "@/components/landing/NavBar";
import { HeroSection } from "@/components/landing/HeroSection";

// Lazy load below-the-fold sections for better performance
// Using named exports with dynamic import
const FeaturesSection = dynamic(
  () => import('@/components/landing/FeaturesSection').then(mod => mod.FeaturesSection),
  { 
    loading: () => <div className="min-h-[400px]" />
  }
);

const BenefitsSection = dynamic(
  () => import('@/components/landing/BenefitsSection').then(mod => mod.BenefitsSection),
  { 
    loading: () => <div className="min-h-[400px]" />
  }
);

const HowItWorksSection = dynamic(
  () => import('@/components/landing/HowItWorksSection').then(mod => mod.HowItWorksSection),
  { 
    loading: () => <div className="min-h-[400px]" />
  }
);

const PricingSection = dynamic(
  () => import('@/components/landing/PricingSection').then(mod => mod.PricingSection),
  { 
    loading: () => <div className="min-h-[400px]" />
  }
);

const CTASection = dynamic(
  () => import('@/components/landing/CTASection').then(mod => mod.CTASection),
  { 
    loading: () => <div className="min-h-[200px]" />
  }
);

const Footer = dynamic(
  () => import('@/components/landing/Footer').then(mod => mod.Footer),
  { 
    loading: () => <div className="min-h-[300px]" />
  }
);

import { LANDING_FEATURES, LANDING_BENEFITS, LANDING_PLANS } from "@/lib/constants/landing";

/**
 * Landing Page Component - Optimized for Performance
 * Server-side rendered with lazy-loaded sections for optimal LCP
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Critical above-the-fold content - loaded immediately */}
      <NavBar />
      <HeroSection />

      {/* Below-the-fold sections - lazy loaded */}
      <FeaturesSection features={LANDING_FEATURES} />
      <HowItWorksSection />
      <BenefitsSection benefits={LANDING_BENEFITS} />
      <PricingSection plans={LANDING_PLANS} />
      <CTASection />
      <Footer />
    </div>
  );
}
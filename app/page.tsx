"use client"
import dynamic from 'next/dynamic';
import { NavBar } from "@/components/landing/NavBar";
import { HeroSection } from "@/components/landing/HeroSection";

// Lazy load below-the-fold sections with no SSR
// Using named exports with dynamic import
const FeaturesSection = dynamic<any>(
  () => import('@/components/landing/FeaturesSection').then(mod => mod.FeaturesSection),
  { 
    ssr: false,
    loading: () => <div className="min-h-[400px]" />
  }
);

const BenefitsSection = dynamic<any>(
  () => import('@/components/landing/BenefitsSection').then(mod => mod.BenefitsSection),
  { 
    ssr: false,
    loading: () => <div className="min-h-[400px]" />
  }
);

const HowItWorksSection = dynamic<any>(
  () => import('@/components/landing/HowItWorksSection').then(mod => mod.HowItWorksSection),
  { 
    ssr: false,
    loading: () => <div className="min-h-[400px]" />
  }
);

const PricingSection = dynamic<any>(
  () => import('@/components/landing/PricingSection').then(mod => mod.PricingSection),
  { 
    ssr: false,
    loading: () => <div className="min-h-[400px]" />
  }
);

const CTASection = dynamic<any>(
  () => import('@/components/landing/CTASection').then(mod => mod.CTASection),
  { 
    ssr: false,
    loading: () => <div className="min-h-[200px]" />
  }
);

const Footer = dynamic<any>(
  () => import('@/components/landing/Footer').then(mod => mod.Footer),
  { 
    ssr: false,
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
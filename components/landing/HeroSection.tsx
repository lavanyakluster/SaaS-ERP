'use client';

import { useEffect, useState } from 'react';

interface HeroSectionProps {
  theme?: 'light' | 'dark' | 'system';
}

export function HeroSection({ theme = 'light' }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render immediately without waiting for mounted state for LCP
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600"
    >
      {/* Simplified background - CSS only for better performance */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-30 bg-white animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-30 bg-white animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Content - Visible immediately */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          {/* Badge - Visible immediately */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 bg-white/20 backdrop-blur-sm border border-white/30 opacity-0 animate-fade-in">
            <span className="text-xl">✨</span>
            <span className="text-white">
              GCC's Leading Finance Platform
            </span>
          </div>

          {/* Main Heading - Critical LCP element, visible immediately */}
          <h1 className="mb-6">
            <span className="block text-5xl sm:text-6xl md:text-7xl font-bold text-white">
              Transform Your
            </span>
            <span className="block mt-2 text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-emerald-50 to-white bg-clip-text text-transparent">
              Financial Operations
            </span>
          </h1>

          {/* Subheading */}
          <p className="max-w-3xl mx-auto mb-12 text-xl text-white/90">
            SmartBook delivers enterprise-grade ERP solutions for the GCC market.
            Streamline accounting, manage multi-branch operations, and scale with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="/signup"
              className="group px-8 py-4 bg-white text-emerald-700 font-semibold rounded-2xl shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-105 flex items-center gap-2"
            >
              <span>Start Free Trial</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a
              href="#features"
              className="px-8 py-4 font-semibold rounded-2xl transition-all hover:scale-105 flex items-center gap-2 bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-sm"
            >
              <span className="text-xl">▶</span>
              <span>Watch Demo</span>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✓</span>
              <span className="text-white/80">
                GCC Compliant
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="text-white/80">
                Bank-Grade Security
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-white/80">
                Real-Time Insights
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <span className="text-white/80">
                Multi-Currency
              </span>
            </div>
          </div>

          {/* Stats - Load after mount for progressive enhancement */}
          {mounted && (
            <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto opacity-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="text-4xl font-bold mb-2 text-white">500+</div>
                <div className="text-white/80">Active Clients</div>
              </div>
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="text-4xl font-bold mb-2 text-white">99.9%</div>
                <div className="text-white/80">Uptime SLA</div>
              </div>
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="text-4xl font-bold mb-2 text-white">24/7</div>
                <div className="text-white/80">Support</div>
              </div>
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="text-4xl font-bold mb-2 text-white">6+</div>
                <div className="text-white/80">GCC Markets</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
        </div>
      </div>
    </section>
  );
}

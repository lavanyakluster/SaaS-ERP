'use client';

import { Building2, Globe2, Users, TrendingUp, Shield, Award, Check, Star, Zap, BarChart3, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface EnterpriseCarouselProps {
  theme?: 'light' | 'dark' | 'system';
}

export const EnterpriseCarousel = ({ theme = 'dark' }: EnterpriseCarouselProps) => {
  return (
    <div className="w-full h-screen relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)
          `,
          backgroundSize: '48px 48px',
        }} />
      </div>

      {/* Subtle Gradient Overlays */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-20" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl opacity-20" />

      <div className="relative z-10 h-full w-full overflow-hidden flex flex-col p-4">
        {/* Premium Header Section - Ultra Compact */}
        <div className="flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center shadow-xl border border-white/30">
              <Globe2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold tracking-tight leading-none">SmartBook</h2>
              <p className="text-white/80 text-[9px] font-medium leading-tight">Enterprise ERP Platform</p>
            </div>
          </div>

          {/* Certification Badges - Ultra Compact */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/10 backdrop-blur-md rounded border border-white/20">
              <Shield className="w-2.5 h-2.5 text-white" />
              <span className="text-white text-[9px] font-semibold">ISO 27001</span>
            </div>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/10 backdrop-blur-md rounded border border-white/20">
              <Award className="w-2.5 h-2.5 text-white" />
              <span className="text-white text-[9px] font-semibold">SOC 2</span>
            </div>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/10 backdrop-blur-md rounded border border-white/20">
              <Lock className="w-2.5 h-2.5 text-white" />
              <span className="text-white text-[9px] font-semibold">GDPR</span>
            </div>
          </div>
        </div>

        {/* Main Content Section - Ultra Compact */}
        <div className="flex-1 flex flex-col justify-center min-h-0 py-2 overflow-hidden">
          {/* Hero Statement - Ultra Compact */}
          <div className="mb-2">
            <h3 className="text-white text-xl font-bold leading-tight mb-1">
              Trusted by enterprises
              <br />
              <span className="text-white/90">
                across the Middle East
              </span>
            </h3>
            <p className="text-white/80 text-[10px] leading-snug">
              Join thousands of businesses streamlining operations.
            </p>
          </div>

          {/* Stats Grid - Ultra Compact */}
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            {/* Stat 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/10 backdrop-blur-md rounded-md p-2 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center gap-1.5">
                <div className="p-0.5 bg-white/20 rounded">
                  <Building2 className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-white text-base font-bold leading-none">5,600+</p>
                  <p className="text-white/80 text-[9px] leading-tight">Businesses</p>
                </div>
              </div>
            </motion.div>

            {/* Stat 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md rounded-md p-2 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center gap-1.5">
                <div className="p-0.5 bg-white/20 rounded">
                  <Users className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-white text-base font-bold leading-none">50,000+</p>
                  <p className="text-white/80 text-[9px] leading-tight">Daily Users</p>
                </div>
              </div>
            </motion.div>

            {/* Stat 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md rounded-md p-2 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center gap-1.5">
                <div className="p-0.5 bg-white/20 rounded">
                  <BarChart3 className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-white text-base font-bold leading-none">99.9%</p>
                  <p className="text-white/80 text-[9px] leading-tight">Uptime SLA</p>
                </div>
              </div>
            </motion.div>

            {/* Stat 4 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-md rounded-md p-2 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="flex items-center gap-1.5">
                <div className="p-0.5 bg-white/20 rounded">
                  <Star className="w-3 h-3 text-white" />
                </div>
                <div>
                  <p className="text-white text-base font-bold leading-none">4.9/5</p>
                  <p className="text-white/80 text-[9px] leading-tight">Rating</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Key Features - Ultra Compact */}
          <div className="bg-white/10 backdrop-blur-md rounded-md p-2 border border-white/20">
            <h4 className="text-white text-xs font-bold mb-1.5">Why SmartBook</h4>
            <div className="grid grid-cols-2 gap-1.5">
              <div className="flex items-start gap-1">
                <div className="mt-0.5 p-0.5 bg-white/20 rounded">
                  <Check className="w-2 h-2 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-[9px] leading-tight">Advanced Security</p>
                  <p className="text-white/70 text-[8px] leading-tight">Bank-level encryption</p>
                </div>
              </div>
              <div className="flex items-start gap-1">
                <div className="mt-0.5 p-0.5 bg-white/20 rounded">
                  <Check className="w-2 h-2 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-[9px] leading-tight">Real-time Analytics</p>
                  <p className="text-white/70 text-[8px] leading-tight">AI-powered insights</p>
                </div>
              </div>
              <div className="flex items-start gap-1">
                <div className="mt-0.5 p-0.5 bg-white/20 rounded">
                  <Check className="w-2 h-2 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-[9px] leading-tight">24/7 Support</p>
                  <p className="text-white/70 text-[8px] leading-tight">Dedicated managers</p>
                </div>
              </div>
              <div className="flex items-start gap-1">
                <div className="mt-0.5 p-0.5 bg-white/20 rounded">
                  <Check className="w-2 h-2 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-[9px] leading-tight">Scalable Infrastructure</p>
                  <p className="text-white/70 text-[8px] leading-tight">Grows with you</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section - Ultra Compact */}
        <div className="flex-shrink-0">
          {/* Trust Indicators - Ultra Compact */}
          <div className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-md px-2.5 py-1.5 border border-white/20">
            <div className="text-center">
              <p className="text-white text-xs font-bold leading-none">150+</p>
              <p className="text-white/80 text-[8px] mt-0.5 leading-none">Countries</p>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="text-center">
              <p className="text-white text-xs font-bold leading-none">10M+</p>
              <p className="text-white/80 text-[8px] mt-0.5 leading-none">Transactions</p>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="text-center">
              <p className="text-white text-xs font-bold leading-none">99.9%</p>
              <p className="text-white/80 text-[8px] mt-0.5 leading-none">Uptime</p>
            </div>
            <div className="w-px h-4 bg-white/30" />
            <div className="text-center">
              <p className="text-white text-xs font-bold leading-none">&lt;200ms</p>
              <p className="text-white/80 text-[8px] mt-0.5 leading-none">Response</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

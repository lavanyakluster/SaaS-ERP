/**
 * ModernLoginLayout Component
 * Split-screen modern design for login page
 * Teal/Green gradient theme
 */

'use client';

import { ReactNode } from 'react';
import { 
  Shield, 
  Zap, 
  BarChart3,
  Star
} from 'lucide-react';
import { Logo } from '@/components/common';

interface ModernLoginLayoutProps {
  children: ReactNode;
  theme?: 'light' | 'dark';
}

export function ModernLoginLayout({ children, theme = 'dark' }: ModernLoginLayoutProps) {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed and performance'
    },
    {
      icon: Shield,
      title: 'Secure by Default',
      description: 'Bank-grade encryption & security'
    },
    {
      icon: BarChart3,
      title: 'Real-Time Insights',
      description: 'Live analytics and reporting'
    }
  ];

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Login Form */}
      <div className={`flex-1 flex items-center justify-center p-6 sm:p-8 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6">
            <Logo
              size="md"
              variant="gradient"
              showText={true}
              title="SmartBook ERP"
              subtitle="Cloud Business Solution"
              theme={theme}
            />
          </div>
          
          {children}
        </div>
      </div>

      {/* Right Side - Brand Showcase */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden">
        {/* Animated Gradient Background - Teal/Green */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 animate-gradient-xy" />
        
        {/* Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.3), transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(20, 184, 166, 0.3), transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(6, 182, 212, 0.3), transparent 50%)
            `
          }} />
        </div>

        {/* Floating Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-white/5 rounded-full blur-2xl animate-pulse" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full text-white">
          {/* Logo & Title */}
          <div>
            <div className="mb-8">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 flex items-center justify-center mb-5">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl font-bold mb-3 leading-tight">
                Welcome back to<br/>SmartBook
              </h1>
              <p className="text-lg text-white/90">
                Your business, simplified.
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold mb-0.5">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="mt-8 bg-white/10 backdrop-blur-xl rounded-xl p-5 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-9 h-9 bg-white/30 rounded-full border-2 border-white/50" />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-sm text-white/90 font-medium mb-0.5">
              Trusted by 5,000+ businesses across GCC
            </p>
            <p className="text-xs text-white/70">
              Join the leading ERP platform for modern businesses
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes gradient-xy {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-20px);
            }
          }
          
          .animate-gradient-xy {
            background-size: 400% 400%;
            animation: gradient-xy 15s ease infinite;
          }
          
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}

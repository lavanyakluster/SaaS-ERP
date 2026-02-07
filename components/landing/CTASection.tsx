'use client';

interface CTASectionProps {
  theme?: 'light' | 'dark';
}

export function CTASection({ theme = 'light' }: CTASectionProps) {
  return (
    <section className={`py-24 ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
    } transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative overflow-hidden rounded-3xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 border border-gray-800' 
            : 'bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600'
        } p-12 md:p-16`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-8 right-8 animate-float">
            <div className={`w-16 h-16 rounded-2xl ${
              theme === 'dark' ? 'bg-emerald-500/20' : 'bg-white/20'
            } backdrop-blur-sm flex items-center justify-center`}>
              <span className="text-3xl">🚀</span>
            </div>
          </div>
          <div className="absolute bottom-8 left-8 animate-float" style={{ animationDelay: '0.5s' }}>
            <div className={`w-12 h-12 rounded-2xl ${
              theme === 'dark' ? 'bg-teal-500/20' : 'bg-white/20'
            } backdrop-blur-sm flex items-center justify-center`}>
              <span className="text-2xl">✨</span>
            </div>
          </div>

          {/* Content */}
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
              theme === 'dark' 
                ? 'bg-emerald-500/10 border border-emerald-500/20' 
                : 'bg-white/20 backdrop-blur-sm border border-white/30'
            }`}>
              <span className="text-xl">🎯</span>
              <span className={`${theme === 'dark' ? 'text-emerald-400' : 'text-white'}`}>
                Ready to Get Started?
              </span>
            </div>

            <h2 className={`text-4xl md:text-5xl mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-white'
            }`}>
              Transform Your Business{' '}
              <span className={`block mt-2 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent' 
                  : ''
              }`}>
                Starting Today
              </span>
            </h2>

            <p className={`text-xl mb-10 ${
              theme === 'dark' ? 'text-gray-300' : 'text-white/90'
            }`}>
              Join 500+ businesses already using SmartBook to streamline their 
              financial operations across the GCC region.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <a
                href="/signup"
                className={`group px-8 py-4 rounded-2xl shadow-2xl transition-all hover:scale-105 flex items-center gap-2 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' 
                    : 'bg-white text-emerald-700'
                }`}
              >
                <span>Start Your Free Trial</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
              <a
                href="#pricing"
                className={`px-8 py-4 rounded-2xl transition-all hover:scale-105 flex items-center gap-2 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:border-emerald-500' 
                    : 'bg-white/10 text-white border border-white/30 hover:bg-white/20 backdrop-blur-sm'
                }`}
              >
                <span>View Pricing</span>
              </a>
            </div>

            {/* Trust Elements */}
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-white/80'}`}>
                  14-day free trial
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-white/80'}`}>
                  No credit card required
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-white/80'}`}>
                  Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className={`text-center p-6 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
          } border ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`text-3xl mb-2 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent`}>
              4.9/5
            </div>
            <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Customer Rating
            </div>
            <div className="mt-2 text-xl">⭐⭐⭐⭐⭐</div>
          </div>
          <div className={`text-center p-6 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
          } border ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`text-3xl mb-2 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent`}>
              500+
            </div>
            <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Happy Clients
            </div>
            <div className="mt-2 text-xl">🎉</div>
          </div>
          <div className={`text-center p-6 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
          } border ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`text-3xl mb-2 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent`}>
              99.9%
            </div>
            <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Uptime SLA
            </div>
            <div className="mt-2 text-xl">⚡</div>
          </div>
          <div className={`text-center p-6 rounded-2xl ${
            theme === 'dark' ? 'bg-gray-800/50' : 'bg-white'
          } border ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className={`text-3xl mb-2 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent`}>
              24/7
            </div>
            <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Support Available
            </div>
            <div className="mt-2 text-xl">🎧</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Add custom animation
if (typeof document !== 'undefined') {
  const styleId = 'cta-animations';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
      
      .animate-float {
        animation: float 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
  }
}

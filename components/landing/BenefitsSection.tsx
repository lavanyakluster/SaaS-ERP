'use client';

interface BenefitsSectionProps {
  benefits: readonly string[];
  theme?: 'light' | 'dark';
}

// Icon mapping for benefits
const benefitIcons: Record<string, string> = {
  'Streamlined financial management': '💰',
  'Automated reporting and compliance': '📋',
  'Multi-currency support': '💱',
  'Customizable workflows': '🔧',
  'Mobile-ready interface': '📱',
  'RTL Arabic language support': '🌐',
  '24/7 customer support': '🎧',
  'Regular updates and improvements': '🔄',
};

export function BenefitsSection({ benefits, theme = 'light' }: BenefitsSectionProps) {
  return (
    <section 
      id="benefits"
      className={`py-24 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'
      } transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
              theme === 'dark' 
                ? 'bg-emerald-500/10 border border-emerald-500/20' 
                : 'bg-white border border-emerald-200 shadow-sm'
            }`}>
              <span className="text-xl">💎</span>
              <span className={`${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
                Why Choose SmartBook
              </span>
            </div>

            <h2 className={`text-4xl md:text-5xl mb-6 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Built for the{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                GCC Market
              </span>
            </h2>

            <p className={`text-xl mb-8 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
            }`}>
              SmartBook is specifically designed to meet the unique requirements of businesses 
              operating in the GCC region, with full support for local regulations and practices.
            </p>

            {/* Key Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className={`p-6 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-emerald-100 shadow-sm'
              }`}>
                <div className={`text-3xl mb-2 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent`}>
                  <span className="text-4xl">500+</span>
                </div>
                <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Happy Clients
                </div>
              </div>
              <div className={`p-6 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-emerald-100 shadow-sm'
              }`}>
                <div className={`text-3xl mb-2 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent`}>
                  <span className="text-4xl">99.9%</span>
                </div>
                <div className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Uptime SLA
                </div>
              </div>
            </div>

            <a
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              <span>Get Started Now</span>
              <span>→</span>
            </a>
          </div>

          {/* Right Content - Benefits List */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={`group p-6 rounded-2xl transition-all duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-800/50 border border-gray-700 hover:border-emerald-500/50 hover:bg-gray-800' 
                      : 'bg-white border border-gray-200 hover:border-emerald-300 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-2xl">{benefitIcons[benefit] || '✓'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {benefit}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className={`mt-6 p-6 rounded-2xl border-2 border-dashed ${
              theme === 'dark' ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-emerald-300 bg-emerald-50'
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎁</span>
                <div>
                  <h4 className={`mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Special Launch Offer
                  </h4>
                  <p className={`${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Get 2 months free when you sign up for an annual plan. Limited time offer!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

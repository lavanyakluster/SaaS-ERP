'use client';

interface HowItWorksSectionProps {
  theme?: 'light' | 'dark' | 'system';
}

const steps = [
  {
    number: '01',
    title: 'Sign Up in Minutes',
    description: 'Create your account with email or social login. Quick verification and onboarding process.',
    icon: '📝',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    number: '02',
    title: 'Set Up Your Organization',
    description: 'Configure branches, chart of accounts, and user roles to match your business structure.',
    icon: '⚙️',
    gradient: 'from-teal-500 to-cyan-600',
  },
  {
    number: '03',
    title: 'Import Your Data',
    description: 'Seamlessly migrate existing financial data with our smart import tools and validation.',
    icon: '📥',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    number: '04',
    title: 'Start Managing',
    description: 'Access powerful dashboards, create transactions, and generate reports instantly.',
    icon: '🚀',
    gradient: 'from-emerald-600 to-green-600',
  },
];

export function HowItWorksSection({ theme = 'light' }: HowItWorksSectionProps) {
  return (
    <section 
      className={`py-24 ${
        theme === 'dark' ? 'bg-gray-950' : 'bg-white'
      } transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            theme === 'dark' 
              ? 'bg-teal-500/10 border border-teal-500/20' 
              : 'bg-teal-100 border border-teal-200'
          }`}>
            <span className="text-xl">🎯</span>
            <span className={`${theme === 'dark' ? 'text-teal-400' : 'text-teal-700'}`}>
              Simple Process
            </span>
          </div>
          <h2 className={`text-4xl md:text-5xl mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Get Started in{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Four Easy Steps
            </span>
          </h2>
          <p className={`text-xl max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            From signup to full operation in less than an hour
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Connecting Line (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className={`hidden lg:block absolute top-12 left-full w-full h-0.5 ${
                  theme === 'dark' ? 'bg-gradient-to-r from-gray-700 to-transparent' : 'bg-gradient-to-r from-gray-200 to-transparent'
                }`}></div>
              )}

              {/* Step Card */}
              <div className={`relative p-8 rounded-3xl transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-gray-900/50 border border-gray-800 hover:border-gray-700' 
                  : 'bg-gray-50 border border-gray-200 hover:border-emerald-300 hover:shadow-xl'
              }`}>
                {/* Step Number */}
                <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg`}>
                  <span className="text-white text-sm">{step.number}</span>
                </div>

                {/* Icon */}
                <div className={`mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-4xl">{step.icon}</span>
                </div>

                {/* Content */}
                <h3 className={`mb-3 text-xl ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {step.title}
                </h3>
                <p className={`${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className={`mb-6 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Ready to transform your financial operations?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/signup"
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              Start Your Free Trial
            </a>
            <a
              href="#pricing"
              className={`px-8 py-4 rounded-2xl transition-all hover:scale-105 ${
                theme === 'dark' 
                  ? 'bg-gray-900 text-gray-300 border border-gray-800 hover:border-gray-700' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-emerald-500'
              }`}
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

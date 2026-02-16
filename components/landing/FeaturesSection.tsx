'use client';

import { useState } from 'react';

interface Feature {
  iconName: string;
  title: string;
  description: string;
  gradient: string;
}

interface FeaturesSectionProps {
  features: Feature[];
  theme?: 'light' | 'dark' | 'system';
}

// Icon mapping with emojis
const iconMap: Record<string, string> = {
  'BarChart3': '📊',
  'Shield': '🛡️',
  'Zap': '⚡',
  'Globe': '🌍',
  'Users': '👥',
  'TrendingUp': '📈',
};

export function FeaturesSection({ features, theme = 'light' }: FeaturesSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section 
      id="features" 
      className={`py-24 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      } transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${
            theme === 'dark' 
              ? 'bg-emerald-500/10 border border-emerald-500/20' 
              : 'bg-emerald-100 border border-emerald-200'
          }`}>
            <span className="text-xl">✨</span>
            <span className={`${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Powerful Features
            </span>
          </div>
          <h2 className={`text-4xl md:text-5xl mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Everything You Need to{' '}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className={`text-xl max-w-2xl mx-auto ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Comprehensive tools designed for modern finance teams in the GCC region
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative p-8 rounded-3xl transition-all duration-300 ${
                theme === 'dark' 
                  ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50' 
                  : 'bg-white hover:shadow-2xl border border-gray-200'
              } ${hoveredIndex === index ? 'scale-105' : ''}`}
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br ${feature.gradient}`}></div>

              {/* Icon */}
              <div className="relative mb-6">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-4xl">{iconMap[feature.iconName] || '✨'}</span>
                </div>
              </div>

              {/* Content */}
              <h3 className={`mb-3 text-2xl ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {feature.title}
              </h3>
              <p className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {feature.description}
              </p>

              {/* Arrow on Hover */}
              <div className={`mt-4 inline-flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'
              }`}>
                <span>Learn more</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <a
            href="/signup"
            className={`inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105`}
          >
            <span>Explore All Features</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

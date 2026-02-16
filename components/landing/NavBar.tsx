'use client';

import { useState, useEffect } from 'react';

interface NavBarProps {
  theme?: 'light' | 'dark' | 'system';
  onToggleTheme?: () => void;
}

export function NavBar({ theme = 'light', onToggleTheme }: NavBarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-black text-xl">S</span>
            </div>
            <span className={`text-2xl font-black ${
              scrolled ? 'text-gray-900' : 'text-white'
            }`}>
              SmartBook
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <a 
              href="#features" 
              className={`text-sm font-bold transition-colors ${
                scrolled
                  ? 'text-gray-700 hover:text-gray-900'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className={`text-sm font-bold transition-colors ${
                scrolled
                  ? 'text-gray-700 hover:text-gray-900'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Pricing
            </a>
            <a 
              href="#benefits" 
              className={`text-sm font-bold transition-colors ${
                scrolled
                  ? 'text-gray-700 hover:text-gray-900'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              Benefits
            </a>
            
            <a 
              href="/login"
              className={`px-6 py-2.5 rounded-xl font-bold transition-all hover:scale-105 ${
                scrolled
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Sign In
            </a>
            
            <a 
              href="/signup"
              className="px-6 py-2.5 bg-white text-emerald-700 rounded-xl font-bold hover:bg-gray-50 transition-all hover:scale-105 shadow-lg"
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl transition-colors ${
                scrolled
                  ? 'hover:bg-gray-100 text-gray-600'
                  : 'hover:bg-white/10 text-white/70'
              }`}
              aria-label="Toggle menu"
            >
              <span className="text-2xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl font-bold transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Features
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl font-bold transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Pricing
              </a>
              <a 
                href="#benefits" 
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-xl font-bold transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Benefits
              </a>
              
              <div className="my-2 border-t border-gray-200"></div>
              
              <a 
                href="/login"
                className="mx-4 px-4 py-3 rounded-xl font-bold text-center border-2 transition-colors text-gray-700 hover:bg-gray-100 border-gray-300"
              >
                Sign In
              </a>
              <a 
                href="/signup"
                className="mx-4 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-center shadow-lg"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

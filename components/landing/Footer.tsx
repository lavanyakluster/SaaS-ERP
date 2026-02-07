'use client';

interface FooterProps {
  theme?: 'light' | 'dark';
}

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'Security', href: '#' },
  ],
  company: [
    { label: 'About Us', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Press Kit', href: '#' },
  ],
  resources: [
    { label: 'Documentation', href: '#' },
    { label: 'Help Center', href: '#' },
    { label: 'API Reference', href: '#' },
    { label: 'Tutorials', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Compliance', href: '#' },
  ],
};

const socialLinks = [
  { icon: '🐦', label: 'Twitter', href: '#' },
  { icon: '💼', label: 'LinkedIn', href: '#' },
  { icon: '📘', label: 'Facebook', href: '#' },
  { icon: '📸', label: 'Instagram', href: '#' },
];

export function Footer({ theme = 'light' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`${
      theme === 'dark' ? 'bg-gray-950 border-t border-gray-900' : 'bg-gray-900 text-white'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white text-2xl">S</span>
              </div>
              <span className={`text-2xl ${
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}>
                SmartBook
              </span>
            </a>
            <p className={`mb-6 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
            }`}>
              Enterprise-grade ERP solutions designed specifically for the GCC market. 
              Transform your financial operations with SmartBook.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 ${
                    theme === 'dark' 
                      ? 'bg-gray-900 hover:bg-gray-800 border border-gray-800' 
                      : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  <span className="text-xl">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className={`mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-white'
            }`}>
              Product
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`transition-colors ${
                      theme === 'dark' ? 'text-gray-400 hover:text-emerald-400' : 'text-gray-400 hover:text-emerald-400'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-white'
            }`}>
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`transition-colors ${
                      theme === 'dark' ? 'text-gray-400 hover:text-emerald-400' : 'text-gray-400 hover:text-emerald-400'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-white'
            }`}>
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`transition-colors ${
                      theme === 'dark' ? 'text-gray-400 hover:text-emerald-400' : 'text-gray-400 hover:text-emerald-400'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className={`mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-white'
            }`}>
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className={`transition-colors ${
                      theme === 'dark' ? 'text-gray-400 hover:text-emerald-400' : 'text-gray-400 hover:text-emerald-400'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className={`py-8 mb-8 border-t border-b ${
          theme === 'dark' ? 'border-gray-900' : 'border-gray-800'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className={`text-xl mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-white'
              }`}>
                Stay Updated 📬
              </h3>
              <p className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`}>
                Subscribe to our newsletter for the latest updates and insights.
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className={`flex-1 px-4 py-3 rounded-xl outline-none transition-all ${
                  theme === 'dark' 
                    ? 'bg-gray-900 border border-gray-800 text-white placeholder-gray-600 focus:border-emerald-500' 
                    : 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500'
                }`}
              />
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:scale-105 transition-transform">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className={`${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
          }`}>
            © {currentYear} SmartBook. All rights reserved.
          </p>
          
          {/* Trust Badges */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <span className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`}>
                SSL Secured
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✓</span>
              <span className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`}>
                ISO Certified
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <span className={`${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
              }`}>
                GDPR Compliant
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

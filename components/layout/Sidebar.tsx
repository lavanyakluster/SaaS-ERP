'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown, TrendingUp } from 'lucide-react';
import { NAVIGATION_MENU } from '@/lib/constants/navigation';
import { useThemeStore } from '@/lib/store/theme-store';
import { useGradientStore } from '@/lib/store/gradient-store';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = React.memo(function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { theme } = useThemeStore();
  const { activeGradient } = useGradientStore();
  // ✅ All sections closed by default
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = useCallback((label: string) => {
    if (collapsed) return;
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  }, [collapsed]);

  const isActive = useCallback((href?: string) => {
    if (!href) return false;
    // Exact match for dashboard sub-routes
    if (pathname === href) return true;
    // For /dashboard main route, also match /dashboard/loyalty and /dashboard/sales-target
    if (href === '/dashboard' && pathname.startsWith('/dashboard')) return false; // Don't highlight Overview for sub-dashboards
    return false;
  }, [pathname]);

  // Memoize gradient button styles
  const gradientButtonStyle = useMemo(() => ({
    borderColor: theme === 'dark' ? `${activeGradient.via}50` : `${activeGradient.from}50`,
    color: theme === 'dark' ? activeGradient.via : activeGradient.from,
  }), [theme, activeGradient]);

  // Memoize active item gradient style
  const getActiveGradientStyle = useCallback(() => ({
    background: `linear-gradient(to bottom right, ${activeGradient.from}, ${activeGradient.via}, ${activeGradient.to})`
  }), [activeGradient]);

  return (
    <aside 
      className={`fixed left-0 top-16 bottom-0 ${
        collapsed ? 'w-20' : 'w-72'
      } border-r transition-all duration-300 flex flex-col z-30 ${
        theme === 'dark'
          ? 'bg-gray-800 border-gray-700'
          : 'bg-white border-gray-200'
      }`}
    >
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`absolute -right-3 top-6 w-6 h-6 border-2 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl z-50 transition-all hover:scale-110 ${
          theme === 'dark'
            ? 'bg-gray-800 border-gray-700 text-gray-400 hover:border-opacity-100'
            : 'bg-white border-gray-300 text-gray-600 hover:border-opacity-100'
        }`}
        style={gradientButtonStyle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Navigation */}
      <nav className="px-3 py-6 space-y-1 overflow-y-auto h-full pb-24 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {NAVIGATION_MENU.map((item, index) => (
          <div key={item.label} className="relative">
            {item.children ? (
              <>
                {/* Parent Item with Children */}
                <button
                  onClick={() => toggleSection(item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                    expandedSections.includes(item.label)
                      ? theme === 'dark'
                        ? 'bg-gradient-to-r from-gray-800 to-gray-800/50 shadow-lg'
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 shadow-md'
                      : theme === 'dark'
                      ? 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  style={expandedSections.includes(item.label) ? { color: activeGradient.via } : {}}
                  title={collapsed ? item.label : ''}
                >
                  {/* Icon with animated background */}
                  <div className="relative">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        expandedSections.includes(item.label)
                          ? 'text-white shadow-lg scale-110'
                          : theme === 'dark'
                          ? 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }`}
                      style={expandedSections.includes(item.label) ? {
                        background: `linear-gradient(to bottom right, ${activeGradient.from}, ${activeGradient.via}, ${activeGradient.to})`
                      } : {}}
                    >
                      <item.icon className="w-5 h-5" />
                    </div>
                    {expandedSections.includes(item.label) && (
                      <div className="absolute -inset-1 rounded-xl blur-sm -z-10" style={{
                        background: `linear-gradient(to bottom right, ${activeGradient.from}33, ${activeGradient.via}33, ${activeGradient.to}33)`
                      }}></div>
                    )}
                  </div>

                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-sm font-semibold">{item.label}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          expandedSections.includes(item.label) ? 'rotate-180' : ''
                        }`}
                      />
                    </>
                  )}
                </button>

                {/* Children with slide animation */}
                {!collapsed && expandedSections.includes(item.label) && (
                  <div className="ml-12 mt-1 space-y-0.5 animate-slideDown">
                    {item.children.map((child) => (
                      <Link
                        key={child.page}
                        href={child.href}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-all group relative overflow-hidden ${
                          isActive(child.href)
                            ? 'text-white shadow-md font-semibold'
                            : theme === 'dark'
                            ? 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200 hover:translate-x-1'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1'
                        }`}
                        style={isActive(child.href) ? {
                          background: `linear-gradient(to right, ${activeGradient.from}, ${activeGradient.via}, ${activeGradient.to})`
                        } : {}}
                      >
                        {/* Active indicator line */}
                        {isActive(child.href) && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"></div>
                        )}
                        
                        <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full transition-all ${
                          isActive(child.href) 
                            ? 'bg-white scale-125' 
                            : theme === 'dark'
                            ? 'bg-gray-600'
                            : 'bg-gray-400'
                        }`}
                        style={!isActive(child.href) ? {
                          backgroundColor: theme === 'dark' ? '#4B5563' : '#9CA3AF'
                        } : {}}
                        onMouseEnter={(e) => {
                          if (!isActive(child.href)) {
                            e.currentTarget.style.backgroundColor = activeGradient.via;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive(child.href)) {
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#4B5563' : '#9CA3AF';
                          }
                        }}
                        ></span>
                        
                        <span className="flex-1">{child.label}</span>
                        
                        {/* Hover arrow */}
                        {!isActive(child.href) && (
                          <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all ${
                            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                          }`} />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Single Item */
              <Link
                href={item.href || '#'}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                  item.href && isActive(item.href)
                    ? theme === 'dark'
                      ? 'bg-gradient-to-r from-gray-800 to-gray-800/50 shadow-lg'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 shadow-md'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
                style={item.href && isActive(item.href) ? { color: activeGradient.via } : {}}
                title={collapsed ? item.label : ''}
              >
                <div className="relative">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                      item.href && isActive(item.href)
                        ? 'text-white shadow-lg scale-110'
                        : theme === 'dark'
                        ? 'bg-gray-800 text-gray-400 group-hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}
                    style={item.href && isActive(item.href) ? {
                      background: `linear-gradient(to bottom right, ${activeGradient.from}, ${activeGradient.via}, ${activeGradient.to})`
                    } : {}}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  {item.href && isActive(item.href) && (
                    <div className="absolute -inset-1 rounded-xl blur-sm -z-10" style={{
                      background: `linear-gradient(to bottom right, ${activeGradient.from}33, ${activeGradient.via}33, ${activeGradient.to}33)`
                    }}></div>
                  )}
                </div>
                {!collapsed && <span className="text-sm font-semibold">{item.label}</span>}
              </Link>
            )}

            {/* Divider after specific sections */}
            {!collapsed && (item.label === 'Dashboard' || item.label === 'Reports') && (
              <div className={`my-3 mx-3 border-t ${
                theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
              }`}></div>
            )}
          </div>
        ))}
      </nav>

      {/* Quick Stats Footer (when expanded) */}
      {!collapsed && (
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${
          theme === 'dark' 
            ? 'bg-gray-900/95 border-gray-800 backdrop-blur-xl' 
            : 'bg-white/95 border-gray-200 backdrop-blur-xl'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{
              background: `linear-gradient(to bottom right, #10B981, #059669)`
            }}>
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-xs font-medium ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                System Status
              </p>
              <p className={`text-sm font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                All Systems Operational
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        /* Custom scrollbar */
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: currentColor;
          border-radius: 3px;
        }

        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: currentColor;
          opacity: 0.8;
        }
      `}} />
    </aside>
  );
});

export default Sidebar;
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type SettingsCategory = 
  | 'organization'
  | 'tenant-config'
  | 'users-access'
  | 'modules'
  | 'integrations'
  | 'security'
  | 'billing';

interface SettingsContextType {
  activeCategory: SettingsCategory;
  activeSection: string;
  setActiveCategory: (category: SettingsCategory) => void;
  setActiveSection: (section: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [activeCategory, setActiveCategory] = useState<SettingsCategory>('users-access');
  const [activeSection, setActiveSection] = useState('users');

  return (
    <SettingsContext.Provider
      value={{
        activeCategory,
        activeSection,
        setActiveCategory,
        setActiveSection,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

/**
 * Gradient Store
 * Centralized gradient state management
 * Performance optimized with persist middleware
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/lib/constants/app';

// ============================================================================
// TYPES
// ============================================================================

export interface Gradient {
  id: string;
  name: string;
  from: string;
  via: string;
  to: string;
}

interface GradientState {
  activeGradient: Gradient;
  gradients: Gradient[];
  setActiveGradient: (gradient: Gradient) => void;
}

// ============================================================================
// GRADIENT PRESETS
// ============================================================================

export const GRADIENT_PRESETS: Gradient[] = [
  {
    id: 'emerald-teal',
    name: 'Emerald Teal',
    from: '#10b981', // emerald-500
    via: '#14b8a6', // teal-500
    to: '#0d9488', // teal-600
  },
  {
    id: 'blue-indigo',
    name: 'Blue Indigo',
    from: '#3b82f6', // blue-500
    via: '#2563eb', // blue-600
    to: '#4f46e5', // indigo-600
  },
  {
    id: 'purple-pink',
    name: 'Purple Pink',
    from: '#a855f7', // purple-500
    via: '#9333ea', // purple-600
    to: '#db2777', // pink-600
  },
  {
    id: 'orange-red',
    name: 'Orange Red',
    from: '#f97316', // orange-500
    via: '#ea580c', // orange-600
    to: '#dc2626', // red-600
  },
  {
    id: 'cyan-blue',
    name: 'Cyan Blue',
    from: '#06b6d4', // cyan-500
    via: '#0891b2', // cyan-600
    to: '#2563eb', // blue-600
  },
  {
    id: 'green-emerald',
    name: 'Green Emerald',
    from: '#22c55e', // green-500
    via: '#16a34a', // green-600
    to: '#059669', // emerald-600
  },
];

// ============================================================================
// STORE
// ============================================================================

export const useGradientStore = create<GradientState>()(
  persist(
    (set) => ({
      activeGradient: GRADIENT_PRESETS[0], // Default to emerald-teal
      gradients: GRADIENT_PRESETS,
      
      setActiveGradient: (gradient) =>
        set({ activeGradient: gradient }),
    }),
    {
      name: STORAGE_KEYS.gradientStore,
      skipHydration: true, // Skip hydration to prevent SSR issues
    }
  )
);

// ============================================================================
// OPTIMIZED HOOKS
// ============================================================================

/**
 * Hook to get active gradient only
 */
export const useActiveGradient = () =>
  useGradientStore((state) => state.activeGradient);

/**
 * Hook to get all gradient presets
 */
export const useGradientPresets = () =>
  useGradientStore((state) => state.gradients);

/**
 * Hook to get gradient actions
 */
export const useGradientActions = () => {
  const setActiveGradient = useGradientStore((state) => state.setActiveGradient);
  return { setActiveGradient };
};
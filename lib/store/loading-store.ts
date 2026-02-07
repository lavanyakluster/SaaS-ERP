/**
 * Enterprise Loading State Store
 * 
 * Features:
 * - Global loading state management
 * - Multiple concurrent loading states
 * - Loading priorities
 * - Progress tracking
 * - Performance optimized selectors
 */

'use client';

import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

// ============================================================================
// TYPES
// ============================================================================

export type LoadingPriority = 'low' | 'medium' | 'high' | 'critical';

export interface LoadingState {
  id: string;
  message?: string;
  progress?: number; // 0-100
  priority: LoadingPriority;
  startTime: number;
}

interface LoadingStoreState {
  loadingStates: Map<string, LoadingState>;
  isGlobalLoading: boolean;
}

interface LoadingStoreActions {
  // Add/Update loading state
  startLoading: (id: string, options?: {
    message?: string;
    priority?: LoadingPriority;
  }) => void;
  
  // Update loading progress
  updateProgress: (id: string, progress: number) => void;
  
  // Update loading message
  updateMessage: (id: string, message: string) => void;
  
  // Stop loading
  stopLoading: (id: string) => void;
  
  // Stop all loading
  stopAllLoading: () => void;
  
  // Helpers
  isLoading: (id?: string) => boolean;
  getLoadingState: (id: string) => LoadingState | undefined;
  getHighestPriorityLoading: () => LoadingState | undefined;
}

type LoadingStore = LoadingStoreState & LoadingStoreActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: LoadingStoreState = {
  loadingStates: new Map(),
  isGlobalLoading: false,
};

// ============================================================================
// STORE
// ============================================================================

export const useLoadingStore = create<LoadingStore>()((set, get) => ({
  // State
  ...initialState,

  // Actions
  startLoading: (id, options = {}) => {
    const loadingState: LoadingState = {
      id,
      message: options.message,
      priority: options.priority || 'medium',
      startTime: Date.now(),
    };

    set((state) => {
      const newStates = new Map(state.loadingStates);
      newStates.set(id, loadingState);

      return {
        loadingStates: newStates,
        isGlobalLoading: newStates.size > 0,
      };
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`⏳ Loading started: ${id}`, options);
    }
  },

  updateProgress: (id, progress) => {
    set((state) => {
      const loadingState = state.loadingStates.get(id);
      if (!loadingState) return state;

      const newStates = new Map(state.loadingStates);
      newStates.set(id, { ...loadingState, progress });

      return { loadingStates: newStates };
    });
  },

  updateMessage: (id, message) => {
    set((state) => {
      const loadingState = state.loadingStates.get(id);
      if (!loadingState) return state;

      const newStates = new Map(state.loadingStates);
      newStates.set(id, { ...loadingState, message });

      return { loadingStates: newStates };
    });
  },

  stopLoading: (id) => {
    set((state) => {
      const newStates = new Map(state.loadingStates);
      const removed = newStates.delete(id);

      if (removed && process.env.NODE_ENV === 'development') {
        const duration = Date.now() - (state.loadingStates.get(id)?.startTime || 0);
        console.log(`✅ Loading stopped: ${id} (${duration}ms)`);
      }

      return {
        loadingStates: newStates,
        isGlobalLoading: newStates.size > 0,
      };
    });
  },

  stopAllLoading: () => {
    set({ loadingStates: new Map(), isGlobalLoading: false });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🛑 All loading states cleared');
    }
  },

  isLoading: (id) => {
    if (id) {
      return get().loadingStates.has(id);
    }
    return get().isGlobalLoading;
  },

  getLoadingState: (id) => {
    return get().loadingStates.get(id);
  },

  getHighestPriorityLoading: () => {
    const states = Array.from(get().loadingStates.values());
    
    if (states.length === 0) return undefined;

    const priorityOrder: LoadingPriority[] = ['critical', 'high', 'medium', 'low'];
    
    for (const priority of priorityOrder) {
      const state = states.find((s) => s.priority === priority);
      if (state) return state;
    }

    return states[0];
  },
}));

// ============================================================================
// SELECTORS
// ============================================================================

/**
 * Convenience selectors for loading state
 * These are NOT hooks - they're regular selectors to be used with useLoadingStore
 */
export const loadingSelectors = {
  isGlobalLoading: (state: LoadingStore) => state.isGlobalLoading,
  loadingCount: (state: LoadingStore) => state.loadingStates.size,
  loadingState: (state: LoadingStore, id: string) => state.getLoadingState(id),
  highestPriority: (state: LoadingStore) => state.getHighestPriorityLoading(),
};

/**
 * Select loading actions (never causes re-renders)
 */
export const useLoadingActions = () =>
  useLoadingStore(
    (state) => ({
      startLoading: state.startLoading,
      updateProgress: state.updateProgress,
      updateMessage: state.updateMessage,
      stopLoading: state.stopLoading,
      stopAllLoading: state.stopAllLoading,
    }),
    shallow
  );

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for managing a loading state
 */
export const useLoading = (id: string) => {
  const { startLoading, updateProgress, updateMessage, stopLoading } = useLoadingActions();
  const isLoading = useLoadingStore((state) => state.isLoading(id));
  const loadingState = useLoadingStore((state) => state.getLoadingState(id));

  return {
    isLoading,
    loadingState,
    startLoading: (options?: { message?: string; priority?: LoadingPriority }) =>
      startLoading(id, options),
    updateProgress: (progress: number) => updateProgress(id, progress),
    updateMessage: (message: string) => updateMessage(id, message),
    stopLoading: () => stopLoading(id),
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default useLoadingStore;
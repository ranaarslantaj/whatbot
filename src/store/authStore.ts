import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      initialized: false,
      setUser: (user) => set({ user, loading: false, initialized: true }),
      clearUser: () => set({ user: null, loading: false, initialized: true }),
      reset: () => set({ user: null, loading: true, initialized: false }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),
    }),
    {
      name: 'whatbot-auth',
      // Only persist user data, not transient loading states
      partialize: (state) => ({ user: state.user, initialized: state.initialized }),
    }
  )
);

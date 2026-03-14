'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getCurrentUser } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, loading, initialized, setUser, clearUser, setInitialized } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await getCurrentUser(firebaseUser.uid);
        if (userData) {
          setUser(userData);
        } else {
          clearUser();
        }
      } else {
        clearUser();
      }
      setInitialized(true);
    });

    return () => unsubscribe();
  }, [setUser, clearUser, setInitialized]);

  return { user, loading, initialized };
}

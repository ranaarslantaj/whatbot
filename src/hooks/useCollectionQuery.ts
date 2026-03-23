'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  onSnapshot, 
  getDocs, 
  type Query, 
  type DocumentData, 
} from '@/lib/firebase';
import { useEffect } from 'react';

interface UseCollectionOptions {
  realtime?: boolean;
}

export function useCollectionQuery<T>(
  queryKey: string[],
  firestoreQuery: Query<DocumentData>,
  options: UseCollectionOptions = { realtime: true }
) {
  const queryClient = useQueryClient();

  // Primary data fetcher for React Query
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const snapshot = await getDocs(firestoreQuery);
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
    },
    // We handle updates via onSnapshot if realtime is enabled
    staleTime: options.realtime ? Infinity : 5 * 60 * 1000,
  });

  // Real-time listener integration
  useEffect(() => {
    if (!options.realtime) return;

    const unsubscribe = onSnapshot(firestoreQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as T[];
      // Update the React Query cache manually on snapshot
      queryClient.setQueryData(queryKey, data);
    });

    return () => unsubscribe();
  }, [options.realtime, JSON.stringify(queryKey), firestoreQuery, queryClient]);

  return query;
}

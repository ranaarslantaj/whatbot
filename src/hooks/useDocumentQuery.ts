'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { onSnapshot, getDoc, doc, type DocumentReference, type DocumentData } from '@/lib/firebase';
import { useEffect } from 'react';

export function useDocumentQuery<T>(
  queryKey: string[],
  docRef: DocumentReference<DocumentData>,
  realtime: boolean = true
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return { ...snapshot.data(), id: snapshot.id } as T;
    },
    staleTime: realtime ? Infinity : 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!realtime) return;

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = { ...snapshot.data(), id: snapshot.id } as T;
        queryClient.setQueryData(queryKey, data);
      } else {
        queryClient.setQueryData(queryKey, null);
      }
    });

    return () => unsubscribe();
  }, [realtime, JSON.stringify(queryKey), docRef, queryClient]);

  return query;
}

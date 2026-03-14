'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, type Query, type DocumentData } from 'firebase/firestore';

interface UseFirestoreResult<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
}

export function useFirestore<T>(q: Query<DocumentData> | null): UseFirestoreResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!q) { setLoading(false); return; }
    setLoading(true);
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        setData(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })) as T[]);
        setLoading(false);
        setError(null);
      },
      (err) => { setError(err); setLoading(false); }
    );
    return () => unsubscribe();
  }, [q]);

  return { data, loading, error };
}

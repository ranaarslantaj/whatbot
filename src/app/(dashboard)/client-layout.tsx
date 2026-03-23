'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export function DashboardClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && !user) router.push('/login');
  }, [initialized, user, router]);

  if (!initialized || loading) {
    return <div className="flex min-h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  if (!user) return null;

  return <DashboardLayout role={user.role}>{children}</DashboardLayout>;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getRoleRedirectPath } from '@/lib/auth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) router.replace(getRoleRedirectPath(user.role));
  }, [user, router]);

  return <div className="flex min-h-[50vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;
}

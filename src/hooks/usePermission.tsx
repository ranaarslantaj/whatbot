'use client';

import { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { hasPermission } from '@/lib/rbac';

export function usePermission(permission: string): boolean {
  const user = useAuthStore((s) => s.user);
  if (!user) return false;
  return hasPermission(user.role, permission);
}

export function PermissionGate({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const allowed = usePermission(permission);
  return allowed ? <>{children}</> : <>{fallback}</>;
}

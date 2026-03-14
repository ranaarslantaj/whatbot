'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { RoleSidebar } from './RoleSidebar';
import type { UserRole } from '@/types';
import { Separator } from '@/components/ui/separator';

export function Sidebar({ role, collapsed = false }: { role: UserRole; collapsed?: boolean }) {
  return (
    <aside className={cn('fixed left-0 top-0 z-30 flex h-screen flex-col border-r bg-white transition-all duration-200', collapsed ? 'w-16' : 'w-60')}>
      <div className={cn('flex h-14 items-center gap-2 px-4', collapsed && 'justify-center px-2')}>
        <Image src="/logo.png" alt="WhatBot" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
        {!collapsed && <span className="text-sm font-bold">WhatBot</span>}
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto">
        <RoleSidebar role={role} collapsed={collapsed} />
      </div>
    </aside>
  );
}

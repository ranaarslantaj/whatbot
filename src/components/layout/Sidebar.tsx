'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { RoleSidebar } from './RoleSidebar';
import type { UserRole } from '@/types';
import { Separator } from '@/components/ui/separator';

export function Sidebar({ role, collapsed = false }: { role: UserRole; collapsed?: boolean }) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-30 flex h-screen flex-col border-r bg-background transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo area */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center gap-2.5 px-4 border-b border-border/60',
          collapsed && 'justify-center px-0'
        )}
      >
        <div className="relative h-8 w-8 shrink-0">
          <Image
            src="/images/logo.png"
            alt="WhatBot"
            fill
            className="rounded-lg object-contain"
          />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-sm font-bold text-foreground">WhatBot</span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Dashboard</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto">
        <RoleSidebar role={role} collapsed={collapsed} />
      </div>

      {/* Bottom brand tag */}
      {!collapsed && (
        <>
          <Separator />
          <div className="px-4 py-3">
            <p className="text-[10px] text-muted-foreground/60 font-medium tracking-widest uppercase">
              Powered by WhatBot
            </p>
          </div>
        </>
      )}
    </aside>
  );
}

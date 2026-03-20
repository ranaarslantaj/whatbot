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
        'fixed left-0 top-0 z-30 flex h-screen flex-col border-r border-border/40 bg-sidebar/90 backdrop-blur-xl transition-all duration-300 ease-in-out shadow-apple-sm',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo area - cleaner presentation */}
      <div
        className={cn(
          'flex h-20 shrink-0 items-center gap-3 px-6',
          collapsed && 'justify-center px-0'
        )}
      >
        <div className="relative h-9 w-9 shrink-0 shadow-apple-sm rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center border border-primary/20">
          <Image
            src="/images/logo.png"
            alt="WhatBot"
            fill
            className="object-contain p-1.5"
          />
        </div>
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight text-foreground">WhatBot</span>
            <span className="text-[10px] text-muted-foreground/60 font-bold tracking-[0.1em] uppercase mt-0.5">Automate</span>
          </div>
        )}
      </div>

      {/* Nav - adding some top padding */}
      <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
        <RoleSidebar role={role} collapsed={collapsed} />
      </div>

      {/* Bottom brand tag - simplified */}
      {!collapsed && (
        <div className="px-6 py-6 border-t border-border/40">
          <div className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-300">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground">
              v1.0.4 Premium
            </p>
          </div>
        </div>
      )}
    </aside>
  );
}

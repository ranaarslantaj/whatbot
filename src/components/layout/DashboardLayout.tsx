'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

export function DashboardLayout({ children, role }: { children: React.ReactNode; role: UserRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50">
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <div className="hidden lg:block"><Sidebar role={role} /></div>
      <div className={cn('lg:hidden', sidebarOpen ? 'block' : 'hidden')}><Sidebar role={role} /></div>
      <div className="lg:pl-60">
        <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

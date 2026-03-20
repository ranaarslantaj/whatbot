'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

export function DashboardLayout({ children, role }: { children: React.ReactNode; role: UserRole }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background/50 selection:bg-primary/10 selection:text-primary">
      {/* Mobile overlay - using a cleaner blur */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebars - refined integration */}
      <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 z-30">
        <Sidebar role={role} />
      </div>

      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-[280px] sm:w-80 lg:hidden transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1)',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <Sidebar role={role} />
      </div>

      {/* Main content area - providing 'air' and focus */}
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300 ease-in-out">
        <TopBar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8 lg:p-10 space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
          {children}
        </main>

        {/* Subtle footer or extra space */}
        <footer className="py-8 px-6 sm:px-10 border-t border-border/40 opacity-40">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-center sm:text-left">
            &copy; {new Date().getFullYear()} WhatBot. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

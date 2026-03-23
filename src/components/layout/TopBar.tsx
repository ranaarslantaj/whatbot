'use client';

import { useRouter } from 'next/navigation';
import { signOutUser } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { useImpersonateStore } from '@/store/impersonateStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Menu, X, ChevronDown, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/theme-toggle';
import { GlobalSearch } from './GlobalSearch';
import { NotificationCenter } from './NotificationCenter';
import { useState } from 'react';

export function TopBar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { isImpersonating, clientName, stopImpersonation } = useImpersonateStore();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push('/login');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header className="sticky top-0 z-20 flex flex-col">
      {/* Impersonation banner - refined and elegant */}
      {isImpersonating && (
        <div className="flex items-center justify-between bg-amber-400 dark:bg-amber-500/90 backdrop-blur-md px-6 py-2.5 text-xs font-bold tracking-wide text-amber-950 shadow-apple-sm">
          <span className="flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-amber-700 animate-pulse" />
            VIEWING AS <strong className="font-extrabold">{clientName?.toUpperCase()}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-4 text-[10px] font-bold tracking-[0.1em] text-amber-950 hover:bg-amber-500/20 border border-amber-950/20 rounded-full"
            onClick={() => { stopImpersonation(); router.push('/admin/clients'); }}
          >
            <X className="mr-1.5 h-3 w-3" /> EXIT VIEW
          </Button>
        </div>
      )}

      {/* Main topbar - glassmorphism polish */}
      <div className="flex h-16 sm:h-20 items-center justify-between border-b border-border/40 bg-background/70 backdrop-blur-xl px-4 sm:px-6 md:px-10 gap-3">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Global Search - Interactive trigger */}
        <div className="flex-1 hidden md:flex justify-center max-w-sm ml-4 lg:ml-0">
           <button 
             onClick={() => setIsSearchOpen(true)}
             className="flex h-11 w-full max-w-[280px] items-center gap-3 rounded-2xl border border-border/20 bg-accent/30 px-3.5 text-muted-foreground/50 transition-all hover:bg-accent/50 hover:border-border/40 shadow-apple-sm group"
           >
             <Search className="h-4 w-4 group-hover:text-primary transition-colors" />
             <span className="text-[13px] font-bold tracking-tight">Search...</span>
             <div className="ml-auto flex items-center gap-1 rounded border border-border/20 bg-background px-1.5 py-0.5 text-[9px] font-extrabold tracking-tighter text-muted-foreground/40">
               {navigator?.platform?.toLowerCase().includes('mac') ? '⌘' : 'CTRL'} K
             </div>
           </button>
        </div>

        {/* Global Search Dialog */}
        <GlobalSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />

        {/* Right actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-accent/30 hover:bg-accent/60 transition-colors border border-border/20">
              <ThemeToggle />
            </div>
          </div>

          <div className="h-6 w-[1px] bg-border/40 mx-1" />

          {/* User dropdown - refined */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-2xl p-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-all outline-none border border-transparent hover:border-border/40 shadow-apple-sm group">
              <Avatar className="h-9 w-9 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all shadow-apple-sm">
                <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-tight pr-2">
                <span className="text-[13px] font-bold text-foreground">
                  {user?.name?.split(' ')[0]}
                </span>
                <span className="text-[10px] text-muted-foreground/60 font-medium tracking-tight">
                  Pro Account
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors mr-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 glass-card p-2 rounded-2xl shadow-apple-lg mt-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold tracking-tight">{user?.name}</p>
                    <p className="text-[11px] text-muted-foreground/70 truncate font-medium">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-border/40 mx-2" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-xl font-bold text-[13px] mx-1 my-1"
              >
                <LogOut className="mr-2.5 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

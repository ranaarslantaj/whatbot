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
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Menu, X, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/theme-toggle';

export function TopBar({
  onToggleSidebar,
}: {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}) {
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
      {/* Impersonation banner */}
      {isImpersonating && (
        <div className="flex items-center justify-between bg-amber-400 dark:bg-amber-500 px-4 py-2 text-sm font-medium text-amber-950">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-700 animate-pulse" />
            Viewing as <strong>{clientName}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-3 text-amber-950 hover:bg-amber-500 dark:hover:bg-amber-600 font-medium"
            onClick={() => { stopImpersonation(); router.push('/admin/clients'); }}
          >
            <X className="mr-1 h-3 w-3" /> Exit View
          </Button>
        </div>
      )}

      {/* Main topbar */}
      <div className="flex h-14 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-4 gap-3">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-muted-foreground hover:text-foreground"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors outline-none">
              <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
                {user?.name?.split(' ')[0]}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

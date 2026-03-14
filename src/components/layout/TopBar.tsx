'use client';

import { useRouter } from 'next/navigation';
import { signOutUser } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { useImpersonateStore } from '@/store/impersonateStore';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

export function TopBar({ onToggleSidebar }: { onToggleSidebar: () => void; sidebarOpen: boolean }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { isImpersonating, clientName, stopImpersonation } = useImpersonateStore();

  const handleSignOut = async () => {
    try { await signOutUser(); router.push('/login'); } catch { toast.error('Failed to sign out'); }
  };

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?';

  return (
    <header className="sticky top-0 z-20 flex flex-col">
      {isImpersonating && (
        <div className="flex items-center justify-between bg-yellow-400 px-4 py-1.5 text-sm font-medium text-yellow-900">
          <span>Viewing as {clientName}</span>
          <Button variant="ghost" size="sm" className="h-6 text-yellow-900 hover:bg-yellow-500" onClick={() => { stopImpersonation(); router.push('/admin/clients'); }}>
            <X className="mr-1 h-3 w-3" /> Exit
          </Button>
        </div>
      )}
      <div className="flex h-14 items-center justify-between border-b bg-white px-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar}><Menu className="h-5 w-5" /></Button>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8"><AvatarFallback className="bg-zinc-200 text-xs">{initials}</AvatarFallback></Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /> Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

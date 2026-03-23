'use client';

import { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  Info, 
  AlertCircle, 
  CheckCircle2, 
  X,
  MessageSquare,
  UserPlus,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { subscribeNotifications, markNotificationAsRead } from '@/lib/firestore';
import Link from 'next/link';

const iconMap = {
  info:    { icon: Info,         color: 'text-blue-500',    bg: 'bg-blue-500/10' },
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  warning: { icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-500/10' },
  error:   { icon: AlertCircle,  color: 'text-red-500',     bg: 'bg-red-500/10' },
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeNotifications(user.uid, (data) => setNotifications(data));
    return () => unsub();
  }, [user?.uid]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-accent/30 border border-border/20 hover:bg-accent/60 transition-all shadow-apple-sm group outline-none">
        <Bell className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-black text-primary-foreground border-2 border-background ring-2 ring-primary/10">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-[320px] sm:w-[380px] p-0 overflow-hidden glass-card rounded-2xl shadow-apple-lg border-border/40 mt-2 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between px-5 py-4 bg-muted/30 border-b border-border/20">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-extrabold uppercase tracking-widest text-foreground/80">Notifications</span>
            {unreadCount > 0 && (
              <div className="px-2 py-0.5 rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                {unreadCount} NEW
              </div>
            )}
          </div>
          <button className="text-[11px] font-bold text-muted-foreground/50 hover:text-primary transition-colors">
            Clear all
          </button>
        </div>

        <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
          {notifications.length > 0 ? (
            <div className="divide-y divide-border/10">
              {notifications.map((notification) => {
                const config = iconMap[notification.type as keyof typeof iconMap] || iconMap.info;
                const Icon = config.icon;

                return (
                  <div 
                    key={notification.id}
                    className={cn(
                      "flex gap-4 p-4 hover:bg-accent/20 transition-all relative group cursor-pointer",
                      !notification.isRead && "bg-primary/[0.03]"
                    )}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    {!notification.isRead && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-primary rounded-r-full" />
                    )}
                    
                    <div className={cn("h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border border-border/10", config.bg)}>
                      <Icon className={cn("h-5 w-5", config.color)} />
                    </div>

                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-bold text-foreground truncate">{notification.title}</span>
                        <span className="text-[10px] text-muted-foreground/40 font-bold tracking-tight whitespace-nowrap">
                          {notification.createdAt?.toDate ? 'Recently' : 'Now'}
                        </span>
                      </div>
                      <p className="text-[12px] text-muted-foreground/70 font-medium leading-[1.4] line-clamp-2">
                        {notification.message}
                      </p>
                      
                      {notification.link && (
                        <Link 
                          href={notification.link} 
                          className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
                        >
                          View Details <Zap className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="relative inline-flex items-center justify-center mb-4">
                 <Bell className="h-10 w-10 text-muted-foreground/10" />
                 <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
              </div>
              <p className="text-[11px] font-black text-muted-foreground/40 uppercase tracking-widest">Everything is caught up!</p>
              <p className="text-[11px] text-muted-foreground/30 mt-1 font-medium italic">No new notifications</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-muted/20 border-t border-border/10">
           <Button variant="ghost" className="w-full h-9 rounded-xl text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground/60 hover:text-foreground">
             View All History
           </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

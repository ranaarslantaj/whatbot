'use client';

import { useEffect, useState } from 'react';
import { subscribeLogs, type ActivityLog } from '@/lib/firestore';
import { ShieldCheck, ShieldAlert, Info, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const typeConfig = {
  info:    { icon: Info,         color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  warning: { icon: ShieldAlert,  color: 'text-amber-500',  bg: 'bg-amber-500/10' },
  error:   { icon: ShieldAlert,  color: 'text-red-500',    bg: 'bg-red-500/10' },
  success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
};

export function ActivityLogList() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeLogs((data) => {
      setLogs(data);
      setLoading(false);
    }, 6);
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl opacity-20" />
            <div className="space-y-2 flex-1 pt-1">
              <Skeleton className="h-3 w-1/3 opacity-30" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-12 text-center">
        <Clock className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest">No activity recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 relative">
      {/* Decorative vertical line */}
      <div className="absolute left-[27px] top-6 bottom-6 w-[1px] bg-border/20" />
      
      {logs.map((log) => {
        const config = typeConfig[log.type] || typeConfig.info;
        const Icon = config.icon;
        
        return (
          <div key={log.id} className="group relative flex gap-4 px-3 py-4 hover:bg-accent/30 transition-all rounded-2xl first:mt-0 last:mb-0">
            <div className={cn('relative z-10 h-10 w-10 shrink-0 rounded-xl flex items-center justify-center border border-border/20 shadow-apple-sm transition-transform group-hover:scale-110', config.bg)}>
              <Icon className={cn('h-5 w-5', config.color)} />
            </div>
            
            <div className="flex flex-col gap-1 min-w-0 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-tight text-foreground/80">{log.action}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                <span className="text-[10px] font-bold text-muted-foreground/50 tabular-nums">
                  {log.timestamp?.toDate ? new Date(log.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground/80 font-medium leading-normal group-hover:text-foreground transition-colors">
                <strong className="text-foreground/90">{log.user}</strong> {log.details}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  colorScheme?: 'green' | 'blue' | 'purple' | 'amber';
}

const colorMap = {
  green:  { bg: 'bg-emerald-50 dark:bg-emerald-950/40',  icon: 'text-emerald-600 dark:text-emerald-400',  ring: 'ring-emerald-200 dark:ring-emerald-800' },
  blue:   { bg: 'bg-blue-50 dark:bg-blue-950/40',        icon: 'text-blue-600 dark:text-blue-400',        ring: 'ring-blue-200 dark:ring-blue-800' },
  purple: { bg: 'bg-violet-50 dark:bg-violet-950/40',    icon: 'text-violet-600 dark:text-violet-400',    ring: 'ring-violet-200 dark:ring-violet-800' },
  amber:  { bg: 'bg-amber-50 dark:bg-amber-950/40',      icon: 'text-amber-600 dark:text-amber-400',      ring: 'ring-amber-200 dark:ring-amber-800' },
};

export function StatsCard({ label, value, subtext, trend, icon: Icon, colorScheme = 'green' }: StatsCardProps) {
  const colors = colorMap[colorScheme];

  return (
    <Card className="apple-card border-none overflow-hidden relative group">
      {/* Background soft glow based on color scheme */}
      <div className={cn('absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-20 transition-opacity duration-500 group-hover:opacity-40', colors.bg)} />
      
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3 sm:gap-5">
          <div className="space-y-4 flex-1">
            <div className="flex flex-col gap-1">
               <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em]">{label}</p>
               <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">{value}</h3>
            </div>

            <div className="flex items-center gap-2">
              {trend && trend !== 'neutral' && (
                <span className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border',
                  trend === 'positive'
                    ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-red-600 bg-red-500/10 border-red-500/20'
                )}>
                  {trend === 'positive' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {subtext}
                </span>
              )}
              {(!trend || trend === 'neutral') && subtext && (
                <span className="text-[11px] text-muted-foreground/50 font-bold tracking-tight">{subtext}</span>
              )}
            </div>
          </div>
          
          {Icon && (
            <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 shadow-apple-sm', colors.bg, colors.ring)}>
              <Icon className={cn('h-6 w-6', colors.icon)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

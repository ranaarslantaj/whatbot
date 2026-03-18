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
    <Card className="stat-card-hover border-border/60 overflow-hidden relative group">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
              {trend && trend !== 'neutral' && (
                <span className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full',
                  trend === 'positive'
                    ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/60'
                    : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-950/60'
                )}>
                  {trend === 'positive' ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                  {subtext}
                </span>
              )}
              {(!trend || trend === 'neutral') && subtext && (
                <span className="text-xs text-muted-foreground font-medium">{subtext}</span>
              )}
            </div>
          </div>
          {Icon && (
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center ring-1 shrink-0', colors.bg, colors.ring)}>
              <Icon className={cn('h-5 w-5', colors.icon)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

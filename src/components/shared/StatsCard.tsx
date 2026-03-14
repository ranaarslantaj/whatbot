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
}

export function StatsCard({ label, value, subtext, trend, icon: Icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <h3 className="text-2xl font-bold">{value}</h3>
          {trend && trend !== 'neutral' && (
            <span className={cn('flex items-center text-xs font-medium', trend === 'positive' ? 'text-emerald-600' : 'text-red-600')}>
              {trend === 'positive' ? <TrendingUp className="mr-0.5 h-3 w-3" /> : <TrendingDown className="mr-0.5 h-3 w-3" />}
              {subtext}
            </span>
          )}
          {(!trend || trend === 'neutral') && subtext && (
            <span className="text-xs text-muted-foreground">{subtext}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

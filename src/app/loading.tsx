import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="relative mb-4">
        <LoadingSpinner size="lg" className="text-primary" />
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 blur-xl" />
      </div>
      <p className="font-display animate-pulse text-sm font-medium tracking-widest text-muted-foreground uppercase">
        Loading WhatBot
      </p>
    </div>
  );
}

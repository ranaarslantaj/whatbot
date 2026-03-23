'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('Unhandled Application Error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20 backdrop-blur-sm">
        <AlertCircle className="h-12 w-12" />
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
          ERR
        </div>
      </div>
      
      <h1 className="font-display mb-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Something went wrong
      </h1>
      
      <p className="mb-10 max-w-md text-balance text-lg text-muted-foreground">
        An unexpected error occurred. Our team has been notified and we're looking into it.
      </p>
      
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          onClick={reset}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <RefreshCcw className="h-4 w-4" />
          Try Again
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-secondary px-8 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary/20"
        >
          Return Home
        </button>
      </div>
      
      {error.digest && (
        <p className="mt-8 text-xs font-mono text-muted-foreground opacity-50">
          ID: {error.digest}
        </p>
      )}
    </div>
  );
}

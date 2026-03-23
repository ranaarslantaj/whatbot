'use client';
import Link from 'next/link';
import { MapPinOff } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground ring-1 ring-border/50 backdrop-blur-sm">
        <MapPinOff className="h-12 w-12 opacity-50" />
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          404
        </div>
      </div>
      
      <h1 className="font-display mb-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Page Not Found
      </h1>
      
      <p className="mb-10 max-w-md text-balance text-lg text-muted-foreground">
        The page you are looking for doesn't exist or has been moved to another universe.
      </p>
      
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-8 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          Return Home
        </Link>
        <button
          onClick={() => window.history.back()}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-secondary px-8 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary/20"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

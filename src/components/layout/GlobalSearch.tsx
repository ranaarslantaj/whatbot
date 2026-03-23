'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  User, 
  MessageSquare, 
  Settings, 
  ShieldCheck, 
  LayoutDashboard,
  ArrowRight
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  href: string;
  category: string;
}

const STATIC_RESULTS: SearchResult[] = [
  { id: '1', title: 'Dashboard', subtitle: 'Overview and analytics', icon: LayoutDashboard, href: '/admin', category: 'Navigation' },
  { id: '2', title: 'Clients', subtitle: 'Manage your business clients', icon: User, href: '/admin/clients', category: 'Navigation' },
  { id: '3', title: 'Tickets', subtitle: 'Support inbox and chat', icon: MessageSquare, href: '/support/inbox', category: 'Navigation' },
  { id: '4', title: 'Admin Settings', subtitle: 'System configuration', icon: ShieldCheck, href: '/admin/settings', category: 'Admin' },
  { id: '5', title: 'My Profile', subtitle: 'Account preferences', icon: Settings, href: '/profile', category: 'Account' },
];

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange]);

  const filteredResults = STATIC_RESULTS.filter(item => 
    item.title.toLowerCase().includes(query.toLowerCase()) || 
    item.subtitle.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    onOpenChange(false);
    router.push(href);
    setQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-none top-[20%] translate-y-0">
        <div className="flex flex-col w-full bg-background/80 backdrop-blur-3xl rounded-3xl border border-border/40 shadow-apple-lg ring-1 ring-black/5 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center px-4 py-4 border-b border-border/20">
            <Search className="h-5 w-5 text-muted-foreground/50 mr-3" />
            <Input
              autoFocus
              placeholder="Search anything... (e.g. 'clients', 'support')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus-visible:ring-0 text-lg h-10 px-0 placeholder:text-muted-foreground/30 font-medium"
            />
            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-lg border border-border/20">
              <span className="text-[10px] font-bold text-muted-foreground/60">ESC</span>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
            {filteredResults.length > 0 ? (
              <div className="space-y-4 py-2">
                {['Navigation', 'Admin', 'Account'].map(category => {
                  const categoryResults = filteredResults.filter(r => r.category === category);
                  if (categoryResults.length === 0) return null;

                  return (
                    <div key={category} className="space-y-1">
                      <h4 className="px-3 text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground/40 mb-2">
                        {category}
                      </h4>
                      {categoryResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => handleSelect(result.href)}
                          className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-2xl hover:bg-primary/5 group transition-all text-left"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center border border-border/20 group-hover:bg-primary/10 group-hover:border-primary/20 transition-colors">
                              <result.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                            <div className="flex flex-col leading-tight">
                              <span className="text-[14px] font-bold text-foreground group-hover:text-primary transition-colors">
                                {result.title}
                              </span>
                              <span className="text-[11px] text-muted-foreground/60 font-medium tracking-tight">
                                {result.subtitle}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground/0 -translate-x-2 group-hover:text-primary group-hover:translate-x-0 transition-all opacity-0 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="h-12 w-12 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4 border border-border/10">
                  <Search className="h-6 w-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm font-bold text-muted-foreground/40 tracking-tight uppercase">No results found for "{query}"</p>
              </div>
            )}
          </div>
          
          <div className="px-5 py-3 bg-muted/20 border-t border-border/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1.5 grayscale opacity-50">
                  <kbd className="px-1.5 py-0.5 rounded border border-border/40 bg-background text-[10px] font-bold">↵</kbd>
                  <span className="text-[10px] font-medium text-muted-foreground">Select</span>
               </div>
               <div className="flex items-center gap-1.5 grayscale opacity-50">
                  <kbd className="px-1.5 py-0.5 rounded border border-border/40 bg-background text-[10px] font-bold">↑↓</kbd>
                  <span className="text-[10px] font-medium text-muted-foreground">Navigate</span>
               </div>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/30 tracking-widest uppercase italic">
               WhatBot Intelligence
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { StatsCard } from '@/components/shared/StatsCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ActivityLogList } from '@/components/admin/ActivityLog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, query, orderBy, db } from '@/lib/firebase';
import { useCollectionQuery } from '@/hooks/useCollectionQuery';
import type { Client } from '@/types';
import { Users, Phone, MessageSquare, DollarSign, Plus, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminOverview() {
  const { data: clients = [], isLoading: loading } = useCollectionQuery<Client>(
    ['clients'],
    query(collection(db, 'clients'), orderBy('createdAt', 'desc'))
  );

  const activeClients = clients.filter((c) => c.status === 'active').length;
  const activeNumbers = clients.filter((c) => c.whatsappNumber).length;
  const totalRevenue = clients.reduce((sum, c) => sum + (c.planPrice || 0), 0);
  const totalMessages = clients.reduce((sum, c) => sum + (c.messagesUsedThisMonth || 0), 0);



  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and management"
        action={
          <Link href="/admin/clients">
            <Button className="gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Add Client
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard loading={loading} label="Total Clients"            value={clients.length}                  subtext={`${activeClients} active`}  icon={Users}         colorScheme="green"  />
        <StatsCard loading={loading} label="Active WhatsApp Numbers"  value={activeNumbers}                   icon={Phone}         colorScheme="blue"   />
        <StatsCard loading={loading} label="Messages This Month"      value={totalMessages.toLocaleString()}  icon={MessageSquare} colorScheme="purple" />
        <StatsCard loading={loading} label="Monthly Revenue"          value={`$${totalRevenue.toLocaleString()}`} trend="positive" subtext="+12%" icon={DollarSign} colorScheme="amber" />
      </div>

      {/* Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Clients */}
        <Card className="apple-card border-none overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-[14px] font-bold uppercase tracking-wider text-muted-foreground/80">Recent Clients</CardTitle>
            <Link href="/admin/clients">
              <Button variant="ghost" size="sm" className="text-[11px] font-bold uppercase tracking-widest text-primary h-7 px-3 rounded-full hover:bg-primary/10">View all</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/20">
              {clients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between px-6 py-4 hover:bg-accent/30 transition-colors group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-2xl bg-muted/50 border border-border/20 flex items-center justify-center shrink-0 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                      <span className="text-sm font-black text-foreground group-hover:text-primary">
                        {client.businessName?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] font-bold truncate text-foreground group-hover:text-primary transition-colors">{client.businessName}</p>
                      <p className="text-[11px] text-muted-foreground/60 font-medium truncate">{client.ownerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={client.status} />
                  </div>
                </div>
              ))}
              {clients.length === 0 && !loading && (
                <div className="py-12 text-center">
                   <Users className="h-8 w-8 text-muted-foreground/10 mx-auto mb-3" />
                   <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-widest">No clients found</p>
                </div>
              )}
              {loading && Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-2xl opacity-20" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40 opacity-30" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full opacity-20" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Log */}
        <Card className="apple-card border-none overflow-hidden">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-[14px] font-bold uppercase tracking-wider text-muted-foreground/80">Platform Activity</CardTitle>
          </CardHeader>
          <CardContent className="px-3">
             <ActivityLogList />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

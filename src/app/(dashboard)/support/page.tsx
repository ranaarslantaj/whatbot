'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { subscribeTickets, subscribeClients } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import type { Ticket, Client } from '@/types';
import { Inbox, Users, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function SupportOverview() {
  const user = useAuthStore((s) => s.user);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const u1 = subscribeTickets((d) => setTickets(d));
    const u2 = subscribeClients((d) => setClients(d));
    return () => { u1(); u2(); };
  }, []);

  const open = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  const assigned = clients.filter((c) => user?.assignedClientIds?.includes(c.id));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Support Dashboard"
        description="Your tickets and assigned clients at a glance."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Open Tickets"    value={open.length}                                           icon={Inbox}        colorScheme="amber"  />
        <StatsCard label="My Clients"      value={assigned.length}                                       icon={Users}        colorScheme="blue"   />
        <StatsCard label="Avg Response"    value="12m"                                                   icon={Clock}        colorScheme="purple" />
        <StatsCard label="Resolved Today"  value={tickets.filter((t) => t.status === 'resolved').length} icon={CheckCircle}  colorScheme="green"  />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tickets */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">Recent Tickets</CardTitle>
            <Link href="/support/inbox">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">View all</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {tickets.slice(0, 5).map((t) => (
                <Link key={t.id} href={`/support/inbox/${t.id}`} className="block">
                  <div className="flex items-center justify-between px-6 py-3 hover:bg-accent/40 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{t.subject}</p>
                      <p className="text-xs text-muted-foreground">{t.clientName}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <StatusBadge status={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                </Link>
              ))}
              {tickets.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No tickets</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* My Clients */}
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">My Clients</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {assigned.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between px-6 py-3 hover:bg-accent/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {c.businessName?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.businessName}</p>
                      <p className="text-xs text-muted-foreground truncate">{c.ownerEmail}</p>
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
              {assigned.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No assigned clients</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

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
  useEffect(() => { const u1 = subscribeTickets((d) => setTickets(d)); const u2 = subscribeClients((d) => setClients(d)); return () => { u1(); u2(); }; }, []);

  const open = tickets.filter((t) => t.status === 'open' || t.status === 'in_progress');
  const assigned = clients.filter((c) => user?.assignedClientIds?.includes(c.id));

  return (
    <div className="space-y-6">
      <PageHeader title="Support Dashboard" description="Your support overview" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Open Tickets" value={open.length} icon={Inbox} />
        <StatsCard label="My Clients" value={assigned.length} icon={Users} />
        <StatsCard label="Avg Response" value="12m" icon={Clock} />
        <StatsCard label="Resolved Today" value={tickets.filter((t) => t.status === 'resolved').length} icon={CheckCircle} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="text-lg">Recent Tickets</CardTitle><Link href="/support/inbox"><Button variant="outline" size="sm">View All</Button></Link></CardHeader><CardContent>
          <div className="space-y-3">{tickets.slice(0,5).map((t) => (<Link key={t.id} href={`/support/inbox/${t.id}`} className="block"><div className="flex items-center justify-between rounded-lg border p-3 hover:bg-zinc-50"><div><p className="font-medium text-sm">{t.subject}</p><p className="text-xs text-muted-foreground">{t.clientName}</p></div><div className="flex gap-2"><StatusBadge status={t.priority} /><StatusBadge status={t.status} /></div></div></Link>))}{tickets.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No tickets</p>}</div>
        </CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">My Clients</CardTitle></CardHeader><CardContent>
          <div className="space-y-3">{assigned.slice(0,5).map((c) => (<div key={c.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium text-sm">{c.businessName}</p><p className="text-xs text-muted-foreground">{c.ownerEmail}</p></div><StatusBadge status={c.status} /></div>))}{assigned.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No assigned clients</p>}</div>
        </CardContent></Card>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { subscribeClients } from '@/lib/firestore';
import type { Client } from '@/types';
import { Users, Phone, MessageSquare, DollarSign, Plus, Activity } from 'lucide-react';
import Link from 'next/link';

export default function AdminOverview() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeClients((data) => { setClients(data); setLoading(false); });
    return () => unsub();
  }, []);

  const activeClients = clients.filter((c) => c.status === 'active').length;
  const activeNumbers = clients.filter((c) => c.whatsappNumber).length;
  const totalRevenue = clients.reduce((sum, c) => sum + (c.planPrice || 0), 0);
  const totalMessages = clients.reduce((sum, c) => sum + (c.messagesUsedThisMonth || 0), 0);

  const systemHealth = [
    { label: 'API Status',             value: 'Operational', ok: true },
    { label: 'Webhook Delivery',       value: '99.8%',       ok: true },
    { label: 'Avg Response Time',      value: '45ms',        ok: true },
    { label: 'Template Approval Rate', value: '94%',         ok: true },
    { label: 'Open Tickets',           value: '3',           ok: false },
  ];

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
        <StatsCard label="Total Clients"            value={clients.length}                  subtext={`${activeClients} active`}  icon={Users}         colorScheme="green"  />
        <StatsCard label="Active WhatsApp Numbers"  value={activeNumbers}                   icon={Phone}         colorScheme="blue"   />
        <StatsCard label="Messages This Month"      value={totalMessages.toLocaleString()}  icon={MessageSquare} colorScheme="purple" />
        <StatsCard label="Monthly Revenue"          value={`$${totalRevenue.toLocaleString()}`} trend="positive" subtext="+12%" icon={DollarSign} colorScheme="amber" />
      </div>

      {/* Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Clients */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base font-semibold">Recent Clients</CardTitle>
            <Link href="/admin/clients">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">View all</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {clients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between px-6 py-3 hover:bg-accent/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {client.businessName?.[0]?.toUpperCase() ?? '?'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{client.businessName}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.ownerEmail}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={client.plan} />
                    <StatusBadge status={client.status} />
                  </div>
                </div>
              ))}
              {clients.length === 0 && !loading && (
                <p className="text-center text-sm text-muted-foreground py-8">No clients yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Activity className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealth.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold">{item.value}</span>
                    <span className={`h-2 w-2 rounded-full ${item.ok ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]'}`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

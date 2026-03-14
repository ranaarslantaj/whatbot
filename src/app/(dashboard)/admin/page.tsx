'use client';

import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { subscribeClients } from '@/lib/firestore';
import type { Client } from '@/types';
import { Users, Phone, MessageSquare, DollarSign, Plus } from 'lucide-react';
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

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" description="Platform overview and management"
        action={<Link href="/admin/clients"><Button><Plus className="mr-2 h-4 w-4" /> Add Client</Button></Link>} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Total Clients" value={clients.length} subtext={`${activeClients} active`} icon={Users} />
        <StatsCard label="Active WhatsApp Numbers" value={activeNumbers} icon={Phone} />
        <StatsCard label="Messages This Month" value={totalMessages.toLocaleString()} icon={MessageSquare} />
        <StatsCard label="Monthly Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} trend="positive" subtext="+12%" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Clients</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clients.slice(0, 5).map((client) => (
                <div key={client.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div><p className="font-medium">{client.businessName}</p><p className="text-sm text-muted-foreground">{client.ownerEmail}</p></div>
                  <div className="flex items-center gap-2"><StatusBadge status={client.plan} /><StatusBadge status={client.status} /></div>
                </div>
              ))}
              {clients.length === 0 && !loading && <p className="text-center text-sm text-muted-foreground py-4">No clients yet</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">System Health</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[{ label: 'API Status', value: 'Operational', ok: true }, { label: 'Webhook Delivery', value: '99.8%', ok: true },
                { label: 'Avg Response Time', value: '45ms', ok: true }, { label: 'Template Approval Rate', value: '94%', ok: true },
                { label: 'Open Tickets', value: '3', ok: false }].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.value}</span>
                    <div className={`h-2 w-2 rounded-full ${item.ok ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
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

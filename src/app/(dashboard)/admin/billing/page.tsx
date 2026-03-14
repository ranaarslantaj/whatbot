'use client';
import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { subscribeClients } from '@/lib/firestore';
import type { Client } from '@/types';
import { type ColumnDef } from '@tanstack/react-table';
import { DollarSign, Receipt, CheckCircle, CreditCard, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminBillingPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const u = subscribeClients((d) => { setClients(d); setLoading(false); }); return () => u(); }, []);

  const mrr = clients.reduce((s, c) => s + (c.planPrice || 0), 0);
  const planData = [{ plan: 'Starter', count: clients.filter((c) => c.plan === 'starter').length }, { plan: 'Pro', count: clients.filter((c) => c.plan === 'pro').length }, { plan: 'Enterprise', count: clients.filter((c) => c.plan === 'enterprise').length }];
  const columns: ColumnDef<Client>[] = [
    { accessorKey: 'businessName', header: 'Business' },
    { accessorKey: 'plan', header: 'Plan', cell: ({ row }) => <StatusBadge status={row.original.plan} /> },
    { id: 'amount', header: 'Monthly', cell: ({ row }) => `$${row.original.planPrice}` },
    { id: 'status', header: 'Status', cell: () => <StatusBadge status="paid" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Billing" description="Revenue overview" action={<Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="MRR" value={`$${mrr.toLocaleString()}`} icon={DollarSign} trend="positive" subtext="+8%" />
        <StatsCard label="Total Clients" value={clients.length} icon={Receipt} />
        <StatsCard label="Paid This Month" value={clients.length} icon={CheckCircle} />
        <StatsCard label="Overdue" value={0} icon={CreditCard} />
      </div>
      <Card><CardHeader><CardTitle className="text-base">Clients by Plan</CardTitle></CardHeader><CardContent><div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={planData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="plan" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer></div></CardContent></Card>
      <DataTable columns={columns} data={clients} searchable searchPlaceholder="Search billing..." loading={loading} />
    </div>
  );
}

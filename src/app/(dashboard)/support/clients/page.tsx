'use client';
import { useEffect, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import { subscribeClients } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { Client } from '@/types';

export default function SupportClientsPage() {
  const user = useAuthStore((s) => s.user);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const u = subscribeClients((d) => { setClients(d.filter((c) => user?.assignedClientIds?.includes(c.id))); setLoading(false); }); return () => u(); }, [user]);

  const columns: ColumnDef<Client>[] = [
    { accessorKey: 'businessName', header: 'Client Name' },
    { accessorKey: 'plan', header: 'Plan', cell: ({ row }) => <StatusBadge status={row.original.plan} /> },
    { accessorKey: 'storeType', header: 'Integration', cell: ({ row }) => row.original.storeType || '—' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (<div className="space-y-6"><PageHeader title="My Clients" description="Clients assigned to you" /><DataTable columns={columns} data={clients} searchable searchPlaceholder="Search..." loading={loading} /></div>);
}

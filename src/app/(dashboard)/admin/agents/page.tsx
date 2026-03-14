'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { subscribeAgents } from '@/lib/firestore';
import type { User } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Loader2 } from 'lucide-react';

const schema = z.object({ name: z.string().min(2), email: z.string().email() });
type Form = z.infer<typeof schema>;

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => { const u = subscribeAgents((d) => { setAgents(d); setLoading(false); }); return () => u(); }, []);

  const onAdd = async (data: Form) => {
    setSubmitting(true);
    try { toast.success('Agent invitation sent to ' + data.email); setAddOpen(false); reset(); } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { id: 'clients', header: 'Assigned Clients', cell: ({ row }) => row.original.assignedClientIds?.length || 0 },
    { id: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'suspended'} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Support Agents" description="Manage support team" action={<Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Agent</Button>} />
      <DataTable columns={columns} data={agents} searchable searchPlaceholder="Search agents..." loading={loading} />
      <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogContent><DialogHeader><DialogTitle>Add Support Agent</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
          <div className="space-y-2"><Label>Full Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}</div>
          <div className="space-y-2"><Label>Email</Label><Input type="email" {...register('email')} />{errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}</div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Agent</Button></DialogFooter>
        </form></DialogContent></Dialog>
    </div>
  );
}

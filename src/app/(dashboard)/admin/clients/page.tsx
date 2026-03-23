'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { ImpersonateButton } from '@/components/admin/ImpersonateButton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { subscribeClients, createClient, suspendClient, updateClient } from '@/lib/firestore';
import type { Client, ClientPlan } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Loader2, MoreHorizontal, Ban, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Timestamp } from '@/lib/firebase';

const addClientSchema = z.object({ businessName: z.string().min(2), ownerName: z.string().min(2), ownerEmail: z.string().email(), plan: z.enum(['starter', 'pro', 'enterprise']), whatsappNumber: z.string().optional() });
type AddClientForm = z.infer<typeof addClientSchema>;
const planPrices: Record<ClientPlan, number> = { starter: 49, pro: 149, enterprise: 499 };
const planQuotas: Record<ClientPlan, number> = { starter: 1000, pro: 10000, enterprise: 100000 };

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suspendDialog, setSuspendDialog] = useState<{ open: boolean; client: Client | null }>({ open: false, client: null });
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AddClientForm>({ resolver: zodResolver(addClientSchema), defaultValues: { plan: 'starter' } });

  useEffect(() => { const unsub = subscribeClients((d) => { setClients(d); setLoading(false); }); return () => unsub(); }, []);

  const onAddClient = async (data: AddClientForm) => {
    setSubmitting(true);
    try {
      const plan = data.plan as ClientPlan;
      await createClient({ businessName: data.businessName, ownerName: data.ownerName, ownerEmail: data.ownerEmail, ownerUid: '', plan, planPrice: planPrices[plan], status: 'setup', whatsappNumber: data.whatsappNumber || null, whatsappDisplayName: null, wabaId: null, phoneNumberId: null, apiKey: crypto.randomUUID(), webhookSecret: crypto.randomUUID(), storeType: null, storeUrl: null, storeConnected: false, messageQuota: planQuotas[plan], messagesUsedThisMonth: 0, assignedAgentIds: [], billingDate: Timestamp.now() });
      toast.success('Client created'); setAddOpen(false); reset();
    } catch { toast.error('Failed to create client'); } finally { setSubmitting(false); }
  };

  const handleSuspendToggle = async () => {
    const client = suspendDialog.client; if (!client) return;
    try { if (client.status === 'suspended') { await updateClient(client.id, { status: 'active' }); toast.success('Client activated'); } else { await suspendClient(client.id); toast.success('Client suspended'); } } catch { toast.error('Action failed'); }
    setSuspendDialog({ open: false, client: null });
  };

  const columns: ColumnDef<Client>[] = [
    { accessorKey: 'businessName', header: 'Business Name' },
    { accessorKey: 'plan', header: 'Plan', cell: ({ row }) => <StatusBadge status={row.original.plan} /> },
    { accessorKey: 'whatsappNumber', header: 'Phone', cell: ({ row }) => row.original.whatsappNumber || '—' },
    { id: 'messages', header: 'Messages', cell: ({ row }) => `${(row.original.messagesUsedThisMonth || 0).toLocaleString()} / ${(row.original.messageQuota || 0).toLocaleString()}` },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    { id: 'actions', header: 'Actions', cell: ({ row }) => {
      const c = row.original;
      return (<div className="flex items-center gap-1">
        <Link href={`/admin/clients/${c.id}`}><Button variant="ghost" size="sm">Manage</Button></Link>
        <ImpersonateButton clientId={c.id} clientName={c.businessName} />
        <DropdownMenu><DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
          <DropdownMenuContent align="end"><DropdownMenuItem onClick={() => setSuspendDialog({ open: true, client: c })}>{c.status === 'suspended' ? <><CheckCircle className="mr-2 h-4 w-4" /> Activate</> : <><Ban className="mr-2 h-4 w-4" /> Suspend</>}</DropdownMenuItem></DropdownMenuContent>
        </DropdownMenu></div>);
    }},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Manage all platform clients" action={<Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Client</Button>} />
      <DataTable columns={columns} data={clients} searchable searchPlaceholder="Search clients..." loading={loading} />
      <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogContent><DialogHeader><DialogTitle>Add New Client</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onAddClient)} className="space-y-4">
          <div className="space-y-2"><Label>Business Name</Label><Input {...register('businessName')} />{errors.businessName && <p className="text-xs text-red-500">{errors.businessName.message}</p>}</div>
          <div className="space-y-2"><Label>Owner Name</Label><Input {...register('ownerName')} />{errors.ownerName && <p className="text-xs text-red-500">{errors.ownerName.message}</p>}</div>
          <div className="space-y-2"><Label>Owner Email</Label><Input type="email" {...register('ownerEmail')} />{errors.ownerEmail && <p className="text-xs text-red-500">{errors.ownerEmail.message}</p>}</div>
          <div className="space-y-2"><Label>Plan</Label><Select defaultValue="starter" onValueChange={(v) => setValue('plan', (v as string) as ClientPlan)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="starter">Starter ($49/mo)</SelectItem><SelectItem value="pro">Pro ($149/mo)</SelectItem><SelectItem value="enterprise">Enterprise ($499/mo)</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>WhatsApp Number (optional)</Label><Input {...register('whatsappNumber')} placeholder="+1234567890" /></div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Client</Button></DialogFooter>
        </form></DialogContent></Dialog>
      <ConfirmDialog open={suspendDialog.open} onOpenChange={(o) => setSuspendDialog({ open: o, client: suspendDialog.client })} title={suspendDialog.client?.status === 'suspended' ? 'Activate Client' : 'Suspend Client'} description={`Are you sure you want to ${suspendDialog.client?.status === 'suspended' ? 'activate' : 'suspend'} ${suspendDialog.client?.businessName}?`} confirmLabel={suspendDialog.client?.status === 'suspended' ? 'Activate' : 'Suspend'} variant={suspendDialog.client?.status === 'suspended' ? 'default' : 'destructive'} onConfirm={handleSuspendToggle} />
    </div>
  );
}

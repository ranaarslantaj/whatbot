'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useImpersonateStore } from '@/store/impersonateStore';
import { subscribeCampaigns, createCampaign, subscribeTemplates } from '@/lib/firestore';
import type { Campaign, Template } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Send, Megaphone, Eye, Loader2 } from 'lucide-react';

const schema = z.object({ name: z.string().min(2), templateId: z.string().min(1), audienceSize: z.number().min(1) });
type Form = z.infer<typeof schema>;

export default function ClientCampaignsPage() {
  const user = useAuthStore((s) => s.user);
  const { isImpersonating, clientId: impId } = useImpersonateStore();
  const clientId = isImpersonating ? impId : user?.clientId;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { audienceSize: 100 } });

  useEffect(() => { if (!clientId) return; const u1 = subscribeCampaigns(clientId, (d) => { setCampaigns(d); setLoading(false); }); const u2 = subscribeTemplates((d) => setTemplates(d.filter((t) => t.status === 'approved')), clientId); return () => { u1(); u2(); }; }, [clientId]);

  const total = campaigns.reduce((s, c) => s + c.sentCount, 0);
  const avgDel = campaigns.length ? Math.round(campaigns.reduce((s, c) => s + (c.sentCount ? (c.deliveredCount / c.sentCount) * 100 : 0), 0) / campaigns.length) : 0;
  const avgRead = campaigns.length ? Math.round(campaigns.reduce((s, c) => s + (c.sentCount ? (c.readCount / c.sentCount) * 100 : 0), 0) / campaigns.length) : 0;

  const onSubmit = async (data: Form) => {
    if (!clientId) return; setSubmitting(true);
    try { const t = templates.find((t) => t.id === data.templateId); await createCampaign({ clientId, name: data.name, templateId: data.templateId, templateName: t?.name || '', audienceSize: data.audienceSize, sentCount: 0, deliveredCount: 0, readCount: 0, status: 'draft', scheduledAt: null, completedAt: null }); toast.success('Created'); setSheetOpen(false); reset(); } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const columns: ColumnDef<Campaign>[] = [
    { accessorKey: 'name', header: 'Campaign' }, { accessorKey: 'templateName', header: 'Template' },
    { id: 'sent', header: 'Sent', cell: ({ row }) => row.original.sentCount.toLocaleString() },
    { id: 'delivered', header: 'Delivered %', cell: ({ row }) => row.original.sentCount ? `${Math.round((row.original.deliveredCount / row.original.sentCount) * 100)}%` : '—' },
    { id: 'read', header: 'Read %', cell: ({ row }) => row.original.sentCount ? `${Math.round((row.original.readCount / row.original.sentCount) * 100)}%` : '—' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Campaigns" description="Broadcast campaigns" action={<Button onClick={() => setSheetOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create</Button>} />
      <div className="grid gap-4 md:grid-cols-3"><StatsCard label="Total Sent" value={total.toLocaleString()} icon={Send} /><StatsCard label="Avg Delivery" value={`${avgDel}%`} icon={Megaphone} /><StatsCard label="Avg Read" value={`${avgRead}%`} icon={Eye} /></div>
      <DataTable columns={columns} data={campaigns} searchable searchPlaceholder="Search..." loading={loading} />
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}><SheetContent><SheetHeader><SheetTitle>Create Campaign</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}</div>
          <div className="space-y-2"><Label>Template</Label><Select onValueChange={(v) => setValue('templateId', v as string)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Audience Size</Label><Input type="number" {...register('audienceSize', { valueAsNumber: true })} /></div>
          <SheetFooter><Button type="submit" disabled={submitting} className="w-full">{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Launch</Button></SheetFooter>
        </form></SheetContent></Sheet>
    </div>
  );
}

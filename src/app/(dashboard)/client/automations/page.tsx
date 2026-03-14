'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { useImpersonateStore } from '@/store/impersonateStore';
import { subscribeAutomations, createAutomation, toggleAutomation, subscribeTemplates } from '@/lib/firestore';
import type { Automation, Template } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Bot, Zap, Loader2 } from 'lucide-react';

const schema = z.object({ name: z.string().min(2), trigger: z.string().min(1), templateId: z.string().min(1), delayMinutes: z.number() });
type Form = z.infer<typeof schema>;
const triggers: Record<string, string> = { 'order.created': 'Order Created', 'order.shipped': 'Order Shipped', 'order.delivered': 'Delivered', 'cart.abandoned': 'Cart Abandoned', 'payment.confirmed': 'Payment Confirmed' };

export default function ClientAutomationsPage() {
  const user = useAuthStore((s) => s.user);
  const { isImpersonating, clientId: impId } = useImpersonateStore();
  const clientId = isImpersonating ? impId : user?.clientId;
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { delayMinutes: 0 } });

  useEffect(() => { if (!clientId) return; const u1 = subscribeAutomations(clientId, (d) => { setAutomations(d); setLoading(false); }); const u2 = subscribeTemplates((d) => setTemplates(d.filter((t) => t.status === 'approved')), clientId); return () => { u1(); u2(); }; }, [clientId]);

  const onSubmit = async (data: Form) => {
    if (!clientId) return; setSubmitting(true);
    try { const t = templates.find((t) => t.id === data.templateId); await createAutomation({ clientId, name: data.name, trigger: data.trigger as Automation['trigger'], templateId: data.templateId, templateName: t?.name || '', delayMinutes: data.delayMinutes, isActive: true, sentCount: 0 }); toast.success('Created'); setSheetOpen(false); reset(); } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Automations" description="Automated WhatsApp messages" action={<Button onClick={() => setSheetOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create</Button>} />
      {automations.length === 0 ? <EmptyState icon={Bot} title="No automations" description="Create automations to send messages automatically" action={<Button onClick={() => setSheetOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create</Button>} /> : (
        <div className="grid gap-4 md:grid-cols-2">{automations.map((a) => (<Card key={a.id}><CardContent className="p-4"><div className="flex items-start justify-between"><div className="space-y-1"><p className="font-medium">{a.name}</p><div className="flex items-center gap-2"><span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700"><Zap className="mr-1 h-3 w-3" />{triggers[a.trigger] || a.trigger}</span><span className="text-xs text-muted-foreground">→ {a.templateName}</span></div><div className="flex gap-4 text-xs text-muted-foreground mt-2"><span>Delay: {a.delayMinutes === 0 ? 'Instant' : `${a.delayMinutes}m`}</span><span>{a.sentCount} sent</span></div></div><Switch checked={a.isActive} onCheckedChange={(c) => { toggleAutomation(a.id, c); toast.success(c ? 'Enabled' : 'Disabled'); }} /></div></CardContent></Card>))}</div>
      )}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}><SheetContent><SheetHeader><SheetTitle>Create Automation</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2"><Label>Name</Label><Input {...register('name')} />{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}</div>
          <div className="space-y-2"><Label>Trigger</Label><Select onValueChange={(v) => setValue('trigger', v as string)}><SelectTrigger><SelectValue placeholder="Select trigger" /></SelectTrigger><SelectContent>{Object.entries(triggers).map(([k,v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Template</Label><Select onValueChange={(v) => setValue('templateId', v as string)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Delay</Label><Select defaultValue="0" onValueChange={(v) => setValue('delayMinutes', parseInt(v as string))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">Instant</SelectItem><SelectItem value="30">30 min</SelectItem><SelectItem value="60">1 hour</SelectItem><SelectItem value="180">3 hours</SelectItem><SelectItem value="1440">24 hours</SelectItem></SelectContent></Select></div>
          <SheetFooter><Button type="submit" disabled={submitting} className="w-full">{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button></SheetFooter>
        </form></SheetContent></Sheet>
    </div>
  );
}

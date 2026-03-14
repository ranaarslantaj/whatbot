'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/store/authStore';
import { useImpersonateStore } from '@/store/impersonateStore';
import { subscribeTemplates, createTemplate } from '@/lib/firestore';
import type { Template } from '@/types';
import toast from 'react-hot-toast';
import { Plus, FileText, AlertCircle, Loader2 } from 'lucide-react';

const schema = z.object({ name: z.string().min(2).regex(/^[a-z0-9_]+$/, 'Use snake_case'), category: z.enum(['transactional','marketing','otp']), language: z.string().min(2), headerText: z.string().optional(), bodyText: z.string().min(5).max(1024), footerText: z.string().optional() });
type Form = z.infer<typeof schema>;

export default function ClientTemplatesPage() {
  const user = useAuthStore((s) => s.user);
  const { isImpersonating, clientId: impId } = useImpersonateStore();
  const clientId = isImpersonating ? impId : user?.clientId;
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { language: 'en', category: 'transactional' } });
  const bodyText = watch('bodyText') || '';

  useEffect(() => { if (!clientId) return; const u = subscribeTemplates((d) => { setTemplates(d); setLoading(false); }, clientId); return () => u(); }, [clientId]);

  const onSubmit = async (data: Form) => {
    if (!clientId) return; setSubmitting(true);
    try { await createTemplate({ clientId, name: data.name, category: data.category, language: data.language, headerText: data.headerText || null, bodyText: data.bodyText, footerText: data.footerText || null, status: 'draft', rejectionReason: null, approvedAt: null }); toast.success('Template created'); setSheetOpen(false); reset(); } catch { toast.error('Failed'); } finally { setSubmitting(false); }
  };

  const byStatus = (s: string) => s === 'all' ? templates : templates.filter((t) => t.status === s);
  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Message Templates" description="Manage your WhatsApp templates" action={<Button onClick={() => setSheetOpen(true)}><Plus className="mr-2 h-4 w-4" /> Request New</Button>} />
      <Tabs defaultValue="all"><TabsList><TabsTrigger value="all">All ({templates.length})</TabsTrigger><TabsTrigger value="pending_review">Pending</TabsTrigger><TabsTrigger value="approved">Approved</TabsTrigger><TabsTrigger value="rejected">Rejected</TabsTrigger></TabsList>
        {['all','pending_review','approved','rejected'].map((s) => (<TabsContent key={s} value={s} className="space-y-4 mt-4">{byStatus(s).length === 0 ? <EmptyState icon={FileText} title="No templates" description="Create one to get started" /> : byStatus(s).map((t) => (
          <Card key={t.id}><CardContent className="p-4"><div className="flex items-center gap-2 mb-2"><code className="text-sm font-semibold bg-zinc-100 px-2 py-0.5 rounded">{t.name}</code><StatusBadge status={t.status} /><StatusBadge status={t.category} /><span className="text-xs text-muted-foreground">({t.language})</span></div>
            {t.headerText && <p className="text-sm font-medium mb-1">{t.headerText}</p>}
            <div className="rounded bg-zinc-50 p-3 font-mono text-sm whitespace-pre-wrap">{t.bodyText}</div>
            {t.footerText && <p className="text-xs text-muted-foreground mt-2">{t.footerText}</p>}
            {t.rejectionReason && <Alert variant="destructive" className="mt-2"><AlertCircle className="h-4 w-4" /><AlertDescription>{t.rejectionReason}</AlertDescription></Alert>}
          </CardContent></Card>
        ))}</TabsContent>))}
      </Tabs>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}><SheetContent className="overflow-y-auto"><SheetHeader><SheetTitle>Request New Template</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2"><Label>Name (snake_case)</Label><Input {...register('name')} placeholder="order_confirm_v1" />{errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}</div>
          <div className="space-y-2"><Label>Category</Label><Select defaultValue="transactional" onValueChange={(v) => setValue('category', (v as string) as Form['category'])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="transactional">Transactional</SelectItem><SelectItem value="marketing">Marketing</SelectItem><SelectItem value="otp">OTP</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Language</Label><Select defaultValue="en" onValueChange={(v) => setValue('language', v as string)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="ur">Urdu</SelectItem><SelectItem value="ar">Arabic</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>Header (optional)</Label><Input {...register('headerText')} /></div>
          <div className="space-y-2"><div className="flex justify-between"><Label>Body</Label><span className={`text-xs ${bodyText.length > 1024 ? 'text-red-500' : 'text-muted-foreground'}`}>{bodyText.length}/1024</span></div><Textarea {...register('bodyText')} rows={6} placeholder="Hi {{1}}, your order #{{2}}..." />{errors.bodyText && <p className="text-xs text-red-500">{errors.bodyText.message}</p>}
            <Button type="button" variant="outline" size="sm" onClick={() => { const c = watch('bodyText') || ''; const n = (c.match(/\{\{(\d+)\}\}/g) || []).length + 1; setValue('bodyText', c + `{{${n}}}`); }}>+ Add Variable</Button></div>
          <div className="space-y-2"><Label>Footer (optional)</Label><Input {...register('footerText')} /></div>
          <SheetFooter><Button type="submit" disabled={submitting} className="w-full">{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Submit</Button></SheetFooter>
        </form></SheetContent></Sheet>
    </div>
  );
}

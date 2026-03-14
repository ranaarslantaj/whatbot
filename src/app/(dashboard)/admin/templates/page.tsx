'use client';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { subscribeTemplates, approveTemplate, rejectTemplate } from '@/lib/firestore';
import type { Template } from '@/types';
import toast from 'react-hot-toast';
import { Check, X, FileText } from 'lucide-react';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [reason, setReason] = useState('');

  useEffect(() => { const u = subscribeTemplates((d) => { setTemplates(d); setLoading(false); }); return () => u(); }, []);
  const handleApprove = async (id: string) => { await approveTemplate(id); toast.success('Template approved'); };
  const handleReject = async () => { if (!rejectDialog.id) return; await rejectTemplate(rejectDialog.id, reason); toast.success('Rejected'); setRejectDialog({ open: false, id: null }); setReason(''); };
  const byStatus = (s: string) => templates.filter((t) => t.status === s);
  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  const TCard = ({ t }: { t: Template }) => (
    <Card><CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div><div className="flex items-center gap-2 mb-1"><code className="font-semibold">{t.name}</code><StatusBadge status={t.status} /><StatusBadge status={t.category} /></div><p className="text-sm text-muted-foreground">Language: {t.language}</p></div>
        {t.status === 'pending_review' && <div className="flex gap-2"><Button size="sm" onClick={() => handleApprove(t.id)}><Check className="mr-1 h-3 w-3" /> Approve</Button><Button size="sm" variant="outline" className="text-red-600" onClick={() => setRejectDialog({ open: true, id: t.id })}><X className="mr-1 h-3 w-3" /> Reject</Button></div>}
      </div>
      {t.headerText && <p className="text-sm font-medium mb-1">{t.headerText}</p>}
      <div className="rounded bg-zinc-50 p-3 font-mono text-sm whitespace-pre-wrap">{t.bodyText}</div>
      {t.footerText && <p className="mt-2 text-xs text-muted-foreground">{t.footerText}</p>}
      {t.rejectionReason && <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-700">Reason: {t.rejectionReason}</div>}
    </CardContent></Card>
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Template Approvals" description="Review and approve message templates" />
      <Tabs defaultValue="pending_review">
        <TabsList><TabsTrigger value="pending_review">Pending ({byStatus('pending_review').length})</TabsTrigger><TabsTrigger value="pending_meta">Meta ({byStatus('pending_meta').length})</TabsTrigger><TabsTrigger value="approved">Approved ({byStatus('approved').length})</TabsTrigger><TabsTrigger value="rejected">Rejected ({byStatus('rejected').length})</TabsTrigger></TabsList>
        {['pending_review','pending_meta','approved','rejected'].map((s) => <TabsContent key={s} value={s} className="space-y-4 mt-4">{byStatus(s).length === 0 ? <EmptyState icon={FileText} title="No templates" description={`No ${s.replace('_',' ')} templates`} /> : byStatus(s).map((t) => <TCard key={t.id} t={t} />)}</TabsContent>)}
      </Tabs>
      <Dialog open={rejectDialog.open} onOpenChange={(o) => setRejectDialog({ open: o, id: rejectDialog.id })}><DialogContent><DialogHeader><DialogTitle>Reject Template</DialogTitle></DialogHeader>
        <div className="space-y-2"><Label>Reason</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain..." /></div>
        <DialogFooter><Button variant="outline" onClick={() => setRejectDialog({ open: false, id: null })}>Cancel</Button><Button variant="destructive" onClick={handleReject} disabled={!reason.trim()}>Reject</Button></DialogFooter>
      </DialogContent></Dialog>
    </div>
  );
}

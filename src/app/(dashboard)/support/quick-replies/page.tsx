'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { subscribeQuickReplies, createQuickReply, deleteQuickReply } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { QuickReply } from '@/types';
import toast from 'react-hot-toast';
import { Plus, MessageSquareReply, Trash2, Loader2 } from 'lucide-react';

const schema = z.object({ title: z.string().min(2), category: z.string().min(1), content: z.string().min(5) });
type Form = z.infer<typeof schema>;

export default function QuickRepliesPage() {
  const user = useAuthStore((s) => s.user);
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [del, setDel] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  useEffect(() => { const u = subscribeQuickReplies((d) => { setReplies(d); setLoading(false); }); return () => u(); }, []);

  const onAdd = async (data: Form) => { if (!user) return; setSubmitting(true); try { await createQuickReply({ ...data, createdBy: user.uid }); toast.success('Created'); setAddOpen(false); reset(); } catch { toast.error('Failed'); } finally { setSubmitting(false); } };

  return (
    <div className="space-y-6">
      <PageHeader title="Quick Replies" description="Reusable response templates" action={<Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add New</Button>} />
      {replies.length === 0 && !loading ? <EmptyState icon={MessageSquareReply} title="No quick replies" description="Create reusable replies" action={<Button onClick={() => setAddOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create</Button>} /> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{replies.map((r) => (<Card key={r.id}><CardContent className="p-4"><div className="flex items-start justify-between mb-2"><div><p className="font-medium text-sm">{r.title}</p><Badge variant="secondary" className="mt-1">{r.category}</Badge></div><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDel({ open: true, id: r.id })}><Trash2 className="h-3 w-3" /></Button></div><p className="text-sm text-muted-foreground mt-2 line-clamp-3">{r.content}</p></CardContent></Card>))}</div>
      )}
      <Dialog open={addOpen} onOpenChange={setAddOpen}><DialogContent><DialogHeader><DialogTitle>Add Quick Reply</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
          <div className="space-y-2"><Label>Title</Label><Input {...register('title')} />{errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}</div>
          <div className="space-y-2"><Label>Category</Label><Input {...register('category')} placeholder="e.g. Greeting" />{errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}</div>
          <div className="space-y-2"><Label>Content</Label><Textarea {...register('content')} rows={4} />{errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}</div>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button><Button type="submit" disabled={submitting}>{submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save</Button></DialogFooter>
        </form></DialogContent></Dialog>
      <ConfirmDialog open={del.open} onOpenChange={(o) => setDel({ open: o, id: del.id })} title="Delete Quick Reply" description="This cannot be undone." confirmLabel="Delete" variant="destructive" onConfirm={async () => { if (del.id) await deleteQuickReply(del.id); toast.success('Deleted'); setDel({ open: false, id: null }); }} />
    </div>
  );
}

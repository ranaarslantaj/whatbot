'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTicket, addTicketMessage, updateTicket, closeTicket } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Ticket } from '@/types';
import toast from 'react-hot-toast';
import { Send, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function TicketThreadPage() {
  const { ticketId } = useParams() as { ticketId: string };
  const user = useAuthStore((s) => s.user);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const load = async () => { setTicket(await getTicket(ticketId)); setLoading(false); };
  useEffect(() => { load(); }, [ticketId]);

  const handleSend = async () => {
    if (!reply.trim() || !user || !ticket) return;
    setSending(true);
    try {
      await addTicketMessage(ticketId, { senderId: user.uid, senderName: user.name, senderRole: user.role, message: reply });
      if (ticket.status === 'open') await updateTicket(ticketId, { status: 'in_progress', assignedAgentId: user.uid, assignedAgentName: user.name });
      setReply(''); await load(); toast.success('Sent');
    } catch { toast.error('Failed'); } finally { setSending(false); }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!ticket) return <div className="p-8 text-center">Ticket not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/support/inbox"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
        <PageHeader title={ticket.subject} description={`${ticket.clientName} — #${ticket.id.slice(0,8)}`} action={<div className="flex items-center gap-2"><StatusBadge status={ticket.priority} /><StatusBadge status={ticket.status} />{ticket.status !== 'closed' && <Button variant="outline" size="sm" onClick={async () => { await closeTicket(ticketId); await load(); toast.success('Closed'); }}><CheckCircle className="mr-1 h-3 w-3" /> Close</Button>}</div>} />
      </div>
      <Card><CardContent className="p-4"><p className="text-sm">{ticket.description}</p></CardContent></Card>
      <div className="space-y-3">
        {ticket.messages?.map((m, i) => (<div key={i} className={cn('flex', m.senderRole === 'support_agent' || m.senderRole === 'super_admin' ? 'justify-end' : 'justify-start')}><div className={cn('max-w-[70%] rounded-xl p-3', m.senderRole === 'support_agent' || m.senderRole === 'super_admin' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}><p className="text-xs font-medium mb-1 opacity-75">{m.senderName}</p><p className="text-sm">{m.message}</p></div></div>))}
      </div>
      {ticket.status !== 'closed' && <div className="flex gap-2"><Textarea placeholder="Type your reply..." value={reply} onChange={(e) => setReply(e.target.value)} className="min-h-[80px]" /><Button onClick={handleSend} disabled={sending || !reply.trim()} className="self-end"><Send className="h-4 w-4" /></Button></div>}
    </div>
  );
}

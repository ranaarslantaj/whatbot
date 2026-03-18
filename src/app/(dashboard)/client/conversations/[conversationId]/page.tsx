'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getConversation, addConversationMessage, resolveConversation } from '@/lib/firestore';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import type { Conversation } from '@/types';
import toast from 'react-hot-toast';

export default function ConversationThreadPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversation = async () => {
    const conv = await getConversation(conversationId);
    setConversation(conv);
    setLoading(false);
  };

  useEffect(() => { loadConversation(); }, [conversationId]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [conversation?.messages]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    try {
      await addConversationMessage(conversationId, { direction: 'outbound', message: message.trim(), status: 'sent' });
      setMessage('');
      await loadConversation();
    } catch { toast.error('Failed to send message'); }
    setSending(false);
  };

  const handleResolve = async () => {
    try { await resolveConversation(conversationId); toast.success('Conversation resolved'); await loadConversation(); } catch { toast.error('Failed to resolve'); }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!conversation) return <div className="p-8 text-center text-muted-foreground">Conversation not found.</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/client/conversations')}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h2 className="font-semibold">{conversation.customerName}</h2>
            <p className="text-sm text-muted-foreground">{conversation.customerPhone}</p>
          </div>
          <StatusBadge status={conversation.status} />
        </div>
        {conversation.status !== 'resolved' && (
          <Button variant="outline" size="sm" onClick={handleResolve}><CheckCircle className="mr-2 h-4 w-4" /> Resolve</Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 py-4">
        {(conversation.messages || []).map((msg, i) => (
          <div key={i} className={cn('flex', msg.direction === 'outbound' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[70%] rounded-2xl px-4 py-2 text-sm', msg.direction === 'outbound' ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted text-foreground rounded-bl-sm')}>
              <p>{msg.message}</p>
              <p className={cn('mt-1 text-[10px]', msg.direction === 'outbound' ? 'text-emerald-200' : 'text-muted-foreground')}>
                {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {conversation.status !== 'resolved' && (
        <div className="flex gap-2 border-t pt-4">
          <Input placeholder="Type a message..." value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} className="flex-1" />
          <Button onClick={handleSend} disabled={sending || !message.trim()}><Send className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}

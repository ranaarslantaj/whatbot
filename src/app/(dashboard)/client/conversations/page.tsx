'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useImpersonateStore } from '@/store/impersonateStore';
import { subscribeConversations, resolveConversation } from '@/lib/firestore';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MessagesSquare, Search, CheckCircle } from 'lucide-react';
import type { Conversation } from '@/types';
import toast from 'react-hot-toast';

export default function ConversationsPage() {
  const user = useAuthStore((s) => s.user);
  const { isImpersonating, clientId: impersonatedClientId } = useImpersonateStore();
  const clientId = isImpersonating ? impersonatedClientId : user?.clientId;
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (!clientId) return;
    const unsub = subscribeConversations(clientId, (data) => { setConversations(data); setLoading(false); });
    return unsub;
  }, [clientId]);

  const filtered = conversations.filter((c) => {
    const matchesSearch = c.customerName.toLowerCase().includes(search.toLowerCase()) || c.customerPhone.includes(search);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleResolve = async (id: string) => {
    try { await resolveConversation(id); toast.success('Conversation resolved'); } catch { toast.error('Failed to resolve'); }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="Conversations" description="View and manage customer WhatsApp conversations" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-2">
          {['all', 'open', 'waiting', 'resolved'].map((s) => (
            <Button key={s} variant={statusFilter === s ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(s)} className="capitalize">{s}</Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={MessagesSquare} title="No conversations" description="No conversations match your filters." />
      ) : (
        <div className="divide-y rounded-lg border bg-white">
          {filtered.map((conv) => (
            <div key={conv.id} className="flex items-center justify-between gap-4 p-4 hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => router.push(`/client/conversations/${conv.id}`)}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{conv.customerName}</p>
                  {conv.unreadCount > 0 && <Badge variant="destructive" className="text-xs">{conv.unreadCount}</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{conv.customerPhone}</p>
                <p className="text-sm text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={conv.status} />
                {conv.status !== 'resolved' && (
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleResolve(conv.id); }}><CheckCircle className="h-4 w-4" /></Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

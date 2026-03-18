'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { subscribeTickets } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Ticket } from '@/types';
import { Inbox, Search } from 'lucide-react';

export default function SupportInboxPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { const u = subscribeTickets((d) => { setTickets(d); setLoading(false); }); return () => u(); }, []);

  const filtered = tickets.filter((t) => {
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.clientName.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'urgent') return t.priority === 'urgent';
    if (filter === 'mine') return t.assignedAgentId === user?.uid;
    if (filter === 'resolved') return t.status === 'resolved' || t.status === 'closed';
    return true;
  });

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="space-y-4">
      <PageHeader title="Ticket Inbox" description="Manage support tickets" />
      <Tabs value={filter} onValueChange={setFilter}><TabsList><TabsTrigger value="all">All ({tickets.length})</TabsTrigger><TabsTrigger value="urgent">Urgent</TabsTrigger><TabsTrigger value="mine">Mine</TabsTrigger><TabsTrigger value="resolved">Resolved</TabsTrigger></TabsList></Tabs>
      <div className="relative"><Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" /></div>
      <div className="space-y-2">
        {filtered.map((t) => (<div key={t.id} className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => router.push(`/support/inbox/${t.id}`)}>
          <Avatar className="h-9 w-9"><AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{t.clientName?.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
          <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="font-medium text-sm truncate">{t.subject}</p><StatusBadge status={t.priority} /></div><p className="text-xs text-muted-foreground truncate">{t.clientName}</p></div>
          <StatusBadge status={t.status} />
        </div>))}
        {filtered.length === 0 && <EmptyState icon={Inbox} title="No tickets" description="No tickets match your filters" />}
      </div>
    </div>
  );
}

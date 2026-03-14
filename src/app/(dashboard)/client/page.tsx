'use client';
import { useEffect, useState } from 'react';
import { StatsCard } from '@/components/shared/StatsCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useAuthStore } from '@/store/authStore';
import { useImpersonateStore } from '@/store/impersonateStore';
import { getClient, subscribeAutomations, toggleAutomation, subscribeConversations } from '@/lib/firestore';
import type { Client, Automation, Conversation } from '@/types';
import toast from 'react-hot-toast';
import { MessageSquare, MessagesSquare, ShoppingCart, TrendingUp } from 'lucide-react';

export default function ClientOverview() {
  const user = useAuthStore((s) => s.user);
  const { isImpersonating, clientId: impId } = useImpersonateStore();
  const clientId = isImpersonating ? impId : user?.clientId;
  const [client, setClient] = useState<Client | null>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!clientId) return; getClient(clientId).then((d) => { setClient(d); setLoading(false); }); const u1 = subscribeAutomations(clientId, setAutomations); const u2 = subscribeConversations(clientId, setConversations); return () => { u1(); u2(); }; }, [clientId]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!client) return <div className="p-8 text-center">Client not found</div>;
  const openConvos = conversations.filter((c) => c.status === 'open').length;
  const usage = client.messageQuota ? (client.messagesUsedThisMonth / client.messageQuota) * 100 : 0;

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome, ${client.businessName}`} description="Dashboard overview" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Messages Sent" value={client.messagesUsedThisMonth || 0} icon={MessageSquare} />
        <StatsCard label="Open Conversations" value={openConvos} icon={MessagesSquare} />
        <StatsCard label="Carts Recovered" value="12" subtext="this week" icon={ShoppingCart} />
        <StatsCard label="Delivery Rate" value="96.5%" trend="positive" subtext="+2.1%" icon={TrendingUp} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-lg">Automations</CardTitle></CardHeader><CardContent><div className="space-y-3">{automations.map((a) => (<div key={a.id} className="flex items-center justify-between rounded-lg border p-3"><div><p className="font-medium text-sm">{a.name}</p><p className="text-xs text-muted-foreground">{a.trigger} — {a.sentCount} sent</p></div><Switch checked={a.isActive} onCheckedChange={(c) => { toggleAutomation(a.id, c); toast.success(c ? 'Enabled' : 'Disabled'); }} /></div>))}{automations.length === 0 && <p className="text-center text-sm text-muted-foreground py-4">No automations</p>}</div></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-lg">Usage & Health</CardTitle></CardHeader><CardContent className="space-y-4">
          <div><div className="flex justify-between text-sm mb-1"><span>Message Quota</span><span className={usage > 90 ? 'text-red-600 font-medium' : ''}>{(client.messagesUsedThisMonth||0).toLocaleString()} / {(client.messageQuota||0).toLocaleString()}</span></div><Progress value={usage} className={usage > 90 ? '[&>div]:bg-red-500' : usage > 75 ? '[&>div]:bg-yellow-500' : ''} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Integration</span><StatusBadge status={client.storeConnected ? 'active' : 'setup'} /></div>
          <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Plan</span><StatusBadge status={client.plan} /></div>
        </CardContent></Card>
      </div>
    </div>
  );
}

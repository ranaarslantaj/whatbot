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
import { MessageSquare, MessagesSquare, ShoppingCart, TrendingUp, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ClientOverview() {
  const user = useAuthStore((s) => s.user);
  const { isImpersonating, clientId: impId } = useImpersonateStore();
  const clientId = isImpersonating ? impId : user?.clientId;
  const [client, setClient] = useState<Client | null>(null);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    getClient(clientId).then((d) => { setClient(d); setLoading(false); });
    const u1 = subscribeAutomations(clientId, setAutomations);
    const u2 = subscribeConversations(clientId, setConversations);
    return () => { u1(); u2(); };
  }, [clientId]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!client) return <div className="p-8 text-center text-muted-foreground">Client not found</div>;

  const openConvos = conversations.filter((c) => c.status === 'open').length;
  const usage = client.messageQuota ? (client.messagesUsedThisMonth / client.messageQuota) * 100 : 0;
  const usageColor = usage > 90 ? 'text-destructive' : usage > 75 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400';

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome back, ${client.businessName} 👋`}
        description="Here's what's happening with your WhatsApp automation today."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard label="Messages Sent"       value={client.messagesUsedThisMonth || 0}  icon={MessageSquare}  colorScheme="green"  />
        <StatsCard label="Open Conversations"  value={openConvos}                          icon={MessagesSquare} colorScheme="blue"   />
        <StatsCard label="Carts Recovered"     value="12" subtext="this week"              icon={ShoppingCart}   colorScheme="purple" />
        <StatsCard label="Delivery Rate"       value="96.5%" trend="positive" subtext="+2.1%" icon={TrendingUp} colorScheme="amber"  />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Automations */}
        <Card className="border-border/60">
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Zap className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">Automations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/60">
              {automations.map((a) => (
                <div key={a.id} className="flex items-center justify-between px-6 py-3 hover:bg-accent/40 transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.trigger} — {a.sentCount} sent</p>
                  </div>
                  <Switch
                    checked={a.isActive}
                    onCheckedChange={(c) => { toggleAutomation(a.id, c); toast.success(c ? 'Enabled' : 'Disabled'); }}
                  />
                </div>
              ))}
              {automations.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No automations yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Usage & Health */}
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">Usage & Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Message quota */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Message Quota</span>
                <span className={cn('font-semibold tabular-nums', usageColor)}>
                  {(client.messagesUsedThisMonth || 0).toLocaleString()} / {(client.messageQuota || 0).toLocaleString()}
                </span>
              </div>
              <Progress
                value={usage}
                className={cn(
                  'h-2',
                  usage > 90 ? '[&>div]:bg-destructive' : usage > 75 ? '[&>div]:bg-amber-500' : '[&>div]:bg-primary'
                )}
              />
              <p className="text-xs text-muted-foreground">{Math.round(usage)}% used this billing period</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Integration</span>
                <StatusBadge status={client.storeConnected ? 'active' : 'setup'} />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm text-muted-foreground">Current Plan</span>
                <StatusBadge status={client.plan} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

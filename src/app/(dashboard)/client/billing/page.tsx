'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useImpersonateStore } from '@/store/impersonateStore';
import { getClient, updateClient } from '@/lib/firestore';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreditCard, Receipt, TrendingUp, MessageSquare } from 'lucide-react';
import type { Client, ClientPlan } from '@/types';
import toast from 'react-hot-toast';

const plans: { name: ClientPlan; price: number; quota: number; features: string[] }[] = [
  { name: 'starter', price: 49, quota: 1000, features: ['1,000 messages/mo', 'Basic automations', 'Email support'] },
  { name: 'pro', price: 149, quota: 10000, features: ['10,000 messages/mo', 'Advanced automations', 'Priority support', 'Campaigns'] },
  { name: 'enterprise', price: 499, quota: 100000, features: ['100,000 messages/mo', 'Unlimited automations', 'Dedicated support', 'Custom integrations'] },
];

export default function BillingPage() {
  const user = useAuthStore((s) => s.user);
  const { isImpersonating, clientId: impersonatedClientId } = useImpersonateStore();
  const clientId = isImpersonating ? impersonatedClientId : user?.clientId;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    getClient(clientId).then((c) => { setClient(c); setLoading(false); });
  }, [clientId]);

  const handleUpgrade = async (plan: ClientPlan) => {
    if (!clientId) return;
    const p = plans.find((pl) => pl.name === plan);
    if (!p) return;
    try {
      await updateClient(clientId, { plan, planPrice: p.price, messageQuota: p.quota });
      setClient((c) => c ? { ...c, plan, planPrice: p.price, messageQuota: p.quota } : c);
      setUpgradeOpen(false);
      toast.success(`Plan upgraded to ${plan}`);
    } catch { toast.error('Failed to upgrade plan'); }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!client) return <div className="p-8 text-center text-muted-foreground">Client not found.</div>;

  const usagePercent = client.messageQuota > 0 ? Math.round((client.messagesUsedThisMonth / client.messageQuota) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Billing & Plan" description="Manage your subscription and view usage" />

      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard label="Current Plan" value={client.plan.charAt(0).toUpperCase() + client.plan.slice(1)} icon={CreditCard} />
        <StatsCard label="Monthly Cost" value={`$${client.planPrice}`} icon={Receipt} />
        <StatsCard label="Messages Used" value={`${client.messagesUsedThisMonth.toLocaleString()} / ${client.messageQuota.toLocaleString()}`} icon={MessageSquare} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Usage</CardTitle>
          <CardDescription>Current billing period usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{client.messagesUsedThisMonth.toLocaleString()} messages used</span>
              <span>{usagePercent}%</span>
            </div>
            <Progress value={usagePercent} className="h-3" />
            <p className="text-xs text-muted-foreground">{(client.messageQuota - client.messagesUsedThisMonth).toLocaleString()} messages remaining</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>Your current plan and available upgrades</CardDescription>
            </div>
            <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
              <DialogTrigger>
                <Button><TrendingUp className="mr-2 h-4 w-4" /> Change Plan</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Choose a Plan</DialogTitle>
                  <DialogDescription>Select the plan that best fits your needs</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 md:grid-cols-3 py-4">
                  {plans.map((p) => (
                    <div key={p.name} className={`rounded-lg border p-4 space-y-3 ${client.plan === p.name ? 'border-emerald-600 bg-emerald-50' : ''}`}>
                      <div>
                        <h3 className="font-semibold capitalize">{p.name}</h3>
                        <p className="text-2xl font-bold">${p.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {p.features.map((f) => <li key={f}>• {f}</li>)}
                      </ul>
                      <Button variant={client.plan === p.name ? 'outline' : 'default'} className="w-full" disabled={client.plan === p.name} onClick={() => handleUpgrade(p.name)}>
                        {client.plan === p.name ? 'Current Plan' : 'Select'}
                      </Button>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="capitalize text-base px-3 py-1">{client.plan}</Badge>
            <span className="text-muted-foreground">— ${client.planPrice}/month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>Recent invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">Invoice history will appear here once billing is active.</div>
        </CardContent>
      </Card>
    </div>
  );
}

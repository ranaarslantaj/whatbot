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
import { cn } from '@/lib/utils';

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
              <DialogTrigger 
                render={
                  <Button size="sm" className="h-9 px-4 rounded-xl shadow-apple-sm font-bold uppercase tracking-widest text-[11px] bg-primary hover:bg-primary/90 transition-all">
                    <TrendingUp className="mr-2 h-3.5 w-3.5" /> Change Plan
                  </Button>
                }
              />
              <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-apple-lg rounded-[2rem] bg-background/80 backdrop-blur-2xl">
                <div className="relative h-32 bg-primary/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-50" />
                  <div className="relative text-center space-y-1">
                    <DialogTitle className="text-[20px] font-black tracking-tight text-foreground uppercase">Elevate Your Strategy</DialogTitle>
                    <DialogDescription className="text-[12px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Select the engine that powers your growth</DialogDescription>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3 p-8">
                  {plans.map((p) => {
                    const isCurrent = client.plan === p.name;
                    const isPro = p.name === 'pro';
                    
                    return (
                      <div 
                        key={p.name} 
                        className={cn(
                          "relative group rounded-3xl border border-border/40 p-6 flex flex-col items-center text-center transition-all duration-500 hover:shadow-apple-lg hover:-translate-y-1",
                          isCurrent ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20" : "bg-card/50",
                          isPro && !isCurrent && "border-primary/20 shadow-apple-sm"
                        )}
                      >
                        {isPro && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-apple-sm">
                            Most Popular
                          </div>
                        )}
                        
                        <div className="mb-6 space-y-1">
                          <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{p.name}</h3>
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-[32px] font-black tracking-tighter text-foreground">${p.price}</span>
                            <span className="text-[12px] font-bold text-muted-foreground uppercase opacity-50">/mo</span>
                          </div>
                        </div>

                        <div className="flex-1 w-full space-y-4 mb-8">
                          {p.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-3 text-left">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <TrendingUp className="h-2.5 w-2.5 text-primary" />
                              </div>
                              <span className="text-[13px] font-medium text-muted-foreground/80 leading-tight">
                                {f}
                              </span>
                            </div>
                          ))}
                        </div>

                        <Button 
                          variant={isCurrent ? 'outline' : isPro ? 'default' : 'secondary'} 
                          className={cn(
                             "w-full h-11 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                             !isCurrent && "group-hover:scale-[1.02]"
                          )}
                          disabled={isCurrent} 
                          onClick={() => handleUpgrade(p.name)}
                        >
                          {isCurrent ? 'Active Plan' : 'Scale Now'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
                
                <div className="px-8 py-4 bg-muted/20 border-t border-border/10">
                   <p className="text-[11px] text-center font-bold text-muted-foreground/40 uppercase tracking-widest">
                     Payments secured by Stripe. No hidden fees. Cancel anytime.
                   </p>
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

'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getClient, subscribeTemplates, approveTemplate, rejectTemplate, subscribeAutomations } from '@/lib/firestore';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import type { Client, Template, Automation } from '@/types';
import toast from 'react-hot-toast';
import { Copy, Check, X } from 'lucide-react';

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;
  const [client, setClient] = useState<Client | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClient(clientId).then((d) => { setClient(d); setLoading(false); });
    const unsubT = subscribeTemplates((d) => setTemplates(d), clientId);
    const unsubA = subscribeAutomations(clientId, (d) => setAutomations(d));
    return () => { unsubT(); unsubA(); };
  }, [clientId]);

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!client) return <div className="p-8 text-center">Client not found</div>;
  const usagePercent = client.messageQuota ? (client.messagesUsedThisMonth / client.messageQuota) * 100 : 0;
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success('Copied!'); };

  return (
    <div className="space-y-6">
      <PageHeader title={client.businessName} description={`${client.ownerName} — ${client.ownerEmail}`} action={<StatusBadge status={client.status} />} />
      <Tabs defaultValue="overview">
        <TabsList><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="integration">Integration</TabsTrigger><TabsTrigger value="templates">Templates ({templates.length})</TabsTrigger><TabsTrigger value="billing">Billing</TabsTrigger></TabsList>
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card><CardHeader><CardTitle className="text-base">Business Details</CardTitle></CardHeader><CardContent className="space-y-3">
              <div><Label className="text-muted-foreground">Business Name</Label><p className="font-medium">{client.businessName}</p></div>
              <div><Label className="text-muted-foreground">Owner</Label><p className="font-medium">{client.ownerName} ({client.ownerEmail})</p></div>
              <div><Label className="text-muted-foreground">WhatsApp</Label><p className="font-medium">{client.whatsappNumber || 'Not configured'}</p></div>
              <div><Label className="text-muted-foreground">Plan</Label><StatusBadge status={client.plan} /></div>
            </CardContent></Card>
            <Card><CardHeader><CardTitle className="text-base">Usage</CardTitle></CardHeader><CardContent className="space-y-3">
              <div><div className="flex justify-between text-sm mb-1"><span>Messages Used</span><span>{(client.messagesUsedThisMonth||0).toLocaleString()} / {(client.messageQuota||0).toLocaleString()}</span></div>
              <Progress value={usagePercent} className={usagePercent > 90 ? '[&>div]:bg-red-500' : usagePercent > 75 ? '[&>div]:bg-yellow-500' : ''} /></div>
              <div><Label className="text-muted-foreground">Store</Label><p className="font-medium">{client.storeType ? `${client.storeType} — ${client.storeConnected ? 'Connected' : 'Disconnected'}` : 'Not configured'}</p></div>
              <div><Label className="text-muted-foreground">Automations</Label><p className="font-medium">{automations.length} configured</p></div>
            </CardContent></Card>
          </div>
        </TabsContent>
        <TabsContent value="integration" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-base">API Key</CardTitle></CardHeader><CardContent>
            <div className="flex items-center gap-2"><Input value={client.apiKey} readOnly className="font-mono text-sm" /><Button variant="outline" size="icon" onClick={() => copy(client.apiKey)}><Copy className="h-4 w-4" /></Button></div>
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Webhook URL</CardTitle></CardHeader><CardContent>
            <div className="flex items-center gap-2"><Input value={`/api/webhooks/${client.id}`} readOnly className="font-mono text-sm" /><Button variant="outline" size="icon" onClick={() => copy(`/api/webhooks/${client.id}`)}><Copy className="h-4 w-4" /></Button></div>
          </CardContent></Card>
        </TabsContent>
        <TabsContent value="templates" className="space-y-4 mt-4">
          {templates.map((t) => (
            <Card key={t.id}><CardContent className="p-4">
              <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><code className="text-sm font-semibold">{t.name}</code><StatusBadge status={t.status} /><StatusBadge status={t.category} /></div>
                {t.status === 'pending_review' && <div className="flex gap-2"><Button size="sm" variant="outline" onClick={async () => { await approveTemplate(t.id); toast.success('Approved'); }}><Check className="mr-1 h-3 w-3" /> Approve</Button><Button size="sm" variant="outline" className="text-red-600" onClick={async () => { await rejectTemplate(t.id, 'Needs revision'); toast.success('Rejected'); }}><X className="mr-1 h-3 w-3" /> Reject</Button></div>}
              </div><div className="rounded bg-zinc-50 p-3 font-mono text-sm whitespace-pre-wrap">{t.bodyText}</div>
            </CardContent></Card>
          ))}
          {templates.length === 0 && <p className="text-center text-muted-foreground py-8">No templates</p>}
        </TabsContent>
        <TabsContent value="billing" className="space-y-4 mt-4">
          <Card><CardHeader><CardTitle className="text-base">Current Plan</CardTitle></CardHeader><CardContent className="space-y-2">
            <div className="flex items-center gap-3"><StatusBadge status={client.plan} /><span className="text-2xl font-bold">${client.planPrice}/mo</span></div>
            <div><div className="flex justify-between text-sm mb-1"><span>Message Usage</span><span className={usagePercent > 90 ? 'text-red-600 font-medium' : ''}>{Math.round(usagePercent)}%</span></div><Progress value={usagePercent} /></div>
          </CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

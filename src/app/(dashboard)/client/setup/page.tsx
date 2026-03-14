'use client';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthStore } from '@/store/authStore';
import { useImpersonateStore } from '@/store/impersonateStore';
import { getClient } from '@/lib/firestore';
import type { Client } from '@/types';
import toast from 'react-hot-toast';
import { Phone, ShoppingBag, Copy, Eye, EyeOff, RefreshCw, CheckCircle } from 'lucide-react';

export default function ClientSetupPage() {
  const user = useAuthStore((s) => s.user);
  const { isImpersonating, clientId: impId } = useImpersonateStore();
  const clientId = isImpersonating ? impId : user?.clientId;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [showKey, setShowKey] = useState(false);
  const [regenDialog, setRegenDialog] = useState(false);

  useEffect(() => { if (!clientId) return; getClient(clientId).then((d) => { setClient(d); setLoading(false); }); }, [clientId]);
  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!client) return <div className="p-8 text-center">Client not found</div>;
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success('Copied!'); };

  return (
    <div className="space-y-6">
      <PageHeader title="Setup & Integration" description="Connect your store and configure WhatsApp" />
      <Card><CardHeader><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">1</div><div><CardTitle className="text-base">WhatsApp Business Number</CardTitle><CardDescription>Your verified number</CardDescription></div></div></CardHeader><CardContent className="space-y-3">
        <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-muted-foreground" /><span className="font-mono font-medium">{client.whatsappNumber || 'Not configured'}</span>{client.whatsappNumber && <StatusBadge status="active" />}</div>
        <p className="text-xs text-muted-foreground">Contact support to change your number.</p>
      </CardContent></Card>
      <Card><CardHeader><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">2</div><div><CardTitle className="text-base">Connect Your Store</CardTitle><CardDescription>Link your e-commerce platform</CardDescription></div></div></CardHeader><CardContent>
        {client.storeConnected ? <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50"><CheckCircle className="h-5 w-5 text-emerald-600" /><div><p className="font-medium text-sm capitalize">{client.storeType} Connected</p><p className="text-xs text-muted-foreground">{client.storeUrl}</p></div></div> : (
          <Tabs defaultValue="shopify"><TabsList><TabsTrigger value="shopify">Shopify</TabsTrigger><TabsTrigger value="woocommerce">WooCommerce</TabsTrigger><TabsTrigger value="custom">Custom</TabsTrigger></TabsList>
            <TabsContent value="shopify" className="space-y-3 mt-4"><div className="space-y-2"><Label>Store URL</Label><Input placeholder="your-store.myshopify.com" /></div><Button><ShoppingBag className="mr-2 h-4 w-4" /> Connect Shopify</Button></TabsContent>
            <TabsContent value="woocommerce" className="space-y-3 mt-4"><div className="space-y-2"><Label>Store URL</Label><Input placeholder="https://your-store.com" /></div><div className="space-y-2"><Label>Consumer Key</Label><Input placeholder="ck_..." /></div><div className="space-y-2"><Label>Consumer Secret</Label><Input type="password" placeholder="cs_..." /></div><Button>Connect WooCommerce</Button></TabsContent>
            <TabsContent value="custom" className="space-y-3 mt-4"><p className="text-sm text-muted-foreground">Send events via API:</p><div className="space-y-2"><Label>Webhook Endpoint</Label><div className="flex gap-2"><Input value={`/api/webhooks/${client.id}`} readOnly className="font-mono text-sm" /><Button variant="outline" size="icon" onClick={() => copy(`/api/webhooks/${client.id}`)}><Copy className="h-4 w-4" /></Button></div></div></TabsContent>
          </Tabs>)}
      </CardContent></Card>
      <Card><CardHeader><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm">3</div><div><CardTitle className="text-base">Your API Key</CardTitle><CardDescription>Authenticate API requests</CardDescription></div></div></CardHeader><CardContent className="space-y-3">
        <div className="flex gap-2"><Input value={showKey ? client.apiKey : '••••••••-••••-••••-••••-••••••••••••'} readOnly className="font-mono" /><Button variant="outline" size="icon" onClick={() => setShowKey(!showKey)}>{showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button variant="outline" size="icon" onClick={() => copy(client.apiKey)}><Copy className="h-4 w-4" /></Button><Button variant="outline" size="icon" onClick={() => setRegenDialog(true)}><RefreshCw className="h-4 w-4" /></Button></div>
      </CardContent></Card>
      <ConfirmDialog open={regenDialog} onOpenChange={setRegenDialog} title="Regenerate API Key" description="This will invalidate your current key." confirmLabel="Regenerate" variant="destructive" onConfirm={() => { toast.success('Regenerated'); setRegenDialog(false); }} />
    </div>
  );
}

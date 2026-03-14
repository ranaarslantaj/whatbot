'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import toast from 'react-hot-toast';
import { Copy, Eye, EyeOff, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [showToken, setShowToken] = useState(false);
  const [resetDialog, setResetDialog] = useState(false);
  const [settings, setSettings] = useState({ autoApprove: false, require2FA: true, billingAlerts: true, maintenance: false });
  const toggle = (k: keyof typeof settings) => { setSettings((s) => ({ ...s, [k]: !s[k] })); toast.success('Updated'); };

  return (
    <div className="space-y-6">
      <PageHeader title="Platform Settings" description="Configure global settings" />
      <Card><CardHeader><CardTitle className="text-base">WhatsApp API Configuration</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><Label>WABA ID</Label><Input value="••••••••••1234" readOnly className="font-mono" /></div>
        <div className="space-y-2"><Label>API Token</Label><div className="flex gap-2"><Input value={showToken ? 'EAABg...xyz123' : '••••••••••••••'} readOnly className="font-mono" /><Button variant="outline" size="icon" onClick={() => setShowToken(!showToken)}>{showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button><Button variant="outline" size="icon"><RefreshCw className="h-4 w-4" /></Button></div></div>
        <div className="space-y-2"><Label>Webhook URL</Label><div className="flex gap-2"><Input value="https://platform.example.com/api/webhooks" readOnly className="font-mono" /><Button variant="outline" size="icon" onClick={() => { navigator.clipboard.writeText('https://platform.example.com/api/webhooks'); toast.success('Copied!'); }}><Copy className="h-4 w-4" /></Button></div></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Global Toggles</CardTitle></CardHeader><CardContent className="space-y-4">
        {([['autoApprove','Auto-approve verified templates','Auto approve from verified clients'] as const, ['require2FA','Require 2FA for agents','Enforce 2FA for support agents'] as const, ['billingAlerts','Billing alerts via email','Email at 80% quota'] as const, ['maintenance','Maintenance mode','Show maintenance page'] as const]).map(([k,l,d]) => (
          <div key={k} className="flex items-center justify-between"><div><p className="text-sm font-medium">{l}</p><p className="text-xs text-muted-foreground">{d}</p></div><Switch checked={settings[k]} onCheckedChange={() => toggle(k)} /></div>
        ))}
      </CardContent></Card>
      <Card className="border-red-200"><CardHeader><CardTitle className="text-base text-red-600 flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Danger Zone</CardTitle></CardHeader><CardContent className="space-y-3">
        <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Reset all webhooks</p><p className="text-xs text-muted-foreground">Re-register all client webhooks</p></div><Button variant="outline" className="text-red-600 border-red-200" onClick={() => setResetDialog(true)}>Reset</Button></div>
        <Separator />
        <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Export all data</p><p className="text-xs text-muted-foreground">Download complete platform data</p></div><Button variant="outline">Export</Button></div>
      </CardContent></Card>
      <ConfirmDialog open={resetDialog} onOpenChange={setResetDialog} title="Reset All Webhooks" description="This will re-register all webhooks. Messages may be delayed." confirmLabel="Reset" variant="destructive" onConfirm={() => { toast.success('Webhooks reset'); setResetDialog(false); }} />
    </div>
  );
}

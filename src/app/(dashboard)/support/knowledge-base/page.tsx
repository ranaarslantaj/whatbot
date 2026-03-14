'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Plug, ShoppingCart, FileCheck, AlertCircle, CreditCard } from 'lucide-react';

const sections = [
  { title: 'Shopify Integration Guide', icon: ShoppingCart, content: '1. Navigate to Setup & Integration page\n2. Click "Connect Shopify"\n3. Enter store URL\n4. Complete OAuth flow\n5. Verify connection status\n\nCommon issues:\n- Store URL must include .myshopify.com\n- Client needs admin access\n- Webhooks require paid Shopify plan' },
  { title: 'WooCommerce Integration', icon: Plug, content: '1. Generate API keys in WooCommerce > Settings > REST API\n2. Enter Store URL, Consumer Key, Secret\n3. Click Connect\n4. Configure webhooks for order events' },
  { title: 'Meta Template Guidelines', icon: FileCheck, content: 'Categories: Transactional, Marketing, OTP\n\nBest practices:\n- Under 1024 characters\n- Use {{1}}, {{2}} variables\n- No ALL CAPS\n- Marketing needs opt-in\n- Review: 24-48 hours' },
  { title: 'Error Codes & Fixes', icon: AlertCircle, content: '131047: Re-engagement blocked → Use approved template\n131051: Unsupported type → Check media formats\n368: Temporarily blocked → Rate limit\n130429: Rate limit → Exponential backoff\n133010: Not registered → Verify number' },
  { title: 'Billing FAQ', icon: CreditCard, content: 'Starter: $49/mo, 1K messages\nPro: $149/mo, 10K messages\nEnterprise: $499/mo, 100K messages\n\nOverage: $0.05/message\nUpgrades: Prorated\nDowngrades: Next cycle\nCancellation: 30-day notice' },
];

export default function KnowledgeBasePage() {
  const [expanded, setExpanded] = useState<string | null>(sections[0].title);
  return (
    <div className="space-y-6">
      <PageHeader title="Knowledge Base" description="Guides and reference documentation" />
      <div className="space-y-3">{sections.map((s) => {
        const open = expanded === s.title;
        return (<Card key={s.title}><CardHeader className="cursor-pointer hover:bg-zinc-50" onClick={() => setExpanded(open ? null : s.title)}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><s.icon className="h-5 w-5 text-muted-foreground" /><CardTitle className="text-base">{s.title}</CardTitle></div>{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</div></CardHeader>{open && <CardContent><pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans leading-relaxed">{s.content}</pre></CardContent>}</Card>);
      })}</div>
    </div>
  );
}

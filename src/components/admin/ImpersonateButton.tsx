'use client';

import { useRouter } from 'next/navigation';
import { useImpersonateStore } from '@/store/impersonateStore';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

export function ImpersonateButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter();
  const { startImpersonation } = useImpersonateStore();

  return (
    <Button variant="ghost" size="sm" onClick={() => { startImpersonation(clientId, clientName); router.push('/client'); }}>
      <Eye className="mr-1 h-3 w-3" /> Impersonate
    </Button>
  );
}

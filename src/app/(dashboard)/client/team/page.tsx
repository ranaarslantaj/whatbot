'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useImpersonateStore } from '@/store/impersonateStore';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import type { User } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';

export default function TeamPage() {
  const user = useAuthStore((s) => s.user);
  const { isImpersonating, clientId: impersonatedClientId } = useImpersonateStore();
  const clientId = isImpersonating ? impersonatedClientId : user?.clientId;
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'client_owner' | 'client_agent'>('client_agent');

  useEffect(() => {
    if (!clientId) return;
    const q = query(collection(db, 'users'), where('clientId', '==', clientId));
    const unsub = onSnapshot(q, (snapshot) => {
      setMembers(snapshot.docs.map((d) => ({ ...d.data(), uid: d.id } as User)));
      setLoading(false);
    });
    return unsub;
  }, [clientId]);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !inviteName.trim()) { toast.error('Please fill all fields'); return; }
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, name: inviteName, role: inviteRole, clientId }),
      });
      if (!res.ok) throw new Error();
      setInviteOpen(false);
      setInviteEmail('');
      setInviteName('');
      toast.success('Invitation sent');
    } catch {
      toast.error('Failed to send invite');
    }
  };

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role', cell: ({ row }) => <span className="capitalize">{row.original.role.replace('_', ' ')}</span> },
    { accessorKey: 'isActive', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'suspended'} /> },
  ];

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader title="My Team" description="Manage team members and invitations" action={
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger>
            <Button><UserPlus className="mr-2 h-4 w-4" /> Invite Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>Send an invitation to join your team</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input placeholder="Full name" value={inviteName} onChange={(e) => setInviteName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="email@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole((v as string) as 'client_owner' | 'client_agent')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client_agent">Agent</SelectItem>
                    <SelectItem value="client_owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button onClick={handleInvite}>Send Invite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      } />

      <DataTable columns={columns} data={members} searchable searchPlaceholder="Search members..." />
    </div>
  );
}

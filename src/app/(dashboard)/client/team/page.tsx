'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { useImpersonateStore } from '@/store/impersonateStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { subscribeTeamMembers, updateUser, deleteUser, createUserDoc } from '@/lib/firestore';
import { createUserWithoutSignIn } from '@/lib/firebase';
import { UserPlus, Loader2, MoreHorizontal, Pencil, Trash2, ShieldCheck, ShieldOff } from 'lucide-react';
import type { User } from '@/types';
import type { ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';

const createSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type CreateForm = z.infer<typeof createSchema>;

const editSchema = z.object({
  name: z.string().min(2, 'Name is required'),
});
type EditForm = z.infer<typeof editSchema>;

export default function TeamPage() {
  const user = useAuthStore((s) => s.user);
  const { isImpersonating, clientId: impersonatedClientId } = useImpersonateStore();
  const clientId = isImpersonating ? impersonatedClientId : user?.clientId;

  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newRole, setNewRole] = useState<'client_owner' | 'client_agent'>('client_agent');
  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<User | null>(null);
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    const unsub = subscribeTeamMembers(clientId, (d) => { setMembers(d); setLoading(false); });
    return unsub;
  }, [clientId]);

  // ── Create Member ──
  const onAdd = async (data: CreateForm) => {
    if (!clientId) return;
    setSubmitting(true);
    try {
      const uid = await createUserWithoutSignIn(data.email, data.password);
      await createUserDoc(uid, {
        email: data.email,
        name: data.name,
        role: newRole,
        clientId,
        assignedClientIds: [],
        isActive: true,
        avatarUrl: null,
        createdAt: null as never,
        lastLoginAt: null as never,
      });
      toast.success('Team member added');
      setAddOpen(false);
      createForm.reset();
      setNewRole('client_agent');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to add member';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit Member ──
  const openEdit = (member: User) => {
    setEditingMember(member);
    editForm.reset({ name: member.name });
    setEditOpen(true);
  };

  const onEdit = async (data: EditForm) => {
    if (!editingMember) return;
    setSubmitting(true);
    try {
      await updateUser(editingMember.uid, { name: data.name });
      toast.success('Member updated');
      setEditOpen(false);
    } catch {
      toast.error('Failed to update member');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle Status ──
  const toggleStatus = async (member: User) => {
    try {
      await updateUser(member.uid, { isActive: !member.isActive });
      toast.success(member.isActive ? 'Member deactivated' : 'Member activated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ── Delete Member ──
  const confirmDelete = (member: User) => {
    setDeletingMember(member);
    setDeleteOpen(true);
  };

  const onDelete = async () => {
    if (!deletingMember) return;
    setDeleting(true);
    try {
      await deleteUser(deletingMember.uid);
      toast.success('Member removed');
      setDeleteOpen(false);
    } catch {
      toast.error('Failed to delete member');
    } finally {
      setDeleting(false);
    }
  };

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }) => <span className="capitalize">{row.original.role.replace('_', ' ')}</span>,
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'suspended'} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const member = row.original;
        if (member.uid === user?.uid) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEdit(member)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleStatus(member)}>
                {member.isActive ? (
                  <><ShieldOff className="mr-2 h-4 w-4" /> Deactivate</>
                ) : (
                  <><ShieldCheck className="mr-2 h-4 w-4" /> Activate</>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(member)}>
                <Trash2 className="mr-2 h-4 w-4" /> Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Team"
        description="Create and manage team members"
        action={
          <Button onClick={() => { createForm.reset(); setNewRole('client_agent'); setAddOpen(true); }}>
            <UserPlus className="mr-2 h-4 w-4" /> Add Member
          </Button>
        }
      />

      <DataTable columns={columns} data={members} searchable searchPlaceholder="Search members..." />

      {/* ── Create Member Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <form onSubmit={createForm.handleSubmit(onAdd)} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="John Doe" {...createForm.register('name')} />
              {createForm.formState.errors.name && <p className="text-xs text-red-500">{createForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="member@company.com" {...createForm.register('email')} />
              {createForm.formState.errors.email && <p className="text-xs text-red-500">{createForm.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" {...createForm.register('password')} />
              {createForm.formState.errors.password && <p className="text-xs text-red-500">{createForm.formState.errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newRole} onValueChange={(v) => setNewRole((v as string) as 'client_owner' | 'client_agent')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="client_agent">Agent</SelectItem>
                  <SelectItem value="client_owner">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Member
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Member Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Member</DialogTitle></DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input {...editForm.register('name')} />
              {editForm.formState.errors.name && <p className="text-xs text-red-500">{editForm.formState.errors.name.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Remove Member"
        description={`Are you sure you want to remove ${deletingMember?.name}? This action cannot be undone.`}
        confirmLabel="Remove"
        variant="destructive"
        onConfirm={onDelete}
        loading={deleting}
      />
    </div>
  );
}

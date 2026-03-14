'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { type ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { subscribeAgents, subscribeClients, updateUser, deleteUser, createUserDoc, updateAgentAssignments } from '@/lib/firestore';
import { createUserWithoutSignIn } from '@/lib/firebase';
import type { User, Client } from '@/types';
import toast from 'react-hot-toast';
import { Plus, Loader2, MoreHorizontal, Pencil, Trash2, ShieldCheck, ShieldOff, Users } from 'lucide-react';

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

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const createForm = useForm<CreateForm>({ resolver: zodResolver(createSchema) });

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<User | null>(null);
  const editForm = useForm<EditForm>({ resolver: zodResolver(editSchema) });

  // Delete confirm
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingAgent, setDeletingAgent] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Assign clients dialog
  const [assignOpen, setAssignOpen] = useState(false);
  const [assigningAgent, setAssigningAgent] = useState<User | null>(null);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const u1 = subscribeAgents((d) => { setAgents(d); setLoading(false); });
    const u2 = subscribeClients((d) => setClients(d));
    return () => { u1(); u2(); };
  }, []);

  // ── Create Agent ──
  const onAdd = async (data: CreateForm) => {
    setSubmitting(true);
    try {
      const uid = await createUserWithoutSignIn(data.email, data.password);
      await createUserDoc(uid, {
        email: data.email,
        name: data.name,
        role: 'support_agent',
        clientId: null,
        assignedClientIds: [],
        isActive: true,
        avatarUrl: null,
        createdAt: null as never,
        lastLoginAt: null as never,
      });
      toast.success('Agent created successfully');
      setAddOpen(false);
      createForm.reset();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create agent';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit Agent ──
  const openEdit = (agent: User) => {
    setEditingAgent(agent);
    editForm.reset({ name: agent.name });
    setEditOpen(true);
  };

  const onEdit = async (data: EditForm) => {
    if (!editingAgent) return;
    setSubmitting(true);
    try {
      await updateUser(editingAgent.uid, { name: data.name });
      toast.success('Agent updated');
      setEditOpen(false);
    } catch {
      toast.error('Failed to update agent');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Toggle Status ──
  const toggleStatus = async (agent: User) => {
    try {
      await updateUser(agent.uid, { isActive: !agent.isActive });
      toast.success(agent.isActive ? 'Agent deactivated' : 'Agent activated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  // ── Delete Agent ──
  const confirmDelete = (agent: User) => {
    setDeletingAgent(agent);
    setDeleteOpen(true);
  };

  const onDelete = async () => {
    if (!deletingAgent) return;
    setDeleting(true);
    try {
      await deleteUser(deletingAgent.uid);
      toast.success('Agent removed');
      setDeleteOpen(false);
    } catch {
      toast.error('Failed to delete agent');
    } finally {
      setDeleting(false);
    }
  };

  // ── Assign Clients ──
  const openAssign = (agent: User) => {
    setAssigningAgent(agent);
    setSelectedClientIds(agent.assignedClientIds || []);
    setAssignOpen(true);
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClientIds((prev) =>
      prev.includes(clientId) ? prev.filter((id) => id !== clientId) : [...prev, clientId]
    );
  };

  const onAssign = async () => {
    if (!assigningAgent) return;
    setAssigning(true);
    try {
      await updateAgentAssignments(assigningAgent.uid, selectedClientIds);
      toast.success('Client assignments updated');
      setAssignOpen(false);
    } catch {
      toast.error('Failed to update assignments');
    } finally {
      setAssigning(false);
    }
  };

  const columns: ColumnDef<User>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    {
      id: 'clients',
      header: 'Assigned Clients',
      cell: ({ row }) => {
        const count = row.original.assignedClientIds?.length || 0;
        return <span className="text-sm text-muted-foreground">{count} client{count !== 1 ? 's' : ''}</span>;
      },
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.isActive ? 'active' : 'suspended'} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const agent = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-zinc-100">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEdit(agent)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openAssign(agent)}>
                <Users className="mr-2 h-4 w-4" /> Assign Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleStatus(agent)}>
                {agent.isActive ? (
                  <><ShieldOff className="mr-2 h-4 w-4" /> Deactivate</>
                ) : (
                  <><ShieldCheck className="mr-2 h-4 w-4" /> Activate</>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(agent)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Agents"
        description="Create and manage support team members"
        action={
          <Button onClick={() => { createForm.reset(); setAddOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Agent
          </Button>
        }
      />

      <DataTable columns={columns} data={agents} searchable searchPlaceholder="Search agents..." loading={loading} />

      {/* ── Create Agent Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Support Agent</DialogTitle></DialogHeader>
          <form onSubmit={createForm.handleSubmit(onAdd)} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input placeholder="John Doe" {...createForm.register('name')} />
              {createForm.formState.errors.name && <p className="text-xs text-red-500">{createForm.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" placeholder="agent@whatbot.com" {...createForm.register('email')} />
              {createForm.formState.errors.email && <p className="text-xs text-red-500">{createForm.formState.errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" {...createForm.register('password')} />
              {createForm.formState.errors.password && <p className="text-xs text-red-500">{createForm.formState.errors.password.message}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Agent
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Agent Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Agent</DialogTitle></DialogHeader>
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

      {/* ── Assign Clients Dialog ── */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Assign Clients to {assigningAgent?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            {clients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clients found</p>
            ) : (
              clients.map((client) => (
                <label
                  key={client.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-zinc-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-zinc-300"
                    checked={selectedClientIds.includes(client.id)}
                    onChange={() => toggleClientSelection(client.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{client.businessName}</p>
                    <p className="text-xs text-muted-foreground">{client.ownerEmail}</p>
                  </div>
                  <StatusBadge status={client.status} />
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
            <Button onClick={onAssign} disabled={assigning}>
              {assigning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save ({selectedClientIds.length} selected)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Agent"
        description={`Are you sure you want to delete ${deletingAgent?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={onDelete}
        loading={deleting}
      />
    </div>
  );
}

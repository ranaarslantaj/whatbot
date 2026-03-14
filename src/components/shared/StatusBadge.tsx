import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  suspended: { label: 'Suspended', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  setup: { label: 'Setup', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  verifying: { label: 'Verifying', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  open: { label: 'Open', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  in_progress: { label: 'In Progress', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  resolved: { label: 'Resolved', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  closed: { label: 'Closed', className: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100' },
  waiting: { label: 'Waiting', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  pending_review: { label: 'Pending Review', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  pending_meta: { label: 'Sent to Meta', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  draft: { label: 'Draft', className: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  sending: { label: 'Sending', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  failed: { label: 'Failed', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  low: { label: 'Low', className: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100' },
  starter: { label: 'Starter', className: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100' },
  pro: { label: 'Pro', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  enterprise: { label: 'Enterprise', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
  transactional: { label: 'Transactional', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
  marketing: { label: 'Marketing', className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' },
  otp: { label: 'OTP', className: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100' },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-100' };
  return (
    <Badge variant="secondary" className={cn(config.className, 'font-medium', className)}>
      {config.label}
    </Badge>
  );
}

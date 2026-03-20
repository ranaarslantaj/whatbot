import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  // Client status
  active:         { label: 'Active',         className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15' },
  suspended:      { label: 'Suspended',      className: 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/15' },
  setup:          { label: 'Setup',          className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15' },
  verifying:      { label: 'Verifying',      className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15' },
  // Ticket status
  open:           { label: 'Open',           className: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 hover:bg-indigo-500/15' },
  in_progress:    { label: 'In Progress',    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15' },
  resolved:       { label: 'Resolved',       className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15' },
  closed:         { label: 'Closed',         className: 'bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted/60' },
  waiting:        { label: 'Waiting',        className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15' },
  // Template status
  approved:       { label: 'Approved',       className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15' },
  pending_review: { label: 'Pending Review', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15' },
  pending_meta:   { label: 'Sent to Meta',   className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15' },
  rejected:       { label: 'Rejected',       className: 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/15' },
  draft:          { label: 'Draft',          className: 'bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted/60' },
  // Campaign status
  scheduled:      { label: 'Scheduled',      className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15' },
  sending:        { label: 'Sending',        className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15' },
  completed:      { label: 'Completed',      className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15' },
  failed:         { label: 'Failed',         className: 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/15' },
  // Priority
  urgent:         { label: 'Urgent',         className: 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/15' },
  medium:         { label: 'Medium',         className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15' },
  low:            { label: 'Low',            className: 'bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted/60' },
  // Plan tiers
  starter:        { label: 'Starter',        className: 'bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted/60' },
  pro:            { label: 'Pro',            className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15 font-bold shadow-sm' },
  enterprise:     { label: 'Enterprise',     className: 'bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/15 font-bold shadow-sm' },
  // Billing
  paid:           { label: 'Paid',           className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15' },
  overdue:        { label: 'Overdue',        className: 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/15' },
  pending:        { label: 'Pending',        className: 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15' },
  // Template category
  transactional:  { label: 'Transactional',  className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/15' },
  marketing:      { label: 'Marketing',      className: 'bg-violet-500/10 text-violet-600 border-violet-500/20 hover:bg-violet-500/15' },
  otp:            { label: 'OTP',            className: 'bg-muted/50 text-muted-foreground border-border/40 hover:bg-muted/60' },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted/50 text-muted-foreground' };
  return (
    <Badge variant="outline" className={cn('px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-tight uppercase border', config.className, className)}>
      {config.label}
    </Badge>
  );
}

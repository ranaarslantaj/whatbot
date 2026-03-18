import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; className: string }> = {
  // Client status
  active:         { label: 'Active',         className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-950/60' },
  suspended:      { label: 'Suspended',      className: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-400 dark:hover:bg-red-950/60' },
  setup:          { label: 'Setup',          className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:hover:bg-amber-950/60' },
  verifying:      { label: 'Verifying',      className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-950/60' },
  // Ticket status
  open:           { label: 'Open',           className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-950/60' },
  in_progress:    { label: 'In Progress',    className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:hover:bg-amber-950/60' },
  resolved:       { label: 'Resolved',       className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-950/60' },
  closed:         { label: 'Closed',         className: 'bg-muted text-muted-foreground hover:bg-muted' },
  waiting:        { label: 'Waiting',        className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:hover:bg-amber-950/60' },
  // Template status
  approved:       { label: 'Approved',       className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-950/60' },
  pending_review: { label: 'Pending Review', className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:hover:bg-amber-950/60' },
  pending_meta:   { label: 'Sent to Meta',   className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-950/60' },
  rejected:       { label: 'Rejected',       className: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-400 dark:hover:bg-red-950/60' },
  draft:          { label: 'Draft',          className: 'bg-muted text-muted-foreground hover:bg-muted' },
  // Campaign status
  scheduled:      { label: 'Scheduled',      className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-950/60' },
  sending:        { label: 'Sending',        className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:hover:bg-amber-950/60' },
  completed:      { label: 'Completed',      className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-950/60' },
  failed:         { label: 'Failed',         className: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-400 dark:hover:bg-red-950/60' },
  // Priority
  urgent:         { label: 'Urgent',         className: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-400 dark:hover:bg-red-950/60' },
  medium:         { label: 'Medium',         className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:hover:bg-amber-950/60' },
  low:            { label: 'Low',            className: 'bg-muted text-muted-foreground hover:bg-muted' },
  // Plan tiers
  starter:        { label: 'Starter',        className: 'bg-muted text-muted-foreground hover:bg-muted' },
  pro:            { label: 'Pro',            className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-950/60' },
  enterprise:     { label: 'Enterprise',     className: 'bg-violet-100 text-violet-700 hover:bg-violet-100 dark:bg-violet-950/60 dark:text-violet-400 dark:hover:bg-violet-950/60' },
  // Billing
  paid:           { label: 'Paid',           className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-950/60' },
  overdue:        { label: 'Overdue',        className: 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950/60 dark:text-red-400 dark:hover:bg-red-950/60' },
  pending:        { label: 'Pending',        className: 'bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/60 dark:text-amber-400 dark:hover:bg-amber-950/60' },
  // Template category
  transactional:  { label: 'Transactional',  className: 'bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-950/60' },
  marketing:      { label: 'Marketing',      className: 'bg-violet-100 text-violet-700 hover:bg-violet-100 dark:bg-violet-950/60 dark:text-violet-400 dark:hover:bg-violet-950/60' },
  otp:            { label: 'OTP',            className: 'bg-muted text-muted-foreground hover:bg-muted' },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground hover:bg-muted' };
  return (
    <Badge variant="secondary" className={cn(config.className, 'font-medium text-xs capitalize', className)}>
      {config.label}
    </Badge>
  );
}

import { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/40">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="text-[13px] font-medium text-muted-foreground/70 tracking-tight">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-4 sm:mt-0 shrink-0 flex items-center gap-3">{action}</div>}
    </div>
  );
}

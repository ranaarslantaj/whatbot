'use client';

import { useState } from 'react';
import {
  useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel,
  getSortedRowModel, flexRender, type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchable?: boolean;
  searchPlaceholder?: string;
  loading?: boolean;
}

export function DataTable<TData, TValue>({ columns, data, searchable = false, searchPlaceholder = 'Search...', loading = false }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data, columns, getCoreRowModel: getCoreRowModel(), getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(), getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting, onGlobalFilterChange: setGlobalFilter, state: { sorting, globalFilter },
  });

  if (loading) {
    return (
      <div className="space-y-3">
        {searchable && <Skeleton className="h-10 w-64" />}
        <div className="rounded-md border">
          <Table>
            <TableHeader><TableRow>{columns.map((_, i) => <TableHead key={i}><Skeleton className="h-4 w-24" /></TableHead>)}</TableRow></TableHeader>
            <TableBody>{Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{columns.map((_, j) => <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>)}</TableRow>)}</TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {searchable && (
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder={searchPlaceholder} 
              value={globalFilter} 
              onChange={(e) => setGlobalFilter(e.target.value)} 
              className="pl-10 h-11 bg-accent/30 border-none rounded-2xl focus-visible:ring-primary/20 shadow-apple-sm" 
            />
          </div>
        )}
        
        {/* Pagination summary in a cleaner spot */}
        <p className="text-[13px] font-bold text-muted-foreground/40 tracking-tight uppercase">
          PAGE {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card shadow-apple-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id} className="hover:bg-transparent border-b border-border/20">
                  {hg.headers.map((h) => (
                    <TableHead key={h.id} className="h-14 text-[11px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground/60 px-6">
                      {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="group border-b border-border/10 last:border-0 hover:bg-accent/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 px-6 text-[13px] font-medium text-foreground/80 group-hover:text-foreground">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-48 text-center text-muted-foreground/50 font-medium">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 py-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => table.previousPage()} 
          disabled={!table.getCanPreviousPage()}
          className="h-10 w-10 rounded-xl border-border/40 hover:bg-accent/50 transition-all disabled:opacity-30 disabled:grayscale"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex gap-1.5">
           {/* Could add page numbers here for full Apple look */}
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => table.nextPage()} 
          disabled={!table.getCanNextPage()}
          className="h-10 w-10 rounded-xl border-border/40 hover:bg-accent/50 transition-all disabled:opacity-30 disabled:grayscale"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}

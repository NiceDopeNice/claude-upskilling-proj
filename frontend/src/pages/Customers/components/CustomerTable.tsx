import { ReactNode } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'
import { Customer } from '@/api/customerApi'

function highlight(text: string | null | undefined, term: string | undefined): ReactNode {
  if (!term || !text) return text ?? '—'
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  if (parts.length === 1) return text
  return parts.map((part, i) =>
    part.toLowerCase() === term.toLowerCase()
      ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm not-italic">{part}</mark>
      : part
  )
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <TableRow key={i}>
          {Array.from({ length: 8 }).map((_, j) => (
            <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

function buildPageButtons(current: number, last: number): (number | '...')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)
  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(last - 1, current + 1); i++) pages.push(i)
  if (current < last - 2) pages.push('...')
  pages.push(last)
  return pages
}

interface Meta { current_page: number; per_page: number; total: number; last_page: number }

interface Props {
  data: Customer[]
  meta: Meta | null
  loading: boolean
  selectedId: number | null
  onRowClick: (customer: Customer) => void
  onOrdersClick: (customer: Customer) => void
  page: number
  perPage: number
  onPageChange: (p: number) => void
  onPerPageChange: (pp: number) => void
  hasSearch: boolean
  isLastViewed: boolean
  mode: 'simple' | 'multi'
  searchTerm?: string
  searchFields?: string[]
  activeFilters?: Record<string, string>
}

export function CustomerTable({
  data, meta, loading, selectedId,
  onRowClick, onOrdersClick,
  page, perPage, onPageChange, onPerPageChange,
  hasSearch, isLastViewed, mode, searchTerm, searchFields, activeFilters,
}: Props) {
  const col = createColumnHelper<Customer>()

  function termFor(field: string): string | undefined {
    if (mode === 'simple') return searchFields?.includes(field) ? searchTerm : undefined
    return activeFilters?.[field]
  }

  const columns = [
    col.display({
      id: 'customer_no',
      header: 'Customer #',
      cell: ({ row }) => (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <Tooltip>
            <TooltipTrigger
              onClick={e => { e.stopPropagation(); onOrdersClick(row.original) }}
              className="inline-flex items-center justify-center rounded-md border border-border bg-background p-1.5 text-muted-foreground shadow-sm hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer"
            >
              <ShoppingBag className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent side="right">View orders</TooltipContent>
          </Tooltip>
          <span className="font-mono text-sm font-semibold tabular-nums">
            {highlight(String(row.original.customer_no), termFor('customer_no'))}
          </span>
        </div>
      ),
    }),
    col.display({
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-sm">
            {highlight(row.original.first_name, termFor('name'))}{' '}
            {highlight(row.original.last_name, termFor('name'))}
          </div>
          <div className="text-xs text-muted-foreground">
            {highlight(row.original.email, termFor('email'))}
          </div>
        </div>
      ),
    }),
    col.accessor('pers_nr', {
      header: 'SSN',
      cell: info => (
        <span className="text-sm font-mono text-muted-foreground">
          {highlight(info.getValue(), termFor('pers_nr'))}
        </span>
      ),
    }),
    col.accessor('tel', {
      header: 'Phone',
      cell: info => (
        <span className="text-sm">{highlight(info.getValue(), termFor('tel'))}</span>
      ),
    }),
    col.accessor('adress', {
      header: 'Address',
      cell: info => (
        <span className="text-sm">{highlight(info.getValue(), termFor('adress'))}</span>
      ),
    }),
    col.accessor('ort', {
      header: 'City',
      cell: info => <span className="text-sm">{info.getValue() || '—'}</span>,
    }),
    col.accessor('sinfrid_id', {
      header: 'Sinfrid ID',
      cell: info => {
        const val = info.getValue()
        return val
          ? <span className="font-mono text-xs text-violet-700">{highlight(val, termFor('sinfrid_id'))}</span>
          : <span className="text-muted-foreground/40 text-sm">—</span>
      },
    }),
    col.accessor('last_order_date', {
      header: 'Last Order',
      cell: info => {
        const val = info.getValue()
        return (
          <span className="text-sm">
            {val ? new Date(val).toLocaleDateString('sv-SE') : 'N/A'}
          </span>
        )
      },
    }),
  ]

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })

  const start = meta ? (meta.current_page - 1) * meta.per_page + 1 : 0
  const end   = meta ? Math.min(meta.current_page * meta.per_page, meta.total) : 0

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-border overflow-hidden max-h-[600px] overflow-y-auto [&_[data-slot=table-container]]:overflow-x-clip">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(hg => (
              <TableRow key={hg.id} className="bg-muted/40 hover:bg-muted/40">
                {hg.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className="sticky top-0 z-10 bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3 border-b border-border"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <SkeletonRows />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-48 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <span className="text-3xl">😶</span>
                    <p className="font-medium">No customers found</p>
                    <p className="text-sm">Try adjusting your search or filter</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  onClick={() => onRowClick(row.original)}
                  className={`cursor-pointer transition-colors ${
                    selectedId === row.original.id
                      ? 'bg-primary/5 border-l-2 border-l-primary'
                      : 'hover:bg-muted/40'
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
        <span>
          {meta && meta.total > 0
            ? isLastViewed
              ? `${meta.total.toLocaleString()} recently viewed`
              : hasSearch
                ? `Showing ${start.toLocaleString()} – ${end.toLocaleString()} of ${meta.total.toLocaleString()} results`
                : `Showing ${start.toLocaleString()} – ${end.toLocaleString()} of ${meta.total.toLocaleString()} customers`
            : 'No customers'}
        </span>
        <div className="flex items-center gap-3">
          <Select
            value={String(perPage)}
            onValueChange={v => { onPerPageChange(Number(v)); onPageChange(1) }}
          >
            <SelectTrigger className="h-8 w-[80px] text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[50, 100, 200, 500].map(n => (
                <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1">
            <Button
              variant="outline" size="icon" className="h-8 w-8"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {meta && buildPageButtons(page, meta.last_page).map((p, i) =>
              p === '...'
                ? <span key={`e-${i}`} className="px-1">…</span>
                : <Button key={p} variant={p === page ? 'default' : 'outline'} size="default" className="h-8 min-w-8 px-3 text-xs" onClick={() => onPageChange(p as number)}>{p}</Button>
            )}
            <Button
              variant="outline" size="icon" className="h-8 w-8"
              disabled={!meta || page >= meta.last_page}
              onClick={() => onPageChange(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

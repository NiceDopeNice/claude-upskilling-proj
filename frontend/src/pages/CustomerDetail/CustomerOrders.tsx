import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  CustomerOrderByState, CustomerOrderDeleted, OrderState,
  getCustomerOrdersByState,
  PaginatedResponse,
} from '@/api/customerApi'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  readonly customerId: number
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

const STATES: { key: OrderState; label: string }[] = [
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'deleted',  label: 'Deleted'  },
]

const PER_PAGE_OPTS = [10, 20, 25, 50, 100]
const TH = 'bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3'

function fmt(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString('sv-SE') : '—'
}

function StatusBadge({ row }: { row: CustomerOrderByState }) {
  if (row.state === 'deleted') {
    return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 border border-red-100">Deleted</span>
  }
  const r = row as { is_shipped: number; is_paid: number; is_processed: number }
  if (r.is_shipped) return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700 border border-green-100">Shipped</span>
  if (r.is_paid)    return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700 border border-blue-100">Paid</span>
  if (r.is_processed) return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-100">Processed</span>
  return <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border">Pending</span>
}

export function CustomerOrders({ customerId }: Props) {
  const navigate = useNavigate()

  const [state, setState]     = useState<OrderState>('approved')
  const [page, setPage]       = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]   = useState('')
  const [data, setData]       = useState<PaginatedResponse<CustomerOrderByState> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getCustomerOrdersByState(customerId, state, page, perPage, dateFrom || undefined, dateTo || undefined)
      .then(setData)
      .catch(() => setError('Failed to load orders.'))
      .finally(() => setLoading(false))
  }, [customerId, state, page, perPage, dateFrom, dateTo])

  function switchState(s: OrderState) { setState(s); setPage(1) }

  const rows = data?.data ?? []
  const meta = data?.meta ?? null
  const colCount = state === 'deleted' ? 9 : 7

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header + state tabs */}
      <div className="border-b border-border px-5 py-3 flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-sm font-semibold">Orders</h3>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date range filters */}
          <div className="flex items-center gap-1">
            <Input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1) }}
              className="h-7 text-xs w-[130px]"
              placeholder="From"
            />
            <span className="text-xs text-muted-foreground">–</span>
            <Input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1) }}
              className="h-7 text-xs w-[130px]"
              placeholder="To"
            />
          </div>
          {/* State tabs */}
          <div className="flex gap-1">
            {STATES.map(s => (
              <button
                key={s.key}
                onClick={() => switchState(s.key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  state === s.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive px-5 py-3 bg-destructive/5 border-b border-destructive/10">{error}</p>
      )}

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/40">
            <TableHead className={TH}>ID</TableHead>
            <TableHead className={TH}>Date</TableHead>
            {state === 'deleted' && <TableHead className={TH}>Deleted</TableHead>}
            <TableHead className={TH}>Ref</TableHead>
            <TableHead className={TH}>Product</TableHead>
            <TableHead className={`${TH} text-right`}>Total</TableHead>
            <TableHead className={TH}>Payment</TableHead>
            <TableHead className={TH}>Status</TableHead>
            {state === 'deleted' && <TableHead className={TH}>Cancel reason</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: colCount }).map((_, j) => (
                  <TableCell key={j} className="py-3"><Skeleton className="h-3.5 w-full" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colCount} className="py-10 text-center text-sm text-muted-foreground">
                No {state} orders
              </TableCell>
            </TableRow>
          ) : (
            rows.map(row => {
              const del = row as CustomerOrderDeleted
              // Only approved orders in the main orders table are navigable to detail
              const isNavigable = row.state !== 'deleted'
              return (
                <TableRow
                  key={row.id}
                  className={`transition-colors hover:bg-muted/40 ${isNavigable ? 'cursor-pointer' : ''}`}
                  onClick={() => isNavigable && navigate(`/orders/${row.id}`)}
                >
                  <TableCell className="py-3 font-mono text-xs text-muted-foreground">{row.id}</TableCell>
                  <TableCell className="py-3 whitespace-nowrap">{fmt(row.date_added)}</TableCell>
                  {state === 'deleted' && (
                    <TableCell className="py-3 whitespace-nowrap text-red-600">{fmt(del.date_deleted)}</TableCell>
                  )}
                  <TableCell className="py-3 font-mono text-xs">{row.ref || '—'}</TableCell>
                  <TableCell className="py-3 font-mono text-xs text-muted-foreground">{row.prod_id ?? '—'}</TableCell>
                  <TableCell className="py-3 text-right tabular-nums font-medium">
                    {row.total.toLocaleString('sv-SE', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="py-3 text-xs capitalize text-muted-foreground">{row.payment_method || '—'}</TableCell>
                  <TableCell className="py-3"><StatusBadge row={row} /></TableCell>
                  {state === 'deleted' && (
                    <TableCell className="py-3 text-xs text-muted-foreground max-w-[160px] truncate">{del.cancel_reason || '—'}</TableCell>
                  )}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {/* Bottom bar */}
      {meta && (
        <div className="border-t border-border px-5 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {meta.total > 0
              ? `${(meta.current_page - 1) * meta.per_page + 1}–${Math.min(meta.current_page * meta.per_page, meta.total)} of ${meta.total.toLocaleString()}`
              : 'No results'}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs whitespace-nowrap">Rows per page</span>
              <Select value={String(perPage)} onValueChange={v => { setPerPage(Number(v)); setPage(1) }}>
                <SelectTrigger className="h-7 w-[60px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PER_PAGE_OPTS.map(n => (
                    <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {meta.last_page > 1 && (
              <div className="flex items-center gap-1">
                <button
                  className="h-7 w-7 rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors flex items-center justify-center"
                  disabled={page <= 1}
                  onClick={e => { e.stopPropagation(); setPage(p => p - 1) }}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {buildPageButtons(page, meta.last_page).map((p, i) =>
                  p === '...'
                    ? <span key={`e-${i}`} className="h-7 w-7 flex items-center justify-center text-xs">…</span>
                    : <button
                        key={p}
                        onClick={e => { e.stopPropagation(); setPage(p as number) }}
                        className={`h-7 w-7 rounded text-xs font-medium flex items-center justify-center transition-colors ${
                          p === page ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
                        }`}
                      >{p}</button>
                )}
                <button
                  className="h-7 w-7 rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors flex items-center justify-center"
                  disabled={page >= meta.last_page}
                  onClick={e => { e.stopPropagation(); setPage(p => p + 1) }}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

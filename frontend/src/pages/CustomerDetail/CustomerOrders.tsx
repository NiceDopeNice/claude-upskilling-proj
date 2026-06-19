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
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'

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

function fmt(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString('sv-SE') : '—'
}

function StatusBadge({ row }: { row: CustomerOrderByState }) {
  if (row.state === 'deleted')
    return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600 border border-red-100">Deleted</span>
  const r = row as { is_shipped: number; is_paid: number; is_processed: number }
  if (r.is_shipped)   return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">Shipped</span>
  if (r.is_paid)      return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100">Paid</span>
  if (r.is_processed) return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-100">Processed</span>
  return <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">Pending</span>
}

const TH = 'bg-muted/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2.5'

export function CustomerOrders({ customerId }: Props) {
  const navigate = useNavigate()

  const [state, setState]       = useState<OrderState>('approved')
  const [page, setPage]         = useState(1)
  const [perPage, setPerPage]   = useState(20)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [data, setData]         = useState<PaginatedResponse<CustomerOrderByState> | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

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

      {/* Header */}
      <div className="border-b border-border px-4 py-2.5 flex items-center justify-between flex-wrap gap-2 bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-blue-500/10 flex items-center justify-center">
            <ShoppingBag className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <span className="text-xs font-semibold">Orders</span>
          {meta && meta.total > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {meta.total.toLocaleString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Date range */}
          <div className="flex items-center gap-1">
            <Input
              type="date"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1) }}
              className="h-6 text-[11px] w-[118px] px-2"
            />
            <span className="text-[11px] text-muted-foreground">–</span>
            <Input
              type="date"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1) }}
              className="h-6 text-[11px] w-[118px] px-2"
            />
          </div>

          {/* State tabs */}
          <div className="flex gap-0.5 bg-muted rounded-lg p-0.5">
            {STATES.map(s => (
              <button
                key={s.key}
                onClick={() => switchState(s.key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  state === s.key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <p className="text-xs text-destructive px-4 py-2.5 bg-destructive/5 border-b border-destructive/10">{error}</p>
      )}

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
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
                  <TableCell key={j} className="py-2.5"><Skeleton className="h-3 w-full" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colCount} className="py-10 text-center text-xs text-muted-foreground">
                No {state} orders
              </TableCell>
            </TableRow>
          ) : (
            rows.map(row => {
              const del = row as CustomerOrderDeleted
              const isNavigable = row.state !== 'deleted'
              return (
                <TableRow
                  key={row.id}
                  className={`transition-colors hover:bg-muted/30 text-xs ${isNavigable ? 'cursor-pointer' : ''}`}
                  onClick={() => isNavigable && navigate(`/orders/${row.id}`)}
                >
                  <TableCell className="py-2.5 font-mono text-[11px] text-muted-foreground">{row.id}</TableCell>
                  <TableCell className="py-2.5 whitespace-nowrap text-[11px]">{fmt(row.date_added)}</TableCell>
                  {state === 'deleted' && (
                    <TableCell className="py-2.5 whitespace-nowrap text-[11px] text-red-600">{fmt(del.date_deleted)}</TableCell>
                  )}
                  <TableCell className="py-2.5 font-mono text-[11px]">{row.ref || '—'}</TableCell>
                  <TableCell className="py-2.5 font-mono text-[11px] text-muted-foreground">{row.prod_id ?? '—'}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums font-semibold text-[11px]">
                    {row.total.toLocaleString('sv-SE', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="py-2.5 text-[11px] capitalize text-muted-foreground">{row.payment_method || '—'}</TableCell>
                  <TableCell className="py-2.5"><StatusBadge row={row} /></TableCell>
                  {state === 'deleted' && (
                    <TableCell className="py-2.5 text-[11px] text-muted-foreground max-w-[140px] truncate">{del.cancel_reason || '—'}</TableCell>
                  )}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {meta && (
        <div className="border-t border-border px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground bg-muted/10">
          <span>
            {meta.total > 0
              ? `${(meta.current_page - 1) * meta.per_page + 1}–${Math.min(meta.current_page * meta.per_page, meta.total)} of ${meta.total.toLocaleString()}`
              : 'No results'}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] whitespace-nowrap">Per page</span>
              <Select value={String(perPage)} onValueChange={v => { setPerPage(Number(v)); setPage(1) }}>
                <SelectTrigger className="h-6 w-14 text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PER_PAGE_OPTS.map(n => (
                    <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {meta.last_page > 1 && (
              <div className="flex items-center gap-0.5">
                <button
                  className="h-6 w-6 rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors flex items-center justify-center"
                  disabled={page <= 1}
                  onClick={e => { e.stopPropagation(); setPage(p => p - 1) }}
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>
                {buildPageButtons(page, meta.last_page).map((p, i) =>
                  p === '...'
                    ? <span key={`e-${i}`} className="h-6 w-6 flex items-center justify-center text-[11px]">…</span>
                    : <button
                        key={p}
                        onClick={e => { e.stopPropagation(); setPage(p as number) }}
                        className={`h-6 w-6 rounded text-[11px] font-medium flex items-center justify-center transition-colors ${
                          p === page ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
                        }`}
                      >{p}</button>
                )}
                <button
                  className="h-6 w-6 rounded border border-border hover:bg-muted disabled:opacity-40 transition-colors flex items-center justify-center"
                  disabled={page >= meta.last_page}
                  onClick={e => { e.stopPropagation(); setPage(p => p + 1) }}
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

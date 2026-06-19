import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  CustomerSubscription, SubscriptionState,
  getCustomerSubscriptions,
  PaginatedResponse,
} from '@/api/customerApi'
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react'

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

const STATES: { key: SubscriptionState; label: string }[] = [
  { key: 'approved', label: 'Approved' },
  { key: 'deleted',  label: 'Deleted'  },
]

const PER_PAGE_OPTS = [10, 20, 25, 50, 100]

function fmt(d: string | null | undefined) {
  if (!d || d === '0000-00-00') return '—'
  return new Date(d).toLocaleDateString('sv-SE')
}

const TH = 'bg-muted/60 text-[10px] font-bold uppercase tracking-wider text-muted-foreground py-2.5'

export function CustomerSubscriptions({ customerId }: Props) {
  const navigate = useNavigate()

  const [state, setState]     = useState<SubscriptionState>('approved')
  const [page, setPage]       = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [data, setData]       = useState<PaginatedResponse<CustomerSubscription> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  function load() {
    setLoading(true)
    setError(null)
    getCustomerSubscriptions(customerId, state, page, perPage)
      .then(setData)
      .catch(() => setError('Failed to load subscriptions.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [customerId, state, page, perPage])

  function switchState(s: SubscriptionState) { setState(s); setPage(1) }

  const rows = data?.data ?? []
  const meta = data?.meta ?? null
  const colCount = state === 'deleted' ? 8 : 7

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">

      {/* Header */}
      <div className="border-b border-border px-4 py-2.5 flex items-center justify-between bg-muted/20">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-violet-500/10 flex items-center justify-center">
            <RefreshCw className="h-3.5 w-3.5 text-violet-600" />
          </div>
          <span className="text-xs font-semibold">Subscriptions</span>
          {meta && meta.total > 0 && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
              {meta.total.toLocaleString()}
            </span>
          )}
        </div>

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

      {error && (
        <p className="text-xs text-destructive px-4 py-2.5 bg-destructive/5 border-b border-destructive/10">{error}</p>
      )}

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={TH}>ID</TableHead>
            <TableHead className={TH}>Remote ID</TableHead>
            <TableHead className={TH}>Product</TableHead>
            <TableHead className={TH}>Started</TableHead>
            {state === 'approved'
              ? <TableHead className={TH}>Next shipment</TableHead>
              : <TableHead className={TH}>Cancelled</TableHead>
            }
            <TableHead className={TH}>Payment</TableHead>
            {state === 'deleted' && <TableHead className={TH}>Cancel reason</TableHead>}
            <TableHead className={TH}>Status</TableHead>
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
                No {state} subscriptions
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row: CustomerSubscription) => (
              <TableRow
                key={row.id}
                className="transition-colors hover:bg-muted/30 cursor-pointer text-xs"
                onClick={() => navigate(`/subscriptions/${row.id}`)}
              >
                <TableCell className="py-2.5 font-mono text-[11px] text-muted-foreground">{row.id}</TableCell>
                <TableCell className="py-2.5 font-mono text-[11px]">{row.remote_id || '—'}</TableCell>
                <TableCell className="py-2.5 font-mono text-[11px] text-muted-foreground">{row.subscription_id ?? '—'}</TableCell>
                <TableCell className="py-2.5 whitespace-nowrap text-[11px]">{fmt(row.date_started)}</TableCell>
                {state === 'approved'
                  ? <TableCell className="py-2.5 whitespace-nowrap text-[11px]">{fmt(row.next_shipment)}</TableCell>
                  : <TableCell className="py-2.5 whitespace-nowrap text-[11px] text-red-600">{fmt(row.date_cancelled)}</TableCell>
                }
                <TableCell className="py-2.5 text-[11px] capitalize text-muted-foreground">{row.payment_type || '—'}</TableCell>
                {state === 'deleted' && (
                  <TableCell className="py-2.5 text-[11px] text-muted-foreground max-w-[140px] truncate">{row.cancel_reason || '—'}</TableCell>
                )}
                <TableCell className="py-2.5">
                  {row.active
                    ? <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100">Active</span>
                    : <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">Inactive</span>
                  }
                </TableCell>
              </TableRow>
            ))
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
              <span className="whitespace-nowrap">Per page</span>
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
                    ? <span key={`e-${i}`} className="h-6 w-6 flex items-center justify-center">…</span>
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

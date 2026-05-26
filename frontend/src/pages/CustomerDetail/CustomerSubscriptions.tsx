import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CustomerSubscription, SubscriptionState,
  getCustomerSubscriptions,
  PaginatedResponse,
} from '@/api/customerApi'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const STATES: { key: SubscriptionState; label: string }[] = [
  { key: 'approved', label: 'Approved' },
  { key: 'deleted',  label: 'Deleted'  },
]

function fmt(d: string | null | undefined) {
  if (!d || d === '0000-00-00') return '—'
  return new Date(d).toLocaleDateString('sv-SE')
}

export function CustomerSubscriptions({ customerId }: { customerId: number }) {
  const [state, setState] = useState<SubscriptionState>('approved')
  const [page, setPage]   = useState(1)
  const [data, setData]   = useState<PaginatedResponse<CustomerSubscription> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    getCustomerSubscriptions(customerId, state, page, 20)
      .then(setData)
      .catch(() => setError('Failed to load subscriptions.'))
      .finally(() => setLoading(false))
  }, [customerId, state, page])

  function switchState(s: SubscriptionState) {
    setState(s)
    setPage(1)
  }

  const rows = data?.data ?? []
  const meta = data?.meta ?? null

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header + state tabs */}
      <div className="border-b border-border px-5 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Subscriptions</h3>
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

      {error && (
        <p className="text-xs text-destructive px-5 py-3 bg-destructive/5 border-b border-destructive/10">{error}</p>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">ID</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Remote ID</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Started</th>
              {state === 'approved' ? (
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Next shipment</th>
              ) : (
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Cancelled</th>
              )}
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Payment</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Ref</th>
              {state === 'deleted' && (
                <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Cancel reason</th>
              )}
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: state === 'deleted' ? 8 : 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-3.5 w-full" /></td>
                  ))}
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={state === 'deleted' ? 8 : 7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No {state} subscriptions
                </td>
              </tr>
            ) : (
              rows.map((row: CustomerSubscription) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{row.id}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{row.remote_id || '—'}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">{fmt(row.date_started)}</td>
                  {state === 'approved' ? (
                    <td className="px-4 py-2.5 whitespace-nowrap">{fmt(row.next_shipment)}</td>
                  ) : (
                    <td className="px-4 py-2.5 whitespace-nowrap text-red-600">{fmt(row.date_cancelled)}</td>
                  )}
                  <td className="px-4 py-2.5 text-xs capitalize text-muted-foreground">{row.payment_type || '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{row.ref || '—'}</td>
                  {state === 'deleted' && (
                    <td className="px-4 py-2.5 text-xs text-muted-foreground max-w-[160px] truncate">{row.cancel_reason || '—'}</td>
                  )}
                  <td className="px-4 py-2.5">
                    {row.active
                      ? <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700 border border-green-100">Active</span>
                      : <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border">Inactive</span>
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="border-t border-border px-5 py-2.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {(meta.current_page - 1) * meta.per_page + 1}–{Math.min(meta.current_page * meta.per_page, meta.total)} of {meta.total.toLocaleString()}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-7 w-7" disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)}>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

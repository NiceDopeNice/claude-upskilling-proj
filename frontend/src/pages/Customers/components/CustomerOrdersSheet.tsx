import { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Package,
  Search,
} from 'lucide-react'
import { Customer, CustomerOrder, getCustomerOrders } from '@/api/customerApi'

const PER_PAGE = 10

function YesNo({ value }: { value: boolean }) {
  return value ? (
    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium text-xs">
      <CheckCircle2 className="h-3.5 w-3.5" />Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-muted-foreground/40 text-xs">
      <XCircle className="h-3.5 w-3.5" />No
    </span>
  )
}

function DateCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-muted-foreground/40">—</span>
  return <span className="tabular-nums">{new Date(value).toLocaleDateString('sv-SE')}</span>
}

function matchesSearch(order: CustomerOrder, term: string): boolean {
  if (!term) return true
  const t = term.toLowerCase()
  return (
    String(order.id).includes(t) ||
    (order.date_added ?? '').toLowerCase().includes(t) ||
    (order.date_shipped ?? '').toLowerCase().includes(t) ||
    String(order.total).includes(t) ||
    (order.payment_method ?? '').toLowerCase().includes(t) ||
    String(order.prod_id ?? '').includes(t) ||
    String(order.subscription_id ?? '').includes(t) ||
    order.status.includes(t)
  )
}

interface Props {
  customer: Customer | null
  open: boolean
  onClose: () => void
}

export function CustomerOrdersSheet({ customer, open, onClose }: Props) {
  // All orders fetched from API (current API page)
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [apiMeta, setApiMeta] = useState<{
    current_page: number; last_page: number; total: number; per_page: number
  } | null>(null)
  const [apiPage, setApiPage] = useState(1)
  const [loading, setLoading] = useState(false)

  // Client-side search + local pagination
  const [search, setSearch] = useState('')
  const [localPage, setLocalPage] = useState(1)

  useEffect(() => {
    if (!customer || !open) {
      setOrders([]); setApiMeta(null); setApiPage(1); setSearch(''); setLocalPage(1)
      return
    }
    setLoading(true)
    Promise.all([
      getCustomerOrders(customer.id, apiPage, PER_PAGE),
      new Promise<void>(resolve => setTimeout(resolve, 500)),
    ])
      .then(([res]) => {
        setOrders(res.data)
        setApiMeta(res.meta as typeof apiMeta)
        setLocalPage(1)
        setSearch('')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [customer, open, apiPage])

  // Client-side filter
  const filtered = useMemo(
    () => orders.filter(o => matchesSearch(o, search)),
    [orders, search],
  )

  // Reset local page when search changes
  useEffect(() => { setLocalPage(1) }, [search])

  const totalLocalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageSlice = filtered.slice((localPage - 1) * PER_PAGE, localPage * PER_PAGE)

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-6xl w-full p-0 gap-0 overflow-hidden">

        {/* Header */}
        <DialogHeader className="pl-8 pr-16 py-5 border-b border-border bg-gradient-to-r from-muted/40 to-background">
          <DialogTitle className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center shrink-0">
              <ShoppingBag className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold leading-tight">
                {customer ? `${customer.first_name} ${customer.last_name}` : 'Orders'}
              </p>
              {customer && (
                <p className="text-sm text-muted-foreground font-normal mt-0.5">
                  Customer #{customer.customer_no} · Order history
                </p>
              )}
            </div>
            {apiMeta && (
              <div className="shrink-0 flex flex-col items-end gap-0.5">
                <span className="text-2xl font-bold tabular-nums leading-none">{apiMeta.total.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground font-normal">orders</span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-8 py-5 flex flex-col gap-4">

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order #, date, total, payment, product, subscription..."
              className="pl-9 h-9"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 opacity-25" />
              <p className="font-medium">No orders found</p>
            </div>
          ) : (
            <>
              <div key={`${localPage}-${apiPage}`} className="rounded-xl border border-border overflow-hidden animate-in fade-in-0 duration-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      {([
                        { label: 'Order #' },
                        { label: 'Date Added' },
                        { label: 'Date Shipped' },
                        { label: 'Total' },
                        { label: 'Product #' },
                        { label: 'Subscription #', center: true },
                        { label: 'Shipped' },
                        { label: 'Paid' },
                      ] as { label: string; center?: boolean }[]).map(col => (
                        <th key={col.label} className={`${col.center ? 'text-center' : 'text-left'} text-xs font-semibold uppercase tracking-wider text-muted-foreground px-5 py-3.5 whitespace-nowrap`}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {pageSlice.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-10 text-center text-sm text-muted-foreground">
                          No orders match &quot;{search}&quot;
                        </td>
                      </tr>
                    ) : pageSlice.map(order => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-5 py-4">
                          <button
                            onClick={() => navigator.clipboard.writeText(String(order.id))}
                            className="inline-flex items-center gap-1.5 font-mono font-semibold text-blue-600 cursor-pointer hover:text-blue-800 hover:underline transition-colors group/id"
                          >
                            <Package className="h-3.5 w-3.5 text-blue-400 group-hover/id:text-blue-600 transition-colors" />
                            #{order.id}
                          </button>
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          <DateCell value={order.date_added} />
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          <DateCell value={order.date_shipped} />
                        </td>
                        <td className="px-5 py-4">
                          <span className="font-semibold tabular-nums">
                            {order.total.toLocaleString('sv-SE', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-xs text-muted-foreground ml-1">SEK</span>
                        </td>
                        <td className="px-5 py-4">
                          {order.prod_id ? (
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-xs font-medium">
                              {order.prod_id}
                            </span>
                          ) : <span className="text-muted-foreground/40">—</span>}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {order.subscription_id ? (
                            <button
                              onClick={() => navigator.clipboard.writeText(String(order.subscription_id))}
                              className="font-mono font-medium text-blue-600 cursor-pointer hover:text-blue-800 hover:underline transition-colors"
                            >
                              {order.subscription_id}
                            </button>
                          ) : <span className="text-muted-foreground/40">—</span>}
                        </td>
                        <td className="px-5 py-4">
                          <YesNo value={order.status === 'shipped' || order.date_shipped !== null} />
                        </td>
                        <td className="px-5 py-4">
                          <YesNo value={['paid', 'shipped'].includes(order.status) || order.date_paid !== null} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer: local pagination (search) + API pagination */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  {/* Local page (within current API page) */}
                  {totalLocalPages > 1 && (
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="icon" className="h-8 w-8" disabled={localPage <= 1} onClick={() => setLocalPage(p => p - 1)}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium tabular-nums">
                        {localPage} / {totalLocalPages}
                      </span>
                      <Button variant="outline" size="icon" className="h-8 w-8" disabled={localPage >= totalLocalPages} onClick={() => setLocalPage(p => p + 1)}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <span className="text-xs">
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''} on this page
                  </span>
                </div>

                {/* API page navigation */}
                {apiMeta && apiMeta.last_page > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs">
                      Page {apiMeta.current_page} of {apiMeta.last_page}
                    </span>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={apiPage <= 1} onClick={() => setApiPage(p => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" disabled={apiPage >= apiMeta.last_page} onClick={() => setApiPage(p => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

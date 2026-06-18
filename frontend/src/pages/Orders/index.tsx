import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { AppSelect, SelectOption } from '@/components/AppSelect'
import { toast } from 'sonner'
import {
  ArrowLeft, Truck, CreditCard, Package, AlertTriangle,
  Receipt, Plus, Minus, Loader2, ExternalLink,
} from 'lucide-react'
import {
  OrderDetail, OrderAdjustment,
  getOrder, cancelOrder, adjustOrder,
} from '@/api/orderApi'

function fmt(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString('sv-SE') : '—'
}

function StatusBadge({ status }: { status: OrderDetail['status'] }) {
  if (status === 'shipped')   return <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 border border-green-100">Shipped</span>
  if (status === 'paid')      return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">Paid</span>
  if (status === 'processed') return <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700 border border-amber-100">Processed</span>
  return <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border">Pending</span>
}

const ADJUST_TYPE_OPTIONS: SelectOption[] = [
  { value: 'fee',      label: 'Fee' },
  { value: 'discount', label: 'Discount' },
]

export default function OrderDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()

  const [order, setOrder]     = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const [cancelOpen, setCancelOpen]     = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelSaving, setCancelSaving] = useState(false)

  const [adjustOpen, setAdjustOpen]   = useState(false)
  const [adjustType, setAdjustType]   = useState<'fee' | 'discount'>('fee')
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [adjustSaving, setAdjustSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getOrder(Number(id))
      .then(res => setOrder(res.data))
      .catch(() => setError('Order not found.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleCancel() {
    if (!order || !cancelReason.trim()) return
    setCancelSaving(true)
    try {
      const res = await cancelOrder(order.id, { cancel_reason: cancelReason })
      toast.success(res.message)
      setCancelOpen(false)
      // Navigate back to customer since order no longer exists in orders table
      navigate(`/customers/${order.customer_id}`)
    } catch {
      toast.error('Failed to cancel order.')
    } finally {
      setCancelSaving(false)
    }
  }

  async function handleAdjust() {
    if (!order || !adjustAmount) return
    const amount = parseFloat(adjustAmount)
    if (isNaN(amount) || amount <= 0) { toast.error('Enter a valid amount.'); return }
    setAdjustSaving(true)
    try {
      const res = await adjustOrder(order.id, { type: adjustType, amount, reason: adjustReason || undefined })
      toast.success(res.message)
      setOrder(prev => prev ? { ...prev, adjustments: [...prev.adjustments, res.adjustment] } : prev)
      setAdjustOpen(false)
      setAdjustAmount('')
      setAdjustReason('')
    } catch {
      toast.error('Failed to apply adjustment.')
    } finally {
      setAdjustSaving(false)
    }
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-60 rounded-xl" />
    </div>
  )

  if (error || !order) return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <p className="text-sm text-destructive bg-destructive/5 border border-destructive/10 rounded-lg px-5 py-3">
        {error ?? 'Order not found.'}
      </p>
    </div>
  )

  const adjTotal = order.adjustments.reduce((sum, a) => {
    const amt = Number(a.amount ?? 0)
    return sum + (a.type === 'discount' ? -amt : amt)
  }, 0)

  const cartItems = Array.isArray(order.cart) ? order.cart as Record<string, unknown>[] : null

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-5">
      {/* Back + header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-lg font-bold">Order #{order.id}</h1>
            <p className="text-xs text-muted-foreground">
              {fmt(order.date_added)}
              {order.ref && <span className="ml-2 font-mono">ref: {order.ref}</span>}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setAdjustOpen(true)}>
            <Receipt className="h-3.5 w-3.5 mr-1" /> Adjust
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setCancelOpen(true)}>
            Cancel Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer & Order info */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Customer</h2>
          <div className="space-y-1.5">
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground">Name</span>
              {order.customer_id ? (
                <Link to={`/customers/${order.customer_id}`} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
                  {order.customer_name ?? `#${order.customer_id}`} <ExternalLink className="h-3 w-3" />
                </Link>
              ) : <span className="text-xs">—</span>}
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-xs">{order.customer_email ?? '—'}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground">Ref</span>
              <span className="text-xs font-mono">{order.ref ?? '—'}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground">Invoice</span>
              <span className="text-xs font-mono">{order.invoice_no || '—'}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground">Product ID</span>
              <span className="text-xs font-mono">{order.prod_id ?? '—'}</span>
            </div>
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground">Subscription</span>
              <span className="text-xs font-mono">{order.subscription_id ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Payment & Shipment */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Payment & Shipment</h2>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><CreditCard className="h-3.5 w-3.5" /> Payment</span>
              <span className="text-xs capitalize">{order.payment_method ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Date paid</span>
              <span className="text-xs">{fmt(order.date_paid)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Truck className="h-3.5 w-3.5" /> Shipped</span>
              <span className="text-xs">{fmt(order.date_shipped)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Shipment center</span>
              <span className="text-xs">{order.shipment_center ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Tracking</span>
              <span className="text-xs font-mono">{order.parcel_tracking_id ?? '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Region</span>
              <span className="text-xs">{order.region_code ?? '—'}</span>
            </div>
            {order.is_pre_financed && (
              <div className="flex items-center gap-1 mt-1">
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 border border-purple-100">Pre-financed</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Totals</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 max-w-xs">
          {[
            { label: 'Total',            value: order.total },
            { label: 'Total (excl. VAT)', value: order.total_excluding_vat },
            { label: 'Total VAT',         value: order.total_vat },
            { label: 'Total w/ coupon',   value: order.total_with_coupon },
          ].map(({ label, value }) => (
            value
              ? <React.Fragment key={label}>
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-xs font-medium tabular-nums text-right">{value.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr</span>
                </React.Fragment>
              : null
          ))}
          {order.coupon && <><span className="text-xs text-muted-foreground">Coupon</span><span className="text-xs font-mono">{order.coupon}</span></>}
        </div>
        {order.adjustments.length > 0 && (
          <div className="border-t border-border pt-2 mt-2 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground">Adjustments</p>
            {order.adjustments.map((a: OrderAdjustment) => (
              <div key={a.id} className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  {a.type === 'fee'
                    ? <Plus className="h-3 w-3 text-red-500" />
                    : <Minus className="h-3 w-3 text-green-500" />
                  }
                  {a.type === 'fee' ? 'Fee' : 'Discount'}{a.reason ? ` — ${a.reason}` : ''}
                </span>
                <span className={`text-xs font-medium tabular-nums ${a.type === 'fee' ? 'text-red-600' : 'text-green-600'}`}>
                  {a.type === 'fee' ? '+' : '-'}{Number(a.amount ?? 0).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-border pt-1 mt-1">
              <span className="text-xs font-semibold">Adjusted total</span>
              <span className="text-xs font-bold tabular-nums">
                {(order.total + adjTotal).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cart / Line items */}
      {cartItems && cartItems.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
            <Package className="h-4 w-4" /> Line Items
          </h2>
          <div className="space-y-2">
            {cartItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="text-xs">
                  <span className="font-medium">{String(item['name'] ?? item['title'] ?? item['prod_id'] ?? `Item ${i + 1}`)}</span>
                  {item['qty'] && <span className="text-muted-foreground ml-2">×{String(item['qty'])}</span>}
                </div>
                {item['price'] && (
                  <span className="text-xs font-medium tabular-nums">
                    {Number(item['price']).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cancel dialog */}
      <Dialog open={cancelOpen} onOpenChange={v => !cancelSaving && setCancelOpen(v)}>
        <DialogContent className="sm:max-w-[420px]" showCloseButton={false}>
          <DialogHeader className="flex flex-col items-center text-center py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 ring-4 ring-red-200 mb-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-base">Cancel Order #{order.id}</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">This action is irreversible. The order will be moved to the cancelled state.</p>
          </DialogHeader>
          <div className="py-2 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Reason *</div>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={cancelSaving}>Back</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelSaving || !cancelReason.trim()}>
              {cancelSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Cancel Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust dialog */}
      <Dialog open={adjustOpen} onOpenChange={v => !adjustSaving && setAdjustOpen(v)}>
        <DialogContent className="sm:max-w-[380px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Receipt className="h-4 w-4 text-primary" /> Order Adjustment
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Type *</div>
              <AppSelect
                options={ADJUST_TYPE_OPTIONS}
                value={ADJUST_TYPE_OPTIONS.find(o => o.value === adjustType) ?? null}
                onChange={opt => setAdjustType((opt as SelectOption).value as 'fee' | 'discount')}
                isSearchable={false}
              />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Amount (kr) *</div>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={adjustAmount}
                onChange={e => setAdjustAmount(e.target.value)}
                placeholder="0.00"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Reason</div>
              <Input
                value={adjustReason}
                onChange={e => setAdjustReason(e.target.value)}
                placeholder="e.g. Shipping correction"
                className="h-8 text-sm"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAdjustOpen(false)} disabled={adjustSaving}>Cancel</Button>
            <Button onClick={handleAdjust} disabled={adjustSaving || !adjustAmount}>
              {adjustSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

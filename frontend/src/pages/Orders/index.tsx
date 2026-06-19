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
  Receipt, Plus, Minus, Loader2, ExternalLink, Hash,
  Calendar, MapPin, Tag, RefreshCw,
} from 'lucide-react'
import {
  OrderDetail, OrderAdjustment,
  getOrder, cancelOrder, adjustOrder,
} from '@/api/orderApi'

function fmt(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString('sv-SE') : '—'
}

function StatusConfig(status: OrderDetail['status']) {
  if (status === 'shipped')   return { label: 'Shipped',   cls: 'bg-emerald-500' }
  if (status === 'paid')      return { label: 'Paid',      cls: 'bg-blue-500' }
  if (status === 'processed') return { label: 'Processed', cls: 'bg-amber-500' }
  return { label: 'Pending', cls: 'bg-slate-400' }
}

const ADJUST_TYPE_OPTIONS: SelectOption[] = [
  { value: 'fee',      label: 'Fee' },
  { value: 'discount', label: 'Discount' },
]

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={`text-xs font-medium ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
    </div>
  )
}

export default function OrderDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()

  const [order, setOrder]     = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const [cancelOpen, setCancelOpen]     = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelSaving, setCancelSaving] = useState(false)

  const [adjustOpen, setAdjustOpen]     = useState(false)
  const [adjustType, setAdjustType]     = useState<'fee' | 'discount'>('fee')
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
    <div className="p-6 space-y-4">
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
      <Skeleton className="h-32 rounded-xl" />
    </div>
  )

  if (error || !order) return (
    <div className="p-6 space-y-4">
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
  const status = StatusConfig(order.status)

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Hero header ── */}
      <div className="bg-gradient-to-r from-[#00adef] to-[#0099d4] px-6 py-5 shrink-0">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="h-7 w-7 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors shrink-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base font-bold text-white">Order #{order.id}</h1>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white ${status.cls}`}>
                  {status.label}
                </span>
                {order.is_pre_financed && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/80 text-white">
                    Pre-financed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-white flex-wrap">
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmt(order.date_added)}</span>
                {order.ref && <span className="flex items-center gap-1"><Hash className="h-3 w-3" />ref: <span className="font-mono text-white">{order.ref}</span></span>}
                {order.invoice_no && <span className="flex items-center gap-1"><Tag className="h-3 w-3" />inv: <span className="font-mono text-white">{order.invoice_no}</span></span>}
              </div>
            </div>
          </div>

          {/* Total + actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-right">
              <div className="text-xl font-bold text-white tabular-nums">
                {(order.total + adjTotal).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
              </div>
              {adjTotal !== 0 && (
                <div className="text-[11px] text-white/70 tabular-nums line-through">
                  {order.total.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline"
                className="h-8 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                onClick={() => setAdjustOpen(true)}
              >
                <Receipt className="h-3.5 w-3.5 mr-1" /> Adjust
              </Button>
              <Button size="sm" variant="outline"
                className="h-8 text-xs bg-red-500/20 border-red-300/30 text-white hover:bg-red-500/40 hover:text-white"
                onClick={() => setCancelOpen(true)}
              >
                Cancel Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 p-5 space-y-4">

        {/* Customer + Payment grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Customer card */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-blue-500/10 flex items-center justify-center">
                <ExternalLink className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-xs font-semibold">Customer</span>
            </div>
            <div className="px-4 py-1">
              <InfoRow label="Name" value={
                order.customer_id
                  ? <Link to={`/customers/${order.customer_id}`} className="text-primary hover:underline flex items-center gap-1">
                      {order.customer_name ?? `#${order.customer_id}`}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  : '—'
              } />
              <InfoRow label="Email"    value={order.customer_email} />
              <InfoRow label="Ref"      value={order.ref}             mono />
              <InfoRow label="Invoice"  value={order.invoice_no}      mono />
              <InfoRow label="Product"  value={order.prod_id}         mono />
              <InfoRow label="Sub ID"   value={order.subscription_id} mono />
            </div>
          </div>

          {/* Payment & shipment card */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-emerald-500/10 flex items-center justify-center">
                <Truck className="h-3 w-3 text-emerald-600" />
              </div>
              <span className="text-xs font-semibold">Payment &amp; Shipment</span>
            </div>
            <div className="px-4 py-1">
              <InfoRow label="Payment method" value={
                <span className="flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-muted-foreground" />
                  <span className="capitalize">{order.payment_method ?? '—'}</span>
                </span>
              } />
              <InfoRow label="Date paid"      value={fmt(order.date_paid)} />
              <InfoRow label="Date shipped"   value={
                <span className="flex items-center gap-1">
                  <Truck className="h-3 w-3 text-muted-foreground" />
                  {fmt(order.date_shipped)}
                </span>
              } />
              <InfoRow label="Shipment center" value={order.shipment_center} />
              <InfoRow label="Tracking"        value={order.parcel_tracking_id} mono />
              <InfoRow label="Region"          value={
                order.region_code
                  ? <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-muted-foreground" />{order.region_code}</span>
                  : '—'
              } />
            </div>
          </div>
        </div>

        {/* Financial summary */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-amber-500/10 flex items-center justify-center">
              <Receipt className="h-3 w-3 text-amber-600" />
            </div>
            <span className="text-xs font-semibold">Financial Summary</span>
          </div>
          <div className="px-4 py-3 space-y-1.5">
            {([
              { label: 'Total',              value: order.total },
              { label: 'Total (excl. VAT)',  value: order.total_excluding_vat },
              { label: 'VAT',                value: order.total_vat },
              { label: 'Total w/ coupon',    value: order.total_with_coupon },
            ] as { label: string; value: number | null | undefined }[]).filter(r => r.value).map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">{label}</span>
                <span className="text-xs tabular-nums">{value!.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr</span>
              </div>
            ))}
            {order.coupon && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Coupon</span>
                <span className="text-xs font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">{order.coupon}</span>
              </div>
            )}

            {/* Adjustments */}
            {order.adjustments.length > 0 && (
              <>
                <div className="border-t border-border my-2" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Adjustments</p>
                {order.adjustments.map((a: OrderAdjustment) => (
                  <div key={a.id} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${
                    a.type === 'fee'
                      ? 'bg-red-50 border border-red-100'
                      : 'bg-emerald-50 border border-emerald-100'
                  }`}>
                    <span className="flex items-center gap-1.5">
                      {a.type === 'fee'
                        ? <Plus className="h-3 w-3 text-red-500" />
                        : <Minus className="h-3 w-3 text-emerald-600" />
                      }
                      <span className={a.type === 'fee' ? 'text-red-700' : 'text-emerald-700'}>
                        {a.type === 'fee' ? 'Fee' : 'Discount'}{a.reason ? ` — ${a.reason}` : ''}
                      </span>
                    </span>
                    <span className={`font-medium tabular-nums ${a.type === 'fee' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {a.type === 'fee' ? '+' : '−'}{Number(a.amount ?? 0).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
                    </span>
                  </div>
                ))}
              </>
            )}

            {/* Final total */}
            <div className="border-t border-border pt-2 mt-1 flex items-center justify-between">
              <span className="text-xs font-semibold">Adjusted Total</span>
              <span className="text-sm font-bold tabular-nums text-foreground">
                {(order.total + adjTotal).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
              </span>
            </div>
          </div>
        </div>

        {/* Line items */}
        {cartItems && cartItems.length > 0 && (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-violet-500/10 flex items-center justify-center">
                <Package className="h-3 w-3 text-violet-600" />
              </div>
              <span className="text-xs font-semibold">Line Items</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="divide-y divide-border">
              {cartItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Package className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-medium truncate block">
                        {String(item['name'] ?? item['title'] ?? item['prod_id'] ?? `Item ${i + 1}`)}
                      </span>
                      {item['qty'] && (
                        <span className="text-[11px] text-muted-foreground">Qty: {String(item['qty'])}</span>
                      )}
                    </div>
                  </div>
                  {item['price'] && (
                    <span className="text-xs font-semibold tabular-nums shrink-0 ml-4">
                      {Number(item['price']).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Cancel dialog ── */}
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

      {/* ── Adjust dialog ── */}
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

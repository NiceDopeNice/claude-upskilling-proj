import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ArrowLeft, RefreshCw, CalendarClock, PowerOff, Loader2,
  Hash, Calendar, CreditCard, Tag, AlertTriangle, CheckCircle2,
  XCircle, Package,
} from 'lucide-react'
import {
  SubscriptionDetail,
  getSubscription, updateNextShipment, deactivateSubscription,
} from '@/api/subscriptionApi'

function fmt(d: string | null | undefined) {
  if (!d || d === '0000-00-00') return '—'
  return new Date(d).toLocaleDateString('sv-SE')
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/60 last:border-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className={`text-xs font-medium ${mono ? 'font-mono' : ''}`}>{value ?? '—'}</span>
    </div>
  )
}

export default function SubscriptionDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [sub, setSub]         = useState<SubscriptionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const [shipmentOpen, setShipmentOpen]     = useState(false)
  const [shipmentDate, setShipmentDate]     = useState('')
  const [shipmentSaving, setShipmentSaving] = useState(false)

  const [deactivateOpen, setDeactivateOpen]     = useState(false)
  const [deactivateReason, setDeactivateReason] = useState('')
  const [deactivateSaving, setDeactivateSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getSubscription(Number(id))
      .then(res => setSub(res.data))
      .catch(() => setError('Subscription not found.'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleUpdateShipment() {
    if (!sub || !shipmentDate) return
    setShipmentSaving(true)
    try {
      const res = await updateNextShipment(sub.id, { next_shipment: shipmentDate })
      setSub(prev => prev ? { ...prev, next_shipment: shipmentDate } : prev)
      toast.success(res.message)
      setShipmentOpen(false)
    } catch {
      toast.error('Failed to update next shipment date.')
    } finally {
      setShipmentSaving(false)
    }
  }

  async function handleDeactivate() {
    if (!sub || !deactivateReason.trim()) return
    setDeactivateSaving(true)
    try {
      const res = await deactivateSubscription(sub.id, { cancel_reason: deactivateReason })
      toast.success(res.message)
      setDeactivateOpen(false)
      navigate(-1)
    } catch {
      toast.error('Failed to deactivate subscription.')
    } finally {
      setDeactivateSaving(false)
    }
  }

  if (loading) return (
    <div className="p-6 space-y-4">
      <Skeleton className="h-28 rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    </div>
  )

  if (error || !sub) return (
    <div className="p-6 space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
        <ArrowLeft className="h-4 w-4 mr-1" /> Back
      </Button>
      <p className="text-sm text-destructive bg-destructive/5 border border-destructive/10 rounded-lg px-5 py-3">
        {error ?? 'Subscription not found.'}
      </p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-full">

      {/* ── Hero header ── */}
      <div className={`px-6 py-5 shrink-0 ${sub.active
        ? 'bg-gradient-to-r from-[#00adef] to-[#0099d4]'
        : 'bg-gradient-to-r from-[#00adef]/70 to-[#0099d4]/70'
      }`}>
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
                <h1 className="text-base font-bold text-white">Subscription #{sub.id}</h1>
                {sub.active
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500 text-white">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-500 text-white">
                      <XCircle className="h-3 w-3" /> Inactive
                    </span>
                }
                {sub.pre_finance_count > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-400/80 text-white">
                    {sub.pre_finance_count} pre-financed
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-white flex-wrap">
                {sub.payment_type && (
                  <span className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    <span className="text-white capitalize">{sub.payment_type}</span>
                  </span>
                )}
                {sub.date_started && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> started {fmt(sub.date_started)}
                  </span>
                )}
                {sub.remote_id && (
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" /> remote: <span className="font-mono text-white">{sub.remote_id}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          {sub.active && (
            <div className="flex items-center gap-2">
              <Button size="sm"
                className="h-8 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white border"
                variant="outline"
                onClick={() => { setShipmentDate(sub.next_shipment ?? ''); setShipmentOpen(true) }}
              >
                <CalendarClock className="h-3.5 w-3.5 mr-1" /> Change Shipment
              </Button>
              <Button size="sm" variant="outline"
                className="h-8 text-xs bg-red-500/20 border-red-300/30 text-white hover:bg-red-500/40 hover:text-white"
                onClick={() => { setDeactivateReason(''); setDeactivateOpen(true) }}
              >
                <PowerOff className="h-3.5 w-3.5 mr-1" /> Deactivate
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Timing card */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-blue-500/10 flex items-center justify-center">
                <CalendarClock className="h-3 w-3 text-blue-600" />
              </div>
              <span className="text-xs font-semibold">Timing</span>
            </div>
            <div className="px-4 py-1">
              <InfoRow label="Date started"   value={fmt(sub.date_started)} />
              <InfoRow label="Next shipment"  value={
                sub.active && sub.next_shipment
                  ? <span className="text-violet-700 font-semibold">{fmt(sub.next_shipment)}</span>
                  : fmt(sub.next_shipment)
              } />
              {!sub.active && (
                <>
                  <InfoRow label="Date cancelled" value={
                    <span className="text-red-600">{fmt(sub.date_cancelled)}</span>
                  } />
                  <InfoRow label="Cancel method"   value={sub.cancel_method} />
                  <InfoRow label="Cancel category" value={sub.cancel_category} />
                </>
              )}
            </div>
          </div>

          {/* Identifiers card */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center gap-2">
              <div className="h-5 w-5 rounded-md bg-violet-500/10 flex items-center justify-center">
                <Tag className="h-3 w-3 text-violet-600" />
              </div>
              <span className="text-xs font-semibold">Identifiers</span>
            </div>
            <div className="px-4 py-1">
              <InfoRow label="Remote ID"   value={sub.remote_id}        mono />
              <InfoRow label="Product ID"  value={sub.subscription_id}  mono />
              <InfoRow label="Payment"     value={sub.payment_type} />
              <InfoRow label="Ref"         value={sub.ref}              mono />
              <InfoRow label="Ref1"        value={sub.ref1}             mono />
              <InfoRow label="Pre-financed orders" value={
                sub.pre_finance_count > 0
                  ? <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700 border border-purple-100">
                      {sub.pre_finance_count}
                    </span>
                  : '0'
              } />
            </div>
          </div>
        </div>

        {/* Cancellation reason — only if inactive */}
        {!sub.active && sub.cancel_reason && (
          <div className="rounded-xl border border-red-200 bg-red-50 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-red-200 flex items-center gap-2">
              <XCircle className="h-3.5 w-3.5 text-red-600" />
              <span className="text-xs font-semibold text-red-700">Cancellation Reason</span>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-red-700 leading-relaxed">{sub.cancel_reason}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Change shipment dialog ── */}
      <Dialog open={shipmentOpen} onOpenChange={v => !shipmentSaving && setShipmentOpen(v)}>
        <DialogContent className="sm:max-w-[360px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Change Next Shipment Date
            </DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">New date *</div>
            <Input
              type="date"
              value={shipmentDate}
              onChange={e => setShipmentDate(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShipmentOpen(false)} disabled={shipmentSaving}>Cancel</Button>
            <Button onClick={handleUpdateShipment} disabled={shipmentSaving || !shipmentDate}>
              {shipmentSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Deactivate dialog ── */}
      <Dialog open={deactivateOpen} onOpenChange={v => !deactivateSaving && setDeactivateOpen(v)}>
        <DialogContent className="sm:max-w-[400px]" showCloseButton={false}>
          <DialogHeader className="flex flex-col items-center text-center py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 ring-4 ring-red-200 mb-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-base">Deactivate Subscription #{sub.id}</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">This will mark the subscription as inactive.</p>
          </DialogHeader>
          <div className="py-2 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Reason *</div>
            <textarea
              value={deactivateReason}
              onChange={e => setDeactivateReason(e.target.value)}
              placeholder="e.g. Customer requested cancellation"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={() => setDeactivateOpen(false)} disabled={deactivateSaving}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={deactivateSaving || !deactivateReason.trim()}>
              {deactivateSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

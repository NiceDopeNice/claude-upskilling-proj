import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, CalendarClock, PowerOff } from 'lucide-react'
import {
  SubscriptionDetail,
  getSubscription, updateNextShipment, deactivateSubscription,
} from '@/api/subscriptionApi'

interface Props {
  readonly subId: number | null
  readonly onClose: () => void
}

function fmt(d: string | null | undefined) {
  if (!d || d === '0000-00-00') return '—'
  return new Date(d).toLocaleDateString('sv-SE')
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 pr-4">{label}</span>
      <span className="text-xs font-medium text-right">{value ?? '—'}</span>
    </div>
  )
}

export function SubscriptionDetailSheet({ subId, onClose }: Props) {
  const [sub, setSub]         = useState<SubscriptionDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const [shipmentOpen, setShipmentOpen]     = useState(false)
  const [shipmentDate, setShipmentDate]     = useState('')
  const [shipmentSaving, setShipmentSaving] = useState(false)

  const [deactivateOpen, setDeactivateOpen]     = useState(false)
  const [deactivateReason, setDeactivateReason] = useState('')
  const [deactivateSaving, setDeactivateSaving] = useState(false)

  useEffect(() => {
    if (!subId) { setSub(null); return }
    setLoading(true)
    setError(null)
    getSubscription(subId)
      .then(res => setSub(res.data))
      .catch(() => setError('Failed to load subscription.'))
      .finally(() => setLoading(false))
  }, [subId])

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
      onClose()
    } catch {
      toast.error('Failed to deactivate subscription.')
    } finally {
      setDeactivateSaving(false)
    }
  }

  return (
    <>
      <Sheet open={subId !== null} onOpenChange={v => !v && onClose()}>
        <SheetContent side="right" className="w-[420px] sm:w-[440px] flex flex-col gap-0 p-0">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <SheetTitle className="text-base">Subscription #{subId}</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : error ? (
              <p className="text-sm text-destructive bg-destructive/5 border border-destructive/10 rounded-lg px-4 py-3">{error}</p>
            ) : sub ? (
              <div className="space-y-1">
                <FieldRow label="Status"
                  value={sub.active
                    ? <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700 border border-green-100">Active</span>
                    : <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border">Inactive</span>
                  }
                />
                <FieldRow label="Payment type"  value={sub.payment_type} />
                <FieldRow label="Remote ID"     value={sub.remote_id} />
                <FieldRow label="Product (ID)"  value={sub.subscription_id} />
                <FieldRow label="Next shipment" value={fmt(sub.next_shipment)} />
                <FieldRow label="Date started"  value={fmt(sub.date_started)} />
                {!sub.active && (
                  <>
                    <FieldRow label="Date cancelled" value={fmt(sub.date_cancelled)} />
                    <FieldRow label="Cancel reason"  value={sub.cancel_reason} />
                    <FieldRow label="Cancel method"  value={sub.cancel_method} />
                    <FieldRow label="Cancel category" value={sub.cancel_category} />
                  </>
                )}
                <FieldRow label="Ref"  value={sub.ref} />
                <FieldRow label="Ref1" value={sub.ref1} />
                <FieldRow
                  label="Pre-finance orders"
                  value={
                    sub.pre_finance_count > 0
                      ? <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700 border border-purple-100">{sub.pre_finance_count}</span>
                      : '0'
                  }
                />
              </div>
            ) : null}
          </div>

          {/* Action buttons */}
          {sub?.active && (
            <div className="border-t border-border px-6 py-4 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setShipmentDate(sub.next_shipment ?? ''); setShipmentOpen(true) }}
                className="flex-1"
              >
                <CalendarClock className="h-3.5 w-3.5 mr-1" /> Change Shipment Date
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => { setDeactivateReason(''); setDeactivateOpen(true) }}
                className="flex-1"
              >
                <PowerOff className="h-3.5 w-3.5 mr-1" /> Deactivate
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Change next shipment dialog */}
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

      {/* Deactivate dialog */}
      <Dialog open={deactivateOpen} onOpenChange={v => !deactivateSaving && setDeactivateOpen(v)}>
        <DialogContent className="sm:max-w-[400px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PowerOff className="h-4 w-4 text-red-500" /> Deactivate Subscription
            </DialogTitle>
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
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeactivateOpen(false)} disabled={deactivateSaving}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeactivate} disabled={deactivateSaving || !deactivateReason.trim()}>
              {deactivateSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

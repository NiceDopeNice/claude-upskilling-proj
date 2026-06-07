import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { History, X, Loader2 } from 'lucide-react'
import { CustomerChangeBatch, getCustomerChanges } from '@/api/customerApi'

function formatDate(val: string | null) {
  if (!val) return '—'
  return new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fieldLabel(field: string) {
  return field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function displayValue(value: string | null) {
  if (value === null || value === '') return <span className="italic text-muted-foreground/50">empty</span>
  if (value === '1' || value === 'true')  return <span className="font-semibold">Yes</span>
  if (value === '0' || value === 'false') return <span className="font-semibold">No</span>
  return <span className="font-mono truncate" title={value}>{value}</span>
}

function actionColor(action: string | null) {
  switch (action?.toLowerCase()) {
    case 'update': return 'bg-blue-100 text-blue-700'
    case 'create': return 'bg-green-100 text-green-700'
    case 'delete': return 'bg-red-100 text-red-600'
    default:       return 'bg-muted text-muted-foreground'
  }
}

function BatchCard({ batch }: { batch: CustomerChangeBatch }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* batch header */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-muted/40 border-b border-border/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded-full bg-muted-foreground/15 flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-muted-foreground uppercase">
              {(batch.initiator ?? 'SY').slice(0, 2)}
            </span>
          </div>
          <span className="text-xs font-semibold text-foreground truncate">
            {batch.initiator ?? 'System'}
          </span>
          {batch.action && (
            <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md ${actionColor(batch.action)}`}>
              {batch.action}
            </span>
          )}
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
          {formatDate(batch.changed_at)}
        </span>
      </div>

      {/* fields */}
      <div className="divide-y divide-border/50">
        {batch.fields.map((f, i) => (
          <div key={i} className="grid grid-cols-[auto_1fr] items-start gap-3 px-4 py-2.5 text-xs">
            <span className="text-muted-foreground pt-1 whitespace-nowrap">
              {fieldLabel(f.field)}
            </span>
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-center rounded-md bg-red-50 border border-red-100 px-2 py-1 text-red-700 overflow-hidden">
                <span className="text-[11px] truncate">{displayValue(f.old_value)}</span>
              </div>
              <div className="flex items-center rounded-md bg-green-50 border border-green-100 px-2 py-1 text-green-700 overflow-hidden">
                <span className="text-[11px] truncate">{displayValue(f.new_value)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CustomerChangesPanel({ open, onClose, customerId, customerName }: {
  open: boolean
  onClose: () => void
  customerId: number
  customerName: string
}) {
  const [batches, setBatches] = useState<CustomerChangeBatch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError(null)
    getCustomerChanges(customerId)
      .then(res => setBatches(res.data))
      .catch(() => setError('Failed to load changes.'))
      .finally(() => setLoading(false))
  }, [open, customerId])

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-[998] bg-black/20 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`fixed top-4 right-0 bottom-4 w-[400px] max-h-[calc(100vh-2rem)] z-[999] bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out rounded-l-2xl overflow-hidden ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <History className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <div className="text-sm font-semibold leading-tight">Customer Changes</div>
              <div className="text-[11px] text-muted-foreground leading-tight">{customerName}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!loading && batches.length > 0 && (
              <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {batches.length} {batches.length === 1 ? 'change' : 'changes'}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && (
            <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Loading changes…</span>
            </div>
          )}
          {error && (
            <p className="text-xs text-destructive bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {!loading && !error && batches.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <History className="h-8 w-8 opacity-20" />
              <span className="text-xs">No changes recorded.</span>
            </div>
          )}
          {batches.map(batch => (
            <BatchCard key={batch.batch_id} batch={batch} />
          ))}
        </div>
      </div>
    </>,
    document.body,
  )
}

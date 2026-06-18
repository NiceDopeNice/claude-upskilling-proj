import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { AppSelect, SelectOption } from '@/components/AppSelect'
import { toast } from 'sonner'
import { Plus, Ban, Loader2 } from 'lucide-react'
import {
  InsurancePolicyResource, InsuranceProduct, InsuranceRelationship,
  getInsurancePolicies, createInsurancePolicy, cancelInsurancePolicy,
} from '@/api/insurancePolicyApi'

interface Props {
  readonly customerId: number
}

const PRODUCT_OPTIONS: SelectOption[] = [
  { value: 'id-protect',        label: 'ID Protect' },
  { value: 'id-protect-single', label: 'ID Protect Single' },
  { value: 'id-protect-duo',    label: 'ID Protect Duo' },
  { value: 'id-protect-family', label: 'ID Protect Family' },
]

const RELATIONSHIP_OPTIONS: SelectOption[] = [
  { value: 'self',        label: 'Self' },
  { value: 'spouse',      label: 'Spouse' },
  { value: 'child',       label: 'Child' },
  { value: 'parent',      label: 'Parent' },
  { value: 'sibling',     label: 'Sibling' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'grandchild',  label: 'Grandchild' },
  { value: 'friend',      label: 'Friend' },
  { value: 'other',       label: 'Other' },
]

const TH = 'bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3'

function fmt(d: string | null | undefined) {
  return d ? new Date(d).toLocaleDateString('sv-SE') : '—'
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ACTIVE')   return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700 border border-green-100">Active</span>
  if (status === 'CANCELED') return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 border border-red-100">Cancelled</span>
  if (status === 'PENDING')  return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-100">Pending</span>
  return <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground border border-border">{status}</span>
}

export function InsurancePoliciesPanel({ customerId }: Props) {
  const [policies, setPolicies]   = useState<InsurancePolicyResource[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const [createOpen, setCreateOpen]     = useState(false)
  const [createSaving, setCreateSaving] = useState(false)
  const [createForm, setCreateForm]     = useState({ product: '' as InsuranceProduct | '', start_date: '', end_date: '', relationship: '' as InsuranceRelationship | '' })

  const [cancelTarget, setCancelTarget]   = useState<InsurancePolicyResource | null>(null)
  const [cancelReason, setCancelReason]   = useState('')
  const [cancelSaving, setCancelSaving]   = useState(false)

  function load() {
    setLoading(true)
    setError(null)
    getInsurancePolicies(customerId)
      .then(res => setPolicies(res.data))
      .catch(() => setError('Failed to load insurance policies.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [customerId])

  async function handleCreate() {
    if (!createForm.product || !createForm.start_date) return
    setCreateSaving(true)
    try {
      const res = await createInsurancePolicy(customerId, {
        product:      createForm.product as InsuranceProduct,
        start_date:   createForm.start_date,
        end_date:     createForm.end_date || undefined,
        relationship: createForm.relationship as InsuranceRelationship || undefined,
      })
      setPolicies(prev => [res.data, ...prev])
      setCreateOpen(false)
      setCreateForm({ product: '', start_date: '', end_date: '', relationship: '' })
      toast.success(res.message)
    } catch {
      toast.error('Failed to create policy.')
    } finally {
      setCreateSaving(false)
    }
  }

  async function handleCancel() {
    if (!cancelTarget || !cancelReason.trim()) return
    setCancelSaving(true)
    try {
      const res = await cancelInsurancePolicy(customerId, cancelTarget.id, { reason: cancelReason })
      setPolicies(prev => prev.map(p => p.id === res.data.id ? res.data : p))
      setCancelTarget(null)
      setCancelReason('')
      toast.success(res.message)
    } catch {
      toast.error('Failed to cancel policy.')
    } finally {
      setCancelSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-5 py-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Insurance Policies</h3>
        <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> New Policy
        </Button>
      </div>

      {error && (
        <p className="text-xs text-destructive px-5 py-3 bg-destructive/5 border-b border-destructive/10">{error}</p>
      )}

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/40">
            <TableHead className={TH}>Product</TableHead>
            <TableHead className={TH}>Start date</TableHead>
            <TableHead className={TH}>Status</TableHead>
            <TableHead className={TH}>Ref</TableHead>
            <TableHead className={TH} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <TableCell key={j} className="py-3"><Skeleton className="h-3.5 w-full" /></TableCell>
                ))}
              </TableRow>
            ))
          ) : policies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                No insurance policies
              </TableCell>
            </TableRow>
          ) : (
            policies.map(p => (
              <TableRow key={p.id} className="hover:bg-muted/40">
                <TableCell className="py-3 text-xs font-medium capitalize">{p.product?.replace(/-/g, ' ') ?? '—'}</TableCell>
                <TableCell className="py-3 whitespace-nowrap">{fmt(p.start_date)}</TableCell>
                <TableCell className="py-3"><StatusBadge status={p.status} /></TableCell>
                <TableCell className="py-3 font-mono text-xs text-muted-foreground">{p.partner_reference ?? '—'}</TableCell>
                <TableCell className="py-3 text-right">
                  {(p.status === 'ACTIVE' || p.status === 'PENDING') && (
                    <button
                      type="button"
                      onClick={() => { setCancelTarget(p); setCancelReason('') }}
                      className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700 px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                    >
                      <Ban className="h-3 w-3" /> Cancel
                    </button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Create Policy dialog */}
      <Dialog open={createOpen} onOpenChange={v => !createSaving && setCreateOpen(v)}>
        <DialogContent className="sm:max-w-[440px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4 text-primary" /> New Insurance Policy
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Product *</div>
              <AppSelect
                options={PRODUCT_OPTIONS}
                value={PRODUCT_OPTIONS.find(o => o.value === createForm.product) ?? null}
                onChange={opt => setCreateForm(f => ({ ...f, product: opt ? (opt as SelectOption).value as InsuranceProduct : '' }))}
                placeholder="Select product…"
              />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Start Date *</div>
              <Input type="date" value={createForm.start_date} onChange={e => setCreateForm(f => ({ ...f, start_date: e.target.value }))} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">End Date</div>
              <Input type="date" value={createForm.end_date} onChange={e => setCreateForm(f => ({ ...f, end_date: e.target.value }))} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Relationship</div>
              <AppSelect
                options={RELATIONSHIP_OPTIONS}
                value={RELATIONSHIP_OPTIONS.find(o => o.value === createForm.relationship) ?? null}
                onChange={opt => setCreateForm(f => ({ ...f, relationship: opt ? (opt as SelectOption).value as InsuranceRelationship : '' }))}
                placeholder="Select relationship…"
                isClearable
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={createSaving}>Cancel</Button>
            <Button onClick={handleCreate} disabled={createSaving || !createForm.product || !createForm.start_date}>
              {createSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Create Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Policy dialog */}
      <Dialog open={cancelTarget !== null} onOpenChange={v => { if (!v && !cancelSaving) { setCancelTarget(null); setCancelReason('') } }}>
        <DialogContent className="sm:max-w-[420px]" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Ban className="h-4 w-4 text-red-500" /> Cancel Policy
            </DialogTitle>
            {cancelTarget && (
              <p className="text-xs text-muted-foreground mt-1">
                {cancelTarget.product?.replace(/-/g, ' ')} — started {fmt(cancelTarget.start_date)}
              </p>
            )}
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
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setCancelTarget(null); setCancelReason('') }} disabled={cancelSaving}>Back</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelSaving || !cancelReason.trim()}>
              {cancelSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Cancel Policy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { ConfirmDialog } from '@/pages/Gdpr/components/ConfirmDialog'
import { createBlockedSsn } from '@/api/blockedSsnApi'
import { useBlockedSsn } from '@/hooks/useBlockedSsn'
import { formatDate, buildPageButtons } from '@/lib/formatters'
import {
  Search, X, Plus, Trash2, ChevronLeft, ChevronRight, ShieldX,
} from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

/* ── Add SSN dialog ── */

interface AddSsnDialogProps {
  readonly open: boolean
  readonly onAdded: () => void
  readonly onClose: () => void
}

function AddSsnDialog({ open, onAdded, onClose }: AddSsnDialogProps) {
  const [ssn, setSsn]               = useState('')
  const [reason, setReason]         = useState('')
  const [confirming, setConfirming] = useState(false)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  function reset() { setSsn(''); setReason(''); setError(null) }

  function handleClose() {
    if (saving) return
    reset()
    onClose()
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!ssn.trim()) { setError('SSN is required.'); return }
    setError(null)
    setConfirming(true)
  }

  async function confirm() {
    setSaving(true)
    try {
      await createBlockedSsn({ ssn: ssn.trim(), reason: reason.trim() || undefined })
      reset()
      onAdded()
    } catch (err: unknown) {
      setConfirming(false)
      setError(err instanceof Error ? err.message : 'Failed to add SSN.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Dialog open={open && !confirming} onOpenChange={v => !v && handleClose()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Blocked SSN</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                SSN <span className="text-destructive">*</span>
              </label>
              <Input
                placeholder="e.g. 19810101-1234"
                value={ssn}
                onChange={e => setSsn(e.target.value)}
                className="font-mono"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Reason</label>
              <Textarea
                placeholder="Why is this SSN blocked? (optional)"
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>
            {error && (
              <p className="text-xs text-destructive bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2">{error}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit">
                Add to blocked list
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirming}
        title="Block this SSN?"
        description={`Are you sure about blocking all future orders for SSN: ${ssn.trim()}?`}
        confirmLabel="Yes, block"
        destructive
        loading={saving}
        onConfirm={confirm}
        onCancel={() => setConfirming(false)}
      />
    </>
  )
}

/* ── Page ── */

export default function BlockedSsnPage() {
  const [perPage, setPerPage] = useState(() =>
    Math.max(10, Math.floor((window.innerHeight - 380) / 44))
  )
  const {
    data, loading, deleting,
    searchInput, setSearchInput,
    page, setPage,
    refresh, deleteRecord,
  } = useBlockedSsn(perPage)

  const [showAdd, setShowAdd]             = useState(false)
  const [pendingDelete, setPendingDelete] = useState<{ id: number; ssn: string } | null>(null)

  const rows = data?.data ?? []
  const meta = data?.meta ?? null

  async function handleDelete() {
    if (!pendingDelete) return
    await deleteRecord(pendingDelete.id)
    setPendingDelete(null)
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-8 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldX className="h-6 w-6 text-destructive" />
            Blocked SSN
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            SSNs on this list are blocked from registering or being processed.
          </p>
        </div>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <Button size="sm" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Add SSN
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add SSN</TooltipContent>
        </Tooltip>
      </div>

      {/* Search */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search SSN or reason…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="pl-9 h-9 bg-background"
          />
          {searchInput && (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Clear</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/40">
              <TableHead className="bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">SSN</TableHead>
              <TableHead className="bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Reason</TableHead>
              <TableHead className="bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Initiator</TableHead>
              <TableHead className="bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Date Added</TableHead>
              <TableHead className="bg-muted w-10 py-3" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 && (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            )}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No blocked SSNs found.
                </TableCell>
              </TableRow>
            )}

            {rows.map(row => (
              <TableRow key={row.id}>
                <TableCell className="font-mono text-sm font-medium">{row.ssn}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.reason || '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{row.initiator || '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(row.date_added)}</TableCell>
                <TableCell>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setPendingDelete({ id: row.id, ssn: row.ssn })}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Remove</TooltipContent>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Bottom bar */}
      {meta && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {meta.total > 0
              ? `Showing ${(meta.current_page - 1) * meta.per_page + 1}–${Math.min(meta.current_page * meta.per_page, meta.total)} of ${meta.total}`
              : 'No results'}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs whitespace-nowrap">Rows per page</span>
              <Select value={String(perPage)} onValueChange={v => { setPerPage(Number(v)); setPage(1) }}>
                <SelectTrigger className="h-8 w-[72px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Array.from(new Set([10, 20, 25, 50, 100, perPage])).sort((a, b) => a - b).map(n => (
                    <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {meta.last_page > 1 && (
              <div className="flex items-center gap-1">
                <button
                  className="h-8 w-8 rounded-md border border-border hover:bg-muted disabled:opacity-40 transition-colors flex items-center justify-center"
                  disabled={meta.current_page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {buildPageButtons(meta.current_page, meta.last_page).map((p, i) =>
                  p === '...'
                    ? <span key={`e-${i}`} className="h-8 w-8 flex items-center justify-center text-xs">…</span>
                    : <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`h-8 w-8 rounded-md text-xs font-medium flex items-center justify-center transition-colors ${
                          p === meta.current_page ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-muted'
                        }`}
                      >{p}</button>
                )}
                <button
                  className="h-8 w-8 rounded-md border border-border hover:bg-muted disabled:opacity-40 transition-colors flex items-center justify-center"
                  disabled={meta.current_page === meta.last_page}
                  onClick={() => setPage(p => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add SSN dialog */}
      <AddSsnDialog
        open={showAdd}
        onAdded={() => { setShowAdd(false); refresh() }}
        onClose={() => setShowAdd(false)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!pendingDelete}
        title="Remove blocked SSN"
        description={`Remove "${pendingDelete?.ssn}" from the blocked list? This SSN will no longer be blocked.`}
        confirmLabel="Remove"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

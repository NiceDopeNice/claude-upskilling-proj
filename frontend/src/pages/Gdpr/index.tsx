import { useState } from 'react'
import { useGdpr } from '@/hooks/useGdpr'
import { GdprExclusionType, GdprStatus } from '@/api/gdprApi'
import { formatDate, buildPageButtons } from '@/lib/formatters'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AppSelect, SelectOption } from '@/components/AppSelect'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GdprStatusBadge } from './components/GdprStatusBadge'
import { BulkActionBar } from './components/BulkActionBar'
import { ConfirmDialog } from './components/ConfirmDialog'
import {
  MoreHorizontal, ChevronLeft, ChevronRight,
  Search, X, Filter, EyeOff, RotateCcw, Ban, ShieldX,
} from 'lucide-react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'

const ACTION_LABELS: Record<string, string> = {
  anonymize: 'Anonymize',
  restore:   'Restore',
  reject:    'Reject',
  unflag:    'Remove from GDPR',
}

const EXCLUSION_TYPE_LABELS: Record<GdprExclusionType, string> = {
  '2y_after_starter': '2y After Starter',
  'subscription_end': 'Subscription End',
}

const STATUS_OPTIONS: { value: GdprStatus | ''; label: string }[] = [
  { value: '',               label: 'All statuses' },
  { value: 'flagged',        label: 'Flagged' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'anonymized',     label: 'Anonymized' },
  { value: 'restored',       label: 'Restored' },
  { value: 'rejected',       label: 'Rejected' },
]

const TYPE_OPTIONS: { value: GdprExclusionType | ''; label: string }[] = [
  { value: '',                 label: 'All types' },
  { value: '2y_after_starter', label: '2y After Starter' },
  { value: 'subscription_end', label: 'Subscription End' },
]

export default function GdprPage() {
  const [perPage, setPerPage] = useState(() =>
    Math.max(10, Math.floor((window.innerHeight - 480) / 48))
  )
  const {
    data, loading, exclusionTypes,
    search, setSearch,
    statusFilter, setStatusFilter,
    typeFilter, setTypeFilter,
    page, setPage,
    selected, toggleSelect, toggleSelectAll, clearSelected,
    pendingAction, actionLoading,
    confirmSingle, confirmBulk, cancelAction, executeAction,
  } = useGdpr(perPage)

  const rows = data?.data ?? []
  const meta = data?.meta ?? null

  const selectedStatuses = rows
    .filter(r => selected.has(r.customer_id))
    .map(r => r.status)

  const allSelected = rows.length > 0 && rows.every(r => selected.has(r.customer_id))

  // build confirm dialog text from the pending action
  function buildConfirmText(): { title: string; description: string; destructive: boolean } {
    if (!pendingAction) return { title: '', description: '', destructive: false }
    const label = ACTION_LABELS[pendingAction.action] ?? pendingAction.action
    if (pendingAction.type === 'single') {
      return {
        title:       `${label} — ${pendingAction.customerName}`,
        description: `Are you sure you want to ${label.toLowerCase()} this customer? This action cannot be undone.`,
        destructive: pendingAction.action === 'anonymize' || pendingAction.action === 'unflag',
      }
    }
    return {
      title:       `Bulk ${label}`,
      description: `Apply "${label}" to ${pendingAction.customerIds.length} selected customer(s)?`,
      destructive: pendingAction.action === 'anonymize' || pendingAction.action === 'unflag',
    }
  }

  const { title: confirmTitle, description: confirmDesc, destructive: confirmDestructive } = buildConfirmText()

  return (
    <div className="px-5 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight">GDPR Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage customer data exclusion, anonymization, and restoration.</p>
        </div>
      </div>

      {/* Filters */}
      {(() => {
        const activeCount = [search, statusFilter, typeFilter].filter(Boolean).length
        function clearAll() { setSearch(''); setStatusFilter(''); setTypeFilter(''); setPage(1) }
        return (
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Filter className="h-4 w-4 text-muted-foreground" />
                Filters
                {activeCount > 0 && (
                  <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {activeCount}
                  </span>
                )}
              </div>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Name, email or ID…"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    className="pl-9 h-9 bg-background"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => { setSearch(''); setPage(1) }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                <AppSelect
                  options={STATUS_OPTIONS.map(o => ({ value: o.value || '__all', label: o.label }))}
                  value={STATUS_OPTIONS.map(o => ({ value: o.value || '__all', label: o.label })).find(o => o.value === (statusFilter || '__all')) ?? null}
                  onChange={opt => { setStatusFilter((opt as SelectOption).value === '__all' ? '' : (opt as SelectOption).value as GdprStatus); setPage(1) }}
                  isSearchable={false}
                />
              </div>

              {/* Exclusion Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exclusion Type</label>
                <AppSelect
                  options={TYPE_OPTIONS.map(o => ({ value: o.value || '__all', label: o.label }))}
                  value={TYPE_OPTIONS.map(o => ({ value: o.value || '__all', label: o.label })).find(o => o.value === (typeFilter || '__all')) ?? null}
                  onChange={opt => { setTypeFilter((opt as SelectOption).value === '__all' ? '' : (opt as SelectOption).value as GdprExclusionType); setPage(1) }}
                  isSearchable={false}
                />
              </div>
            </div>
          </div>
        )
      })()}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <BulkActionBar
          selectedCount={selected.size}
          selectedStatuses={selectedStatuses}
          loading={actionLoading}
          onAction={confirmBulk}
          onClear={clearSelected}
        />
      )}

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/40">
              <TableHead className="bg-muted w-10 py-3">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Customer</TableHead>
              <TableHead className="bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Status</TableHead>
              <TableHead className="bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Exclusion Type</TableHead>
              <TableHead className="bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Flagged</TableHead>
              <TableHead className="bg-muted text-xs font-semibold uppercase tracking-wide text-muted-foreground py-3">Anonymized</TableHead>
              <TableHead className="bg-muted w-10 py-3" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && rows.length === 0 && (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            )}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No GDPR records found.
                </TableCell>
              </TableRow>
            )}

            {rows.map(row => (
              <TableRow key={row.id} className={`transition-colors hover:bg-muted/40 ${selected.has(row.customer_id) ? 'bg-muted/40' : ''}`}>
                <TableCell>
                  <Checkbox
                    checked={selected.has(row.customer_id)}
                    onCheckedChange={() => toggleSelect(row.customer_id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm">{row.customer_name || '—'}</div>
                  <div className="text-xs text-muted-foreground">#{row.customer_id} · {row.customer_email || '—'}</div>
                </TableCell>
                <TableCell><GdprStatusBadge status={row.status} /></TableCell>
                <TableCell className="text-sm">{EXCLUSION_TYPE_LABELS[row.exclusion_type] ?? row.exclusion_type}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(row.flagged_at)}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{formatDate(row.anonymized_at)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-1.5 rounded hover:bg-muted transition-colors">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {['flagged', 'pending_review'].includes(row.status) && (
                        <DropdownMenuItem onClick={() => confirmSingle('anonymize', row.customer_id, row.customer_name)} className="gap-2">
                          <EyeOff className="h-4 w-4 text-muted-foreground" /> Anonymize
                        </DropdownMenuItem>
                      )}
                      {row.status === 'anonymized' && (
                        <DropdownMenuItem onClick={() => confirmSingle('restore', row.customer_id, row.customer_name)} className="gap-2">
                          <RotateCcw className="h-4 w-4 text-muted-foreground" /> Restore
                        </DropdownMenuItem>
                      )}
                      {['flagged', 'pending_review', 'restored'].includes(row.status) && (
                        <DropdownMenuItem onClick={() => confirmSingle('reject', row.customer_id, row.customer_name)} className="gap-2">
                          <Ban className="h-4 w-4 text-muted-foreground" /> Reject
                        </DropdownMenuItem>
                      )}
                      {row.status === 'rejected' && (
                        <DropdownMenuItem onClick={() => confirmSingle('reject', row.customer_id, row.customer_name)} className="gap-2" disabled>
                          <Ban className="h-4 w-4" /> Rejected
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive"
                        onClick={() => confirmSingle('unflag', row.customer_id, row.customer_name)}
                      >
                        <ShieldX className="h-4 w-4" /> Remove from GDPR
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

      {/* Confirm action dialog */}
      <ConfirmDialog
        open={!!pendingAction}
        title={confirmTitle}
        description={confirmDesc}
        confirmLabel={ACTION_LABELS[pendingAction?.action ?? ''] ?? 'Confirm'}
        destructive={confirmDestructive}
        loading={actionLoading}
        onConfirm={executeAction}
        onCancel={cancelAction}
      />
    </div>
  )
}

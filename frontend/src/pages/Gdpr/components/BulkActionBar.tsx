import { GdprBulkAction, GdprStatus } from '@/api/gdprApi'
import { Button } from '@/components/ui/button'
import { EyeOff, RotateCcw, Ban, ShieldX, X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ActionDef {
  action: GdprBulkAction
  label: string
  icon: LucideIcon
  destructive?: boolean
}

function getAvailableActions(statuses: GdprStatus[]): ActionDef[] {
  const unique = [...new Set(statuses)]
  if (unique.length === 0) return []

  // Determine actions valid for ALL selected statuses
  const allFlagged        = unique.every(s => s === 'flagged')
  const allPendingReview  = unique.every(s => s === 'pending_review')
  const allAnonymized     = unique.every(s => s === 'anonymized')
  const allRestored       = unique.every(s => s === 'restored')
  const allRejected       = unique.every(s => s === 'rejected')
  const allCanReview      = unique.every(s => ['flagged', 'pending_review'].includes(s))
  const allCanUnflag      = unique.every(s => ['flagged', 'restored', 'rejected'].includes(s))

  const actions: ActionDef[] = []

  if (allCanReview)    actions.push({ action: 'anonymize', label: 'Anonymize',       icon: EyeOff })
  if (allAnonymized)   actions.push({ action: 'restore',   label: 'Restore',         icon: RotateCcw })
  if (allCanReview || allRejected || allRestored) {
    actions.push({ action: 'reject', label: 'Reject', icon: Ban })
  }
  if (allCanUnflag)    actions.push({ action: 'unflag', label: 'Remove from GDPR', icon: ShieldX, destructive: true })

  return actions
}

interface Props {
  selectedCount: number
  selectedStatuses: GdprStatus[]
  loading: boolean
  onAction: (action: GdprBulkAction) => void
  onClear: () => void
}

export function BulkActionBar({ selectedCount, selectedStatuses, loading, onAction, onClear }: Props) {
  const actions = getAvailableActions(selectedStatuses)

  if (selectedCount === 0) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border bg-card shadow-sm">
      <span className="text-sm font-medium text-muted-foreground">
        {selectedCount} selected
      </span>
      <div className="h-4 w-px bg-border" />
      <div className="flex items-center gap-2 flex-wrap">
        {actions.map(a => (
          <Button
            key={a.action}
            size="sm"
            variant={a.destructive ? 'destructive' : 'outline'}
            onClick={() => onAction(a.action)}
            disabled={loading}
            className="gap-1.5"
          >
            <a.icon className="h-3.5 w-3.5" />
            {a.label}
          </Button>
        ))}
        {actions.length === 0 && (
          <span className="text-xs text-muted-foreground">No bulk actions available for this selection.</span>
        )}
      </div>
      <div className="flex-1" />
      <button
        type="button"
        onClick={onClear}
        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

import { GdprStatus } from '@/api/gdprApi'

const CONFIG: Record<GdprStatus, { label: string; className: string }> = {
  flagged:        { label: 'Flagged',        className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  pending_review: { label: 'Pending Review', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  anonymized:     { label: 'Anonymized',     className: 'bg-green-50 text-green-700 border-green-200' },
  restored:       { label: 'Restored',       className: 'bg-purple-50 text-purple-700 border-purple-200' },
  rejected:       { label: 'Rejected',       className: 'bg-red-50 text-red-700 border-red-200' },
}

export function GdprStatusBadge({ status }: { status: GdprStatus }) {
  const cfg = CONFIG[status] ?? { label: status, className: 'bg-muted text-muted-foreground border-border' }
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  )
}

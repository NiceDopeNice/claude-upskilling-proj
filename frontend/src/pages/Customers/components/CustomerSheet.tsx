import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import {
  PhoneOff,
  AlertOctagon,
  Ban,
  MailX,
  ShieldOff,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Hash,
} from 'lucide-react'
import { Customer, CustomerDetail, getCustomer } from '@/api/customerApi'

/* ── helpers ── */

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
  return (
    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
      <span className="text-base font-bold text-primary">{initials}</span>
    </div>
  )
}

function SectionHeading({ title }: { title: string }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 pt-3 pb-1">
      {title}
    </p>
  )
}

function FieldGrid({ rows }: { rows: { label: string; value: React.ReactNode; mono?: boolean }[] }) {
  const visible = rows.filter(r => r.value !== null && r.value !== undefined && r.value !== '')
  if (visible.length === 0) return null
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-border/50">
          {visible.map(row => (
            <tr key={row.label} className="hover:bg-muted/20 transition-colors">
              <td className="px-3 py-1.5 text-[11px] text-muted-foreground whitespace-nowrap w-28 align-top pt-2">
                {row.label}
              </td>
              <td className={`px-3 py-1.5 text-xs font-medium break-all ${row.mono ? 'font-mono' : ''}`}>
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface FlagItem {
  icon: React.ElementType
  label: string
  active: boolean
  activeColor: string
}

function FlagChip({ icon: Icon, label, active, activeColor }: FlagItem) {
  return (
    <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium border transition-colors ${
      active
        ? `${activeColor} border-current/20`
        : 'text-muted-foreground/50 border-border bg-transparent'
    }`}>
      {active
        ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        : <XCircle className="h-3.5 w-3.5 shrink-0" />
      }
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="px-5 py-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-xl" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-3 w-16 mt-4" />
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  )
}

/* ── main ── */

interface Props {
  customer: Customer | null
  open: boolean
  onClose: () => void
}

export function CustomerSheet({ customer, open, onClose }: Props) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !customer) return
    setLoading(true)
    setDetail(null)
    Promise.all([
      getCustomer(customer.id),
      new Promise<void>(resolve => setTimeout(resolve, 500)),
    ])
      .then(([res]) => setDetail(res.data))
      .catch(() => setDetail(null))
      .finally(() => setLoading(false))
  }, [customer?.id, open])

  const fullName = customer ? `${customer.first_name} ${customer.last_name}` : ''

  const flags: FlagItem[] = detail ? [
    { icon: PhoneOff,    label: 'Do Not Call',      active: detail.do_not_call,       activeColor: 'text-red-600 bg-red-50' },
    { icon: AlertOctagon,label: 'Difficult',         active: detail.difficult_customer,activeColor: 'text-orange-600 bg-orange-50' },
    { icon: Ban,         label: 'Blocked Fees',      active: detail.blocked_fees,      activeColor: 'text-red-600 bg-red-50' },
    { icon: MailX,       label: 'Block Email',       active: detail.block_email,       activeColor: 'text-amber-600 bg-amber-50' },
    { icon: ShieldOff,   label: 'Block GDPR',        active: detail.block_gdpr,        activeColor: 'text-purple-600 bg-purple-50' },
    { icon: ShieldAlert, label: 'Block Direct Mail', active: detail.block_dm,          activeColor: 'text-amber-600 bg-amber-50' },
  ] : []

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-[380px] sm:w-[420px] sm:max-w-none flex flex-col p-0 overflow-hidden">

        {/* ── Header ── */}
        <div className="border-b border-border px-5 py-5 shrink-0 bg-gradient-to-b from-muted/40 to-background">
          <SheetHeader>
            <SheetTitle render={<div className="flex items-center gap-4" />}>
              <Avatar name={fullName || '?'} />
              <div className="min-w-0">
                <p className="text-xl font-bold leading-tight truncate">{fullName}</p>
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground/70">{customer?.customer_no}</span>
                </p>
              </div>
            </SheetTitle>
          </SheetHeader>
        </div>

        {/* ── Scrollable body ── */}
        {loading ? (
          <LoadingSkeleton />
        ) : detail ? (
          <div className="flex-1 overflow-y-auto px-5 pb-5">

            <SectionHeading title="Contact" />
            <FieldGrid rows={[
              { label: 'Email',       value: detail.email },
              { label: 'Alt. Email',  value: detail.alternative_email },
              { label: 'Phone',       value: detail.tel },
              { label: 'Alt. Phone',  value: detail.alternative_tel },
              { label: 'SSN',         value: detail.pers_nr, mono: true },
              { label: 'Member since',value: detail.date_added
                  ? new Date(detail.date_added).toLocaleDateString('sv-SE')
                  : null },
            ]} />

            <SectionHeading title="Address" />
            <FieldGrid rows={[
              { label: 'Street',      value: detail.adress },
              { label: 'Postal/City', value: [detail.post_nr, detail.ort].filter(Boolean).join('  ') || null },
              { label: 'Region',      value: detail.region_code },
            ]} />

            <SectionHeading title="Flags" />
            <div className="grid grid-cols-2 gap-1.5">
              {flags.map(f => <FlagChip key={f.label} {...f} />)}
            </div>

          </div>
        ) : (
          <div className="px-5 py-6 text-center">
            <p className="text-sm text-destructive bg-destructive/5 rounded-lg border border-destructive/10 px-4 py-3">
              Failed to load customer details.
            </p>
          </div>
        )}

      </SheetContent>
    </Sheet>
  )
}

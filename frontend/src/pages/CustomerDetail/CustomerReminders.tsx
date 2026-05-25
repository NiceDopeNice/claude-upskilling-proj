import { useEffect, useState } from 'react'
import { Bell, Plus, Mail, Phone, ChevronDown, ChevronUp, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  CustomerReminder, CustomerReminderType, ActivateReminderPayload, DeactivationReason,
  getReminderTypes, getReminders, activateReminder, deactivateReminder, getReminderSends, ReminderSend,
} from '@/api/customerApi'

const DEACTIVATION_REASONS: { value: DeactivationReason; label: string }[] = [
  { value: 'agent',                      label: 'Manual deactivation' },
  { value: 'customer_sms_stop',          label: 'Customer replied STOP' },
  { value: 'customer_email_unsubscribe', label: 'Customer unsubscribed' },
  { value: 'subscription_churn',         label: 'Subscription cancelled' },
  { value: 'gdpr_flag',                  label: 'GDPR flag' },
  { value: 'contact_unreachable',        label: 'Contact unreachable' },
]

function statusBadge(r: CustomerReminder) {
  if (r.is_active) {
    return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-700">Active</span>
  }
  const label = DEACTIVATION_REASONS.find(d => d.value === r.deactivated_reason)?.label ?? 'Inactive'
  return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{label}</span>
}

function SendHistory({ sends }: { sends: ReminderSend[] }) {
  if (!sends.length) return <p className="text-[11px] text-muted-foreground pl-1">No sends yet.</p>
  return (
    <div className="space-y-1">
      {sends.map(s => (
        <div key={s.id} className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {s.status === 'success'
            ? <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
            : s.status === 'failed'
            ? <XCircle className="h-3 w-3 text-destructive shrink-0" />
            : <span className="h-3 w-3 rounded-full border border-muted-foreground/40 shrink-0 inline-block" />
          }
          <span className="uppercase font-medium w-6">{s.channel}</span>
          <span>{new Date(s.sent_at).toLocaleDateString('sv-SE')}</span>
          {s.skip_reason && <span className="text-muted-foreground/60">({s.skip_reason})</span>}
          {s.error_message && <span className="text-destructive/70 truncate max-w-[200px]">{s.error_message}</span>}
        </div>
      ))}
    </div>
  )
}

function AddReminderForm({
  types,
  onSave,
  onCancel,
  saving,
}: {
  types: CustomerReminderType[]
  onSave: (p: ActivateReminderPayload) => Promise<void>
  onCancel: () => void
  saving: boolean
}) {
  const [typeCode, setTypeCode]             = useState('')
  const [brand, setBrand]                   = useState('')
  const [sendSms, setSendSms]               = useState(true)
  const [sendEmail, setSendEmail]           = useState(true)
  const [intervalMonths, setIntervalMonths] = useState(3)
  const [startDate, setStartDate]           = useState(() => new Date().toISOString().slice(0, 10))

  const selectedType = types.find(t => t.code === typeCode)
  const brandOptions = selectedType?.supported_brands ?? []

  function handleTypeChange(code: string) {
    const t = types.find(x => x.code === code)
    setTypeCode(code)
    setBrand('')
    if (t) setIntervalMonths(t.default_interval_months)
  }

  async function handleSave() {
    if (!typeCode || !brand) return
    await onSave({ type_code: typeCode, brand, send_sms: sendSms, send_email: sendEmail, interval_months: intervalMonths, start_date: startDate })
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-muted/20 px-4 py-4 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Select value={typeCode} onValueChange={handleTypeChange}>
          <SelectTrigger size="sm" className="text-xs">
            <SelectValue placeholder="Reminder type" />
          </SelectTrigger>
          <SelectContent>
            {types.map(t => <SelectItem key={t.code} value={t.code}>{t.label_en}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={brand} onValueChange={setBrand} disabled={!brandOptions.length}>
          <SelectTrigger size="sm" className="text-xs">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            {brandOptions.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-[11px] text-muted-foreground">Interval (months)</label>
          <Input
            type="number"
            min={selectedType?.min_interval_months ?? 1}
            max={selectedType?.max_interval_months ?? 24}
            value={intervalMonths}
            onChange={e => setIntervalMonths(Number(e.target.value))}
            className="h-8 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-muted-foreground">Start date</label>
          <Input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
          <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)} className="rounded" />
          <Phone className="h-3.5 w-3.5 text-muted-foreground" /> SMS
        </label>
        <label className="flex items-center gap-1.5 text-xs cursor-pointer select-none">
          <input type="checkbox" checked={sendEmail} onChange={e => setSendEmail(e.target.checked)} className="rounded" />
          <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving} className="h-7">Cancel</Button>
        <Button size="sm" onClick={handleSave} disabled={saving || !typeCode || !brand} className="h-7">
          {saving ? 'Saving…' : 'Activate'}
        </Button>
      </div>
    </div>
  )
}

function ReminderCard({
  reminder,
  customerId,
  onUpdated,
}: {
  reminder: CustomerReminder
  customerId: number
  onUpdated: (r: CustomerReminder) => void
}) {
  const [deactivating, setDeactivating] = useState(false)
  const [reason, setReason]             = useState<DeactivationReason>('agent')
  const [saving, setSaving]             = useState(false)
  const [sends, setSends]               = useState<ReminderSend[] | null>(null)
  const [sendsOpen, setSendsOpen]       = useState(false)
  const [sendsLoading, setSendsLoading] = useState(false)

  async function handleDeactivate() {
    setSaving(true)
    try {
      const res = await deactivateReminder(customerId, reminder.id, reason)
      onUpdated(res.data)
      setDeactivating(false)
    } finally {
      setSaving(false)
    }
  }

  async function toggleSends() {
    if (!sendsOpen && sends === null) {
      setSendsLoading(true)
      try {
        const res = await getReminderSends(customerId, reminder.id)
        setSends(res.data)
      } finally {
        setSendsLoading(false)
      }
    }
    setSendsOpen(p => !p)
  }

  return (
    <div className="rounded-lg border border-border px-4 py-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{reminder.type?.label_en ?? reminder.type_code}</span>
            <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">{reminder.brand}</span>
            {statusBadge(reminder)}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
            {reminder.send_sms   && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> SMS</span>}
            {reminder.send_email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span>}
            <span>Every {reminder.interval_months}mo</span>
            {reminder.next_reminder_at && reminder.is_active && (
              <span>Next: {new Date(reminder.next_reminder_at).toLocaleDateString('sv-SE')}</span>
            )}
            {reminder.last_sent_at && (
              <span>Last sent: {new Date(reminder.last_sent_at).toLocaleDateString('sv-SE')}</span>
            )}
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            onClick={toggleSends}
            className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
            title="Send history"
          >
            {sendsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {reminder.is_active && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-destructive px-2"
              onClick={() => setDeactivating(p => !p)}
            >
              Deactivate
            </Button>
          )}
        </div>
      </div>

      {deactivating && (
        <div className="space-y-2 pt-1 border-t border-border/50">
          <Select value={reason} onValueChange={v => setReason(v as DeactivationReason)}>
            <SelectTrigger size="sm" className="text-xs w-full">
              <SelectValue placeholder="Select reason" />
            </SelectTrigger>
            <SelectContent>
              {DEACTIVATION_REASONS.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="h-7" onClick={() => setDeactivating(false)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" className="h-7" onClick={handleDeactivate} disabled={saving}>
              {saving ? 'Saving…' : 'Confirm'}
            </Button>
          </div>
        </div>
      )}

      {sendsOpen && (
        <div className="pt-1 border-t border-border/50">
          {sendsLoading ? (
            <p className="text-[11px] text-muted-foreground">Loading…</p>
          ) : (
            <SendHistory sends={sends ?? []} />
          )}
        </div>
      )}
    </div>
  )
}

export function CustomerReminders({ customerId }: { customerId: number }) {
  const [reminders, setReminders]     = useState<CustomerReminder[]>([])
  const [types, setTypes]             = useState<CustomerReminderType[]>([])
  const [loading, setLoading]         = useState(true)
  const [adding, setAdding]           = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getReminders(customerId), getReminderTypes()])
      .then(([rem, typ]) => {
        setReminders(rem.data)
        setTypes(typ.data)
      })
      .catch(() => setError('Failed to load reminders.'))
      .finally(() => setLoading(false))
  }, [customerId])

  async function handleActivate(payload: ActivateReminderPayload) {
    setSaving(true)
    setError(null)
    try {
      const res = await activateReminder(customerId, payload)
      setReminders(prev => {
        const idx = prev.findIndex(r => r.id === res.data.id)
        return idx >= 0
          ? prev.map(r => r.id === res.data.id ? res.data : r)
          : [res.data, ...prev]
      })
      setAdding(false)
    } catch {
      setError('Failed to activate reminder.')
    } finally {
      setSaving(false)
    }
  }

  function handleUpdated(updated: CustomerReminder) {
    setReminders(prev => prev.map(r => r.id === updated.id ? updated : r))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between pt-5 pb-2">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          Reminders {reminders.length > 0 && `(${reminders.length})`}
        </h2>
        {!adding && (
          <Button variant="outline" size="sm" onClick={() => setAdding(true)} className="h-7 text-xs gap-1">
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/5 rounded-lg border border-destructive/10 px-3 py-2">
          {error}
        </p>
      )}

      {adding && (
        <AddReminderForm
          types={types}
          onSave={handleActivate}
          onCancel={() => setAdding(false)}
          saving={saving}
        />
      )}

      {loading ? (
        <p className="text-xs text-muted-foreground py-2">Loading…</p>
      ) : reminders.length === 0 && !adding ? (
        <p className="text-xs text-muted-foreground py-2">No reminders set up.</p>
      ) : (
        <div className="space-y-2">
          {reminders.map(r => (
            <ReminderCard
              key={r.id}
              reminder={r}
              customerId={customerId}
              onUpdated={handleUpdated}
            />
          ))}
        </div>
      )}
    </div>
  )
}

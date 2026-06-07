import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { AppSelect, SelectOption } from '@/components/AppSelect'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ConfirmDialog } from '@/pages/Gdpr/components/ConfirmDialog'
import {
  SinfridAccount, SinfridMember, SinfridAlarm, SinfridPolicy,
  SinfridMemberPayload, SinfridAccountPayload, SinfridPolicyPayload,
  InsuranceProduct, InsuranceRelationship,
  getSinfridAccount, getSinfridMembers, addSinfridMember, updateSinfridMember,
  removeSinfridMember, getSinfridAlarms, updateSinfridAccount,
  deactivateSinfridAccount, reactivateSinfridAccount, deleteSinfridAccount,
  getSinfridPolicies, createSinfridPolicy, cancelSinfridPolicy,
} from '@/api/sinfridApi'
import {
  HeartPulse, Users, Bell,
  Plus, Trash2, CheckCircle2, AlertTriangle, AlertCircle,
  Calendar, X, Loader2, Pencil, Shield, FileText, Ban, Power, PowerOff,
} from 'lucide-react'

/* ── helpers ── */
function fmt(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function fmtDt(dt: string | null) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

/* ── badges ── */
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
      active ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'
    }`}>
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

function SeverityBadge({ severity }: { severity: string | null }) {
  const map: Record<string, string> = {
    high:   'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low:    'bg-blue-50 text-blue-700 border-blue-200',
  }
  const cls = map[(severity ?? '').toLowerCase()] ?? 'bg-muted text-muted-foreground border-border'
  return (
    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${cls}`}>
      {severity ?? '—'}
    </span>
  )
}

function PolicyStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE:               'bg-green-100 text-green-700 border-green-200',
    CANCELED:             'bg-red-100 text-red-700 border-red-200',
    PENDING_CANCELLATION: 'bg-orange-100 text-orange-700 border-orange-200',
    PENDING:              'bg-amber-100 text-amber-700 border-amber-200',
    ERROR:                'bg-red-100 text-red-600 border-red-200',
  }
  const cls = map[status] ?? 'bg-muted text-muted-foreground border-border'
  return (
    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${cls}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

const ACCOUNT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'SINGLE',   label: 'Single'   },
  { value: 'FAMILY',   label: 'Family'   },
  { value: 'DUO',      label: 'Duo'      },
  { value: 'BUSINESS', label: 'Business' },
]

const PRODUCTS: { value: InsuranceProduct; label: string }[] = [
  { value: 'id-protect',        label: 'ID Protect'        },
  { value: 'id-protect-single', label: 'ID Protect Single' },
  { value: 'id-protect-duo',    label: 'ID Protect Duo'    },
  { value: 'id-protect-family', label: 'ID Protect Family' },
]

const PRODUCT_OPTIONS: SelectOption[] = PRODUCTS.map(p => ({ value: p.value, label: p.label }))

const RELATIONSHIPS: { value: InsuranceRelationship; label: string }[] = [
  { value: 'self',        label: 'Self'        },
  { value: 'spouse',      label: 'Spouse'      },
  { value: 'child',       label: 'Child'       },
  { value: 'parent',      label: 'Parent'      },
  { value: 'sibling',     label: 'Sibling'     },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'grandchild',  label: 'Grandchild'  },
  { value: 'friend',      label: 'Friend'      },
  { value: 'other',       label: 'Other'       },
]
const RELATIONSHIP_OPTIONS: SelectOption[] = RELATIONSHIPS.map(r => ({ value: r.value, label: r.label }))

const COUNTRY_OPTIONS: SelectOption[] = [
  { value: 'SE', label: 'SE — Sweden'         },
  { value: 'NO', label: 'NO — Norway'         },
  { value: 'DK', label: 'DK — Denmark'        },
  { value: 'FI', label: 'FI — Finland'        },
  { value: 'DE', label: 'DE — Germany'        },
  { value: 'GB', label: 'GB — United Kingdom' },
  { value: 'US', label: 'US — United States'  },
  { value: 'FR', label: 'FR — France'         },
  { value: 'NL', label: 'NL — Netherlands'    },
  { value: 'PL', label: 'PL — Poland'         },
]

const LANG_OPTIONS: SelectOption[] = [
  { value: 'sv', label: 'sv — Swedish'  },
  { value: 'en', label: 'en — English'  },
  { value: 'no', label: 'no — Norwegian'},
  { value: 'da', label: 'da — Danish'   },
  { value: 'fi', label: 'fi — Finnish'  },
  { value: 'de', label: 'de — German'   },
  { value: 'fr', label: 'fr — French'   },
  { value: 'nl', label: 'nl — Dutch'    },
  { value: 'pl', label: 'pl — Polish'   },
]

/* ── tabs ── */
type PanelTab = 'account' | 'alarms' | 'family' | 'policies'

const PANEL_TABS: { key: PanelTab; icon: React.ElementType; label: string }[] = [
  { key: 'account',  icon: HeartPulse, label: 'Account'  },
  { key: 'alarms',   icon: Bell,       label: 'Alarms'   },
  { key: 'family',   icon: Users,      label: 'Family'   },
  { key: 'policies', icon: FileText,   label: 'Policies' },
]

/* ── shared field component ── */
function Field({ label, value, onChange, mono, type = 'text', readOnly }: {
  label: string; value: string; onChange?: (v: string) => void
  mono?: boolean; type?: string; readOnly?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        className={`w-full text-sm rounded-lg border border-input bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring ${mono ? 'font-mono' : ''} ${readOnly ? 'opacity-60 cursor-default' : ''}`}
      />
    </div>
  )
}

/* ── Account tab ── */
function AccountTab({ account, customerId, onRefresh, onClose }: {
  account: SinfridAccount
  customerId: number
  onRefresh: () => void
  onClose: () => void
}) {
  const typeLabel = { SINGLE: 'Single', FAMILY: 'Family', BUSINESS: 'Business', DUO: 'Duo' }[account.type] ?? account.type

  const [editing, setEditing]               = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [form, setForm]                     = useState<SinfridAccountPayload>({})
  const [actionSaving, setActionSaving]     = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [confirmDelete, setConfirmDelete]   = useState(false)

  function openEdit() {
    setForm({
      first_name:      account.first_name      ?? '',
      last_name:       account.last_name       ?? '',
      email:           account.email           ?? '',
      email_confirmed: account.email_confirmed,
      phone:           account.phone           ?? '',
      phone_confirmed: account.phone_confirmed,
      street:          account.street          ?? '',
      zipcode:         account.zipcode         ?? '',
      city:            account.city            ?? '',
      country_code:    account.country_code    ?? '',
      lang_code:       account.lang_code       ?? '',
      type:            account.type,
      plan_id:         account.plan_id ?? undefined,
      status:          account.status,
    })
    setEditing(true)
    setError(null)
  }

  const set = (k: keyof SinfridAccountPayload) => (v: string) =>
    setForm(prev => ({ ...prev, [k]: v }))

  async function save() {
    setSaving(true); setError(null)
    try {
      await updateSinfridAccount(customerId, form)
      setEditing(false)
      onRefresh()
    } catch {
      setError('Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive() {
    setActionSaving(true)
    try {
      account.status ? await deactivateSinfridAccount(customerId) : await reactivateSinfridAccount(customerId)
      onRefresh()
    } finally {
      setActionSaving(false)
      setConfirmDeactivate(false)
    }
  }

  async function handleDelete() {
    setActionSaving(true)
    try {
      await deleteSinfridAccount(customerId)
      onClose()
    } finally {
      setActionSaving(false)
      setConfirmDelete(false)
    }
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Field label="First name" value={form.first_name ?? ''} onChange={set('first_name')} />
          <Field label="Last name"  value={form.last_name  ?? ''} onChange={set('last_name')}  />

          {/* Email + confirmed */}
          <div className="col-span-2 space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={form.email ?? ''}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="flex-1 text-sm rounded-lg border border-input bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer shrink-0">
                <Checkbox
                  checked={form.email_confirmed ?? false}
                  onCheckedChange={v => setForm(prev => ({ ...prev, email_confirmed: v === true }))}
                />
                Confirmed
              </label>
            </div>
          </div>

          {/* Phone + confirmed */}
          <div className="col-span-2 space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Phone</label>
            <div className="flex items-center gap-2">
              <input
                type="tel"
                value={form.phone ?? ''}
                onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className="flex-1 text-sm rounded-lg border border-input bg-background px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer shrink-0">
                <Checkbox
                  checked={form.phone_confirmed ?? false}
                  onCheckedChange={v => setForm(prev => ({ ...prev, phone_confirmed: v === true }))}
                />
                Confirmed
              </label>
            </div>
          </div>

          <Field label="Street" value={form.street ?? ''} onChange={set('street')} />
          <div className="grid grid-cols-2 gap-1.5">
            <Field label="Zip"  value={form.zipcode ?? ''} onChange={set('zipcode')} />
            <Field label="City" value={form.city    ?? ''} onChange={set('city')}    />
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Country</div>
            <div className="text-sm px-0.5">{form.country_code || '—'}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Language</div>
            <div className="text-sm px-0.5">{form.lang_code || '—'}</div>
          </div>

          {/* Type */}
          <div className="col-span-2 space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Type</label>
            <AppSelect
              options={ACCOUNT_TYPE_OPTIONS}
              value={ACCOUNT_TYPE_OPTIONS.find(o => o.value === form.type) ?? null}
              onChange={opt => setForm(prev => ({ ...prev, type: (opt as SelectOption)?.value as SinfridAccountPayload['type'] }))}
              isSearchable={false}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              styles={{ menuPortal: base => ({ ...base, zIndex: 1100 }) }}
            />
          </div>
        </div>
        {error && (
          <p className="text-xs text-destructive bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2">{error}</p>
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
            Save changes
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Plan card */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-rose-50 to-rose-100/50 p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Account Type</div>
            <div className="text-lg font-bold">{typeLabel}</div>
            {account.plan_id && (
              <div className="text-xs text-muted-foreground mt-0.5">Plan #{account.plan_id}</div>
            )}
          </div>
          <StatusBadge active={account.status} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>Activated {fmt(account.activation_date)}</span>
          </div>
          {account.last_login_at && (
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>Last login {fmt(account.last_login_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact info */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/30">
          <span className="text-xs font-semibold">Contact Information</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={openEdit}
                className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Edit account</TooltipContent>
          </Tooltip>
        </div>
        <div className="divide-y divide-border/60">
          {[
            { label: 'Name',    value: [account.first_name, account.last_name].filter(Boolean).join(' ') || null },
            { label: 'Email',   value: account.email,   extra: account.email_confirmed   ? '✓ confirmed' : '✗ unconfirmed' },
            { label: 'Phone',   value: account.phone,   extra: account.phone_confirmed   ? '✓ confirmed' : '✗ unconfirmed' },
            { label: 'Address', value: [account.street, account.zipcode, account.city].filter(Boolean).join(', ') || null },
            { label: 'Country', value: account.country_code },
            { label: 'UUID',    value: account.uuid, mono: true },
          ].map(row => (
            <div key={row.label} className="flex items-start justify-between px-3 py-2.5 gap-4">
              <span className="text-xs text-muted-foreground shrink-0 w-16">{row.label}</span>
              <div className="text-xs text-right min-w-0">
                <div className={`truncate ${(row as any).mono ? 'font-mono text-[10px]' : ''}`}>
                  {row.value ?? <span className="text-muted-foreground/50 italic">—</span>}
                </div>
                {row.value && (row as any).extra && (
                  <div className={`text-[10px] mt-0.5 ${(row as any).extra.startsWith('✓') ? 'text-green-600' : 'text-muted-foreground'}`}>
                    {(row as any).extra}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {account.deactivated_at && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Deactivated on {fmtDt(account.deactivated_at)}
        </div>
      )}

      {/* Account actions */}
      <div className="flex items-center gap-2 pt-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setConfirmDeactivate(true)}
              disabled={actionSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-50 ${
                account.status
                  ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                  : 'border-green-200 text-green-700 bg-green-50 hover:bg-green-100'
              }`}
            >
              {account.status ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
              {account.status ? 'Deactivate' : 'Reactivate'}
            </button>
          </TooltipTrigger>
          <TooltipContent>{account.status ? 'Deactivate account' : 'Reactivate account'}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={actionSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete account
            </button>
          </TooltipTrigger>
          <TooltipContent>Permanently delete this account</TooltipContent>
        </Tooltip>
      </div>

      <ConfirmDialog
        open={confirmDeactivate}
        title={account.status ? 'Deactivate account' : 'Reactivate account'}
        description={account.status
          ? 'This will deactivate the Sinfrid account and set the deactivation date to now.'
          : 'This will reactivate the Sinfrid account and clear the deactivation date.'}
        confirmLabel={account.status ? 'Deactivate' : 'Reactivate'}
        destructive={account.status}
        loading={actionSaving}
        onConfirm={toggleActive}
        onCancel={() => setConfirmDeactivate(false)}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete Sinfrid account"
        description="This will permanently delete the account. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={actionSaving}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

/* ── Alarms tab ── */
function AlarmsTab({ customerId }: { customerId: number }) {
  const [alarms, setAlarms]   = useState<SinfridAlarm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSinfridAlarms(customerId)
      .then(res => setAlarms(res.data))
      .finally(() => setLoading(false))
  }, [customerId])

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
  if (!alarms.length) return <div className="text-center py-10 text-muted-foreground text-sm">No alarms found.</div>

  return (
    <div className="space-y-2">
      {alarms.map(alarm => (
        <div key={alarm.id} className={`rounded-xl border p-3 ${
          alarm.status === 'resolved' ? 'border-border bg-card opacity-70' : 'border-red-200 bg-red-50/40'
        }`}>
          <div className="flex items-start gap-2.5">
            <div className={`mt-0.5 h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${
              alarm.status === 'resolved' ? 'bg-muted' : 'bg-red-100'
            }`}>
              {alarm.status === 'resolved'
                ? <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                : <AlertTriangle className="h-4 w-4 text-red-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <SeverityBadge severity={alarm.severity} />
                {alarm.category && (
                  <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{alarm.category}</span>
                )}
                {alarm.status && (
                  <span className="text-[10px] font-medium text-muted-foreground capitalize">{alarm.status}</span>
                )}
              </div>
              <div className="text-sm">{alarm.text ?? '—'}</div>
              {alarm.source && <div className="text-xs text-muted-foreground mt-0.5">Source: {alarm.source}</div>}
              {alarm.date    && <div className="text-xs text-muted-foreground mt-0.5">{fmtDt(alarm.date)}</div>}
              {alarm.coachme_available && alarm.coachme_description && (
                <div className="mt-1.5 text-xs bg-blue-50 border border-blue-100 rounded px-2 py-1.5 text-blue-700">
                  <span className="font-semibold">CoachMe: </span>{alarm.coachme_description}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Member form ── */
const EMPTY_MEMBER_FORM: SinfridMemberPayload = {
  ssn: '', first_name: '', last_name: '', phone: '', email: '', street: '', zipcode: '', city: '',
}

function MemberForm({ initial, saving, error, onSubmit, onCancel }: {
  initial?: SinfridMemberPayload
  saving: boolean
  error: string | null
  onSubmit: (p: SinfridMemberPayload) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<SinfridMemberPayload>(initial ?? EMPTY_MEMBER_FORM)
  const set = (k: keyof SinfridMemberPayload) => (v: string) =>
    setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="SSN"        value={form.ssn        ?? ''} onChange={set('ssn')}        mono />
        <div />
        <Field label="First name" value={form.first_name ?? ''} onChange={set('first_name')} />
        <Field label="Last name"  value={form.last_name  ?? ''} onChange={set('last_name')}  />
        <Field label="Phone"      value={form.phone      ?? ''} onChange={set('phone')}      type="tel" />
        <Field label="Email"      value={form.email      ?? ''} onChange={set('email')}      type="email" />
        <Field label="Street"     value={form.street     ?? ''} onChange={set('street')}     />
        <div className="grid grid-cols-2 gap-1.5">
          <Field label="Zip" value={form.zipcode ?? ''} onChange={set('zipcode')} />
          <Field label="City" value={form.city ?? ''} onChange={set('city')} />
        </div>
      </div>
      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSubmit(form)} disabled={saving || !form.first_name?.trim()}>
          {saving && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
      </div>
    </div>
  )
}

/* ── Family tab ── */
function FamilyTab({ customerId }: { customerId: number }) {
  const [members, setMembers]   = useState<SinfridMember[]>([])
  const [loading, setLoading]   = useState(true)
  const [adding, setAdding]     = useState(false)
  const [editing, setEditing]   = useState<number | null>(null)
  const [removing, setRemoving] = useState<SinfridMember | null>(null)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  function load() {
    setLoading(true)
    getSinfridMembers(customerId)
      .then(res => setMembers(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [customerId])

  async function handleAdd(payload: SinfridMemberPayload) {
    setSaving(true); setError(null)
    try { await addSinfridMember(customerId, payload); setAdding(false); load() }
    catch { setError('Failed to add member.') }
    finally { setSaving(false) }
  }

  async function handleUpdate(id: number, payload: SinfridMemberPayload) {
    setSaving(true); setError(null)
    try { await updateSinfridMember(customerId, id, payload); setEditing(null); load() }
    catch { setError('Failed to update member.') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!removing) return
    setDeleting(true)
    try { await removeSinfridMember(customerId, removing.id); setRemoving(null); load() }
    finally { setDeleting(false) }
  }

  function initials(m: SinfridMember) {
    return [m.first_name, m.last_name].filter(Boolean).map(n => n![0]).join('').toUpperCase() || '?'
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{members.length} member{members.length !== 1 ? 's' : ''}</div>
        {!adding && (
          <Button size="sm" variant="outline" onClick={() => { setAdding(true); setEditing(null); setError(null) }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add member
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <div className="text-xs font-semibold mb-2">New member</div>
          <MemberForm saving={saving} error={error} onSubmit={handleAdd} onCancel={() => { setAdding(false); setError(null) }} />
        </div>
      )}

      {loading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}

      {!loading && members.length === 0 && !adding && (
        <div className="text-center py-8 text-muted-foreground text-sm">No family members added yet.</div>
      )}

      <div className="space-y-2">
        {members.map(member => (
          <div key={member.id} className="rounded-xl border border-border bg-card overflow-hidden">
            {editing === member.id ? (
              <div className="p-3">
                <div className="text-xs font-semibold mb-2">Edit member</div>
                <MemberForm
                  initial={{
                    ssn: member.ssn ?? '', first_name: member.first_name ?? '', last_name: member.last_name ?? '',
                    phone: member.phone ?? '', email: member.email ?? '',
                    street: member.street ?? '', zipcode: member.zipcode ?? '', city: member.city ?? '',
                  }}
                  saving={saving} error={error}
                  onSubmit={p => handleUpdate(member.id, p)}
                  onCancel={() => { setEditing(null); setError(null) }}
                />
              </div>
            ) : (
              <div className="flex items-start gap-3 px-3 py-2.5">
                <div className="h-9 w-9 rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center text-xs font-bold text-rose-600 shrink-0 mt-0.5">
                  {initials(member)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{member.first_name} {member.last_name}</div>
                  {member.ssn   && <div className="text-xs text-muted-foreground font-mono">{member.ssn}</div>}
                  {member.phone && <div className="text-xs text-muted-foreground">{member.phone}</div>}
                  {member.email && <div className="text-xs text-muted-foreground">{member.email}</div>}
                  {(member.street || member.city) && (
                    <div className="text-xs text-muted-foreground">
                      {[member.street, member.zipcode, member.city].filter(Boolean).join(', ')}
                    </div>
                  )}
                  <div className="mt-1">
                    <StatusBadge active={member.status} />
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => { setEditing(member.id); setAdding(false); setError(null) }}
                        className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Edit member</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setRemoving(member)}
                        className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Remove member</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!removing}
        title="Remove member"
        description={`Remove ${[removing?.first_name, removing?.last_name].filter(Boolean).join(' ')} from this account?`}
        confirmLabel="Remove"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setRemoving(null)}
      />
    </div>
  )
}

/* ── Policy form ── */
const EMPTY_POLICY_FORM: SinfridPolicyPayload = {
  product: 'id-protect-single', start_date: '', end_date: '', relationship: 'self',
}

function PolicyForm({ saving, error, onSubmit, onCancel }: {
  saving: boolean
  error: string | null
  onSubmit: (p: SinfridPolicyPayload) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<SinfridPolicyPayload>(EMPTY_POLICY_FORM)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Product</label>
          <AppSelect
            options={PRODUCT_OPTIONS}
            value={PRODUCT_OPTIONS.find(o => o.value === form.product) ?? null}
            onChange={opt => setForm(prev => ({ ...prev, product: (opt as SelectOption)?.value as InsuranceProduct }))}
            isSearchable={false}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{ menuPortal: base => ({ ...base, zIndex: 1100 }) }}
          />
        </div>
        <div className="col-span-2 space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Relationship</label>
          <AppSelect
            options={RELATIONSHIP_OPTIONS}
            value={RELATIONSHIP_OPTIONS.find(o => o.value === (form.relationship ?? 'self')) ?? null}
            onChange={opt => setForm(prev => ({ ...prev, relationship: (opt as SelectOption)?.value as InsuranceRelationship }))}
            isSearchable={false}
            menuPortalTarget={document.body}
            menuPosition="fixed"
            styles={{ menuPortal: base => ({ ...base, zIndex: 1100 }) }}
          />
        </div>
        <Field label="Start date" value={form.start_date ?? ''} onChange={v => setForm(prev => ({ ...prev, start_date: v }))} type="date" />
        <Field label="End date"   value={form.end_date   ?? ''} onChange={v => setForm(prev => ({ ...prev, end_date: v }))}   type="date" />
      </div>
      {error && (
        <p className="text-xs text-destructive bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSubmit(form)} disabled={saving || !form.start_date}>
          {saving && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
          Create policy
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
      </div>
    </div>
  )
}

/* ── Policies tab ── */
function PoliciesTab({ customerId }: { customerId: number }) {
  const [policies, setPolicies]     = useState<SinfridPolicy[]>([])
  const [loading, setLoading]       = useState(true)
  const [adding, setAdding]         = useState(false)
  const [saving, setSaving]         = useState(false)
  const [addError, setAddError]     = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<SinfridPolicy | null>(null)
  const [cancelSaving, setCancelSaving] = useState(false)

  function load() {
    setLoading(true)
    getSinfridPolicies(customerId)
      .then(res => setPolicies(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [customerId])

  async function handleCreate(payload: SinfridPolicyPayload) {
    setSaving(true); setAddError(null)
    try {
      await createSinfridPolicy(customerId, payload)
      setAdding(false)
      load()
    } catch {
      setAddError('Failed to create policy.')
    } finally {
      setSaving(false)
    }
  }

  async function handleCancel() {
    if (!cancelling) return
    setCancelSaving(true)
    try {
      await cancelSinfridPolicy(customerId, cancelling.id)
      setCancelling(null)
      load()
    } finally {
      setCancelSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">
          {policies.length} polic{policies.length !== 1 ? 'ies' : 'y'}
        </div>
        {!adding && (
          <Button size="sm" variant="outline" onClick={() => { setAdding(true); setAddError(null) }}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add policy
          </Button>
        )}
      </div>

      {adding && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <div className="text-xs font-semibold mb-2">New policy</div>
          <PolicyForm saving={saving} error={addError} onSubmit={handleCreate} onCancel={() => { setAdding(false); setAddError(null) }} />
        </div>
      )}

      {loading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}

      {!loading && policies.length === 0 && !adding && (
        <div className="text-center py-8 text-muted-foreground text-sm">No insurance policies found.</div>
      )}

      <div className="space-y-2">
        {policies.map(policy => (
          <div key={policy.id} className={`rounded-xl border bg-card overflow-hidden ${
            policy.status === 'ACTIVE' ? 'border-green-200' : 'border-border opacity-80'
          }`}>
            <div className="px-3 py-2.5">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center shrink-0">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium capitalize">
                      {PRODUCTS.find(p => p.value === policy.product)?.label ?? policy.product}
                    </div>
                    {policy.relationship && (
                      <div className="text-xs text-muted-foreground capitalize">{policy.relationship}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <PolicyStatusBadge status={policy.status} />
                  {(policy.status === 'ACTIVE' || policy.status === 'PENDING') && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => setCancelling(policy)}
                          className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>Cancel policy</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                <div><span className="font-medium">Start:</span> {fmt(policy.start_date)}</div>
                {policy.end_date && (
                  <div><span className="font-medium">End:</span> {fmt(policy.end_date)}</div>
                )}
                <div><span className="font-medium">Source:</span> <span className="capitalize">{policy.source.replace('_', ' ')}</span></div>
                <div className="font-mono text-[10px] text-muted-foreground/60 truncate col-span-2">{policy.id}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={!!cancelling}
        title="Cancel policy"
        description={`Cancel ${PRODUCTS.find(p => p.value === cancelling?.product)?.label ?? cancelling?.product ?? 'this policy'}? This will set the status to CANCELED and cannot be undone.`}
        confirmLabel="Cancel policy"
        destructive
        loading={cancelSaving}
        onConfirm={handleCancel}
        onCancel={() => setCancelling(null)}
      />
    </div>
  )
}

/* ── Main panel ── */
export function SinfridPanel({ open, onClose, customerId, customerName }: {
  open: boolean
  onClose: () => void
  customerId: number
  customerName: string
}) {
  const [tab, setTab]                       = useState<PanelTab>('account')
  const [account, setAccount]               = useState<SinfridAccount | null>(null)
  const [loadingAccount, setLoadingAccount] = useState(false)

  function loadAccount() {
    setLoadingAccount(true)
    getSinfridAccount(customerId)
      .then(res => setAccount(res.data))
      .finally(() => setLoadingAccount(false))
  }

  useEffect(() => {
    if (!open) return
    loadAccount()
  }, [open, customerId])

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[998] bg-black/30 backdrop-blur-sm transition-opacity duration-300 cursor-pointer ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Slide-over panel */}
      <div className={`fixed top-0 right-0 h-full w-[440px] z-[999] bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}>

        {/* Header */}
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-3 border-b border-border shrink-0">
          <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center">
            <HeartPulse className="h-5 w-5 text-rose-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold">Sinfrid Dashboard</div>
            <p className="text-xs text-muted-foreground truncate">{customerName}</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <X className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Close</TooltipContent>
          </Tooltip>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-border shrink-0 px-1">
          {PANEL_TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loadingAccount ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !account ? (
            <div className="text-center py-12 space-y-2">
              <HeartPulse className="h-10 w-10 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground">No Sinfrid account found for this customer.</p>
            </div>
          ) : (
            <>
              {tab === 'account'  && <AccountTab  account={account} customerId={customerId} onRefresh={loadAccount} onClose={onClose} />}
              {tab === 'alarms'   && <AlarmsTab   customerId={customerId} />}
              {tab === 'family'   && <FamilyTab   customerId={customerId} />}
              {tab === 'policies' && <PoliciesTab customerId={customerId} />}
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}

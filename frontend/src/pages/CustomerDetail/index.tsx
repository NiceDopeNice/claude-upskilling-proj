import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CustomerComments } from './CustomerComments'
import { CustomerReminders } from './CustomerReminders'
import { CustomerOrganization } from './CustomerOrganization'
import { CustomerOrders } from './CustomerOrders'
import { CustomerSubscriptions } from './CustomerSubscriptions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft, Pencil, Save, X,
  PhoneOff, AlertOctagon, Ban, MailX, ShieldOff, ShieldAlert,
  CheckCircle2, XCircle, Bell, MessageSquare, Building2,
  Mail, Phone, MapPin, CreditCard, Calendar, ShoppingBag, TrendingUp, Hash,
} from 'lucide-react'
import { CustomerDetail, UpdateCustomerPayload } from '@/api/customerApi'
import { getRailwayCustomer, updateRailwayCustomer } from '@/api/railwayCustomerApi'

/* ─────────────────────────────────────────── helpers */

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function ProfileCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>
      {children}
    </div>
  )
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-foreground mb-3">{children}</h3>
}

function InfoRow({ icon: Icon, value, mono }: {
  icon: React.ElementType; value: string | null | undefined; mono?: boolean
}) {
  if (!value) return null
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className={`text-sm break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}

function FlagChip({ icon: Icon, label, active, activeColor }: {
  icon: React.ElementType; label: string; active: boolean; activeColor: string
}) {
  return (
    <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border ${
      active ? `${activeColor} border-current/20` : 'text-muted-foreground/40 border-border'
    }`}>
      {active ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </div>
  )
}

function FlagToggle({ icon: Icon, label, active, activeColor, onChange }: {
  icon: React.ElementType; label: string; active: boolean; activeColor: string; onChange: (v: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium border cursor-pointer transition-colors ${
        active ? `${activeColor} border-current/20` : 'text-muted-foreground/40 border-border hover:bg-muted/30'
      }`}
    >
      {active ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </button>
  )
}

function EditField({ label, value, onChange, mono, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; mono?: boolean; type?: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </label>
      <Input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`h-8 text-sm ${mono ? 'font-mono' : ''}`}
      />
    </div>
  )
}

/* ─────────────────────────────────────────── form */

type EditForm = {
  first_name: string; last_name: string
  email: string; alternative_email: string
  tel: string; alternative_tel: string
  pers_nr: string; adress: string
  post_nr: string; ort: string; region_code: string
  do_not_call: boolean; difficult_customer: boolean
  block_email: boolean; block_gdpr: boolean; block_dm: boolean
}

function toForm(d: CustomerDetail): EditForm {
  return {
    first_name:         d.first_name ?? '',
    last_name:          d.last_name ?? '',
    email:              d.email ?? '',
    alternative_email:  d.alternative_email ?? '',
    tel:                d.tel ?? '',
    alternative_tel:    d.alternative_tel ?? '',
    pers_nr:            d.pers_nr ?? '',
    adress:             d.adress ?? '',
    post_nr:            d.post_nr ?? '',
    ort:                d.ort ?? '',
    region_code:        d.region_code ?? '',
    do_not_call:        d.do_not_call,
    difficult_customer: d.difficult_customer,
    block_email:        d.block_email,
    block_gdpr:         d.block_gdpr,
    block_dm:           d.block_dm,
  }
}

type Tab = 'reminders' | 'comments' | 'organization' | 'orders' | 'subscriptions'

const TABS: { key: Tab; icon: React.ElementType; label: string; disabled?: boolean }[] = [
  { key: 'reminders',     icon: Bell,          label: 'Reminders'     },
  { key: 'comments',      icon: MessageSquare, label: 'Comments'      },
  { key: 'organization',  icon: Building2,     label: 'Organization'  },
  { key: 'orders',        icon: ShoppingBag,   label: 'Orders',        disabled: true },
  { key: 'subscriptions', icon: TrendingUp,    label: 'Subscriptions', disabled: true },
]

/* ─────────────────────────────────────────── page */

export default function CustomerDetailPage() {
  const { id }     = useParams<{ id: string }>()
  const navigate   = useNavigate()

  const [detail, setDetail]       = useState<CustomerDetail | null>(null)
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState<EditForm | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('reminders')

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getRailwayCustomer(Number(id))
      .then(res => setDetail(res.data))
      .catch(() => setError('Failed to load customer.'))
      .finally(() => setLoading(false))
  }, [id])

  function startEdit() {
    if (!detail) return
    setForm(toForm(detail))
    setError(null)
    setEditing(true)
  }

  function cancelEdit() { setEditing(false); setForm(null); setError(null) }

  async function saveEdit() {
    if (!form || !id) return
    setSaving(true)
    setError(null)
    try {
      const payload: UpdateCustomerPayload = {
        first_name:         form.first_name || undefined,
        last_name:          form.last_name || undefined,
        email:              form.email || undefined,
        alternative_email:  form.alternative_email || undefined,
        tel:                form.tel || undefined,
        alternative_tel:    form.alternative_tel || undefined,
        pers_nr:            form.pers_nr || undefined,
        adress:             form.adress || undefined,
        post_nr:            form.post_nr || undefined,
        ort:                form.ort || undefined,
        region_code:        form.region_code || undefined,
        do_not_call:        form.do_not_call,
        difficult_customer: form.difficult_customer,
        block_email:        form.block_email,
        block_gdpr:         form.block_gdpr,
        block_dm:           form.block_dm,
      }
      const res = await updateRailwayCustomer(Number(id), payload)
      setDetail(res.data)
      setEditing(false)
      setForm(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function setField<K extends keyof EditForm>(key: K, val: EditForm[K]) {
    setForm(prev => prev ? { ...prev, [key]: val } : prev)
  }

  /* ── loading skeleton ── */
  if (loading) return (
    <div>
      <div className="max-w-screen-2xl mx-auto px-6 pt-6">
        <div className="flex items-center gap-5 pb-4">
          <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-none border-b" />
        <div className="flex gap-5 mt-5">
          <div className="w-72 space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <div className="flex-1 space-y-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )

  if (error && !detail) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <p className="text-sm text-destructive bg-destructive/5 border border-destructive/10 rounded-lg px-5 py-3">{error}</p>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Go back
        </Button>
      </div>
    </div>
  )

  if (!detail) return null

  const fullName = `${detail.first_name} ${detail.last_name}`

  const alertFlags = [
    detail.do_not_call        && { label: 'Do Not Call',  color: 'bg-red-100 text-red-700 border-red-200'      },
    detail.difficult_customer && { label: 'Difficult',    color: 'bg-orange-100 text-orange-700 border-orange-200' },
    detail.blocked_fees       && { label: 'Blocked Fees', color: 'bg-red-100 text-red-700 border-red-200'      },
    detail.block_gdpr         && { label: 'GDPR Block',   color: 'bg-purple-100 text-purple-700 border-purple-200' },
  ].filter(Boolean) as { label: string; color: string }[]

  const allFlags = [
    { icon: PhoneOff,     label: 'Do Not Call',   active: detail.do_not_call,        activeColor: 'text-red-600 bg-red-50'       },
    { icon: AlertOctagon, label: 'Difficult',      active: detail.difficult_customer, activeColor: 'text-orange-600 bg-orange-50' },
    { icon: Ban,          label: 'Blocked Fees',   active: detail.blocked_fees,       activeColor: 'text-red-600 bg-red-50'       },
    { icon: MailX,        label: 'Block Email',    active: detail.block_email,        activeColor: 'text-amber-600 bg-amber-50'   },
    { icon: ShieldOff,    label: 'Block GDPR',     active: detail.block_gdpr,         activeColor: 'text-purple-600 bg-purple-50' },
    { icon: ShieldAlert,  label: 'Block DM',       active: detail.block_dm,           activeColor: 'text-amber-600 bg-amber-50'   },
  ]

  return (
    <div className="bg-muted/30">

      {/* ── Profile bar ── */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6">

          {/* Back + edit controls */}
          <div className="flex items-center justify-between pt-4 pb-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <Button size="sm" variant="ghost" onClick={cancelEdit} disabled={saving}>
                    <X className="h-4 w-4 mr-1.5" /> Cancel
                  </Button>
                  <Button size="sm" onClick={saveEdit} disabled={saving}>
                    <Save className="h-4 w-4 mr-1.5" />
                    {saving ? 'Saving…' : 'Save changes'}
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={startEdit}>
                  <Pencil className="h-4 w-4 mr-1.5" /> Edit profile
                </Button>
              )}
            </div>
          </div>

          {/* Avatar + name row */}
          <div className="flex items-center gap-5 pb-3">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-primary">{initials(fullName)}</span>
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold leading-tight">{fullName}</h1>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Hash className="h-3.5 w-3.5" />{detail.customer_no}
                    </span>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="h-3.5 w-3.5" />{detail.order_count} orders
                    </span>
                    <span className="text-border">·</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {detail.ltv.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr LTV
                    </span>
                    {detail.date_added && (
                      <>
                        <span className="text-border">·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Since {new Date(detail.date_added).toLocaleDateString('sv-SE')}
                        </span>
                      </>
                    )}
                  </div>
                  {alertFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {alertFlags.map(f => (
                        <span
                          key={f.label}
                          className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full border ${f.color}`}
                        >
                          {f.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex gap-0.5">
            {TABS.map(tab => (
              <button
                key={tab.key}
                disabled={tab.disabled}
                onClick={() => !tab.disabled && setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-[3px] transition-colors rounded-t-md ${
                  tab.disabled
                    ? 'border-transparent text-muted-foreground/40 cursor-not-allowed'
                    : activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="max-w-screen-2xl mx-auto px-6 py-5 flex gap-5 items-start">

        {/* ── Left sidebar ── */}
        <div className="w-72 shrink-0 space-y-3">

          {/* Contact */}
          <ProfileCard>
            <CardTitle>Contact info</CardTitle>
            {editing && form ? (
              <div className="space-y-3">
                <EditField label="First name"  value={form.first_name}        onChange={v => setField('first_name', v)} />
                <EditField label="Last name"   value={form.last_name}         onChange={v => setField('last_name', v)} />
                <EditField label="Email"       value={form.email}             onChange={v => setField('email', v)} type="email" />
                <EditField label="Alt. Email"  value={form.alternative_email} onChange={v => setField('alternative_email', v)} type="email" />
                <EditField label="Phone"       value={form.tel}               onChange={v => setField('tel', v)} />
                <EditField label="Alt. Phone"  value={form.alternative_tel}   onChange={v => setField('alternative_tel', v)} />
                <EditField label="SSN"         value={form.pers_nr}           onChange={v => setField('pers_nr', v)} mono />
              </div>
            ) : (
              <div className="divide-y divide-border/40">
                <InfoRow icon={Mail}       value={detail.email} />
                <InfoRow icon={Mail}       value={detail.alternative_email} />
                <InfoRow icon={Phone}      value={detail.tel} />
                <InfoRow icon={Phone}      value={detail.alternative_tel} />
                <InfoRow icon={CreditCard} value={detail.pers_nr} mono />
              </div>
            )}
          </ProfileCard>

          {/* Address */}
          <ProfileCard>
            <CardTitle>Address</CardTitle>
            {editing && form ? (
              <div className="space-y-3">
                <EditField label="Street"      value={form.adress}      onChange={v => setField('adress', v)} />
                <EditField label="Postal code" value={form.post_nr}     onChange={v => setField('post_nr', v)} />
                <EditField label="City"        value={form.ort}         onChange={v => setField('ort', v)} />
                <EditField label="Region"      value={form.region_code} onChange={v => setField('region_code', v)} />
              </div>
            ) : (
              <div>
                <InfoRow
                  icon={MapPin}
                  value={detail.adress ?? null}
                />
                {(detail.post_nr || detail.ort) && (
                  <InfoRow
                    icon={MapPin}
                    value={[detail.post_nr, detail.ort].filter(Boolean).join(' ')}
                  />
                )}
                <InfoRow icon={MapPin} value={detail.region_code} />
              </div>
            )}
          </ProfileCard>

          {/* Flags */}
          <ProfileCard>
            <CardTitle>Flags</CardTitle>
            {editing && form ? (
              <div className="grid grid-cols-2 gap-1.5">
                <FlagToggle icon={PhoneOff}     label="Do Not Call"  active={form.do_not_call}        activeColor="text-red-600 bg-red-50"       onChange={v => setField('do_not_call', v)} />
                <FlagToggle icon={AlertOctagon} label="Difficult"    active={form.difficult_customer} activeColor="text-orange-600 bg-orange-50" onChange={v => setField('difficult_customer', v)} />
                <FlagToggle icon={MailX}        label="Block Email"  active={form.block_email}        activeColor="text-amber-600 bg-amber-50"   onChange={v => setField('block_email', v)} />
                <FlagToggle icon={ShieldOff}    label="Block GDPR"   active={form.block_gdpr}         activeColor="text-purple-600 bg-purple-50" onChange={v => setField('block_gdpr', v)} />
                <FlagToggle icon={ShieldAlert}  label="Block DM"     active={form.block_dm}           activeColor="text-amber-600 bg-amber-50"   onChange={v => setField('block_dm', v)} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {allFlags.map(f => <FlagChip key={f.label} {...f} />)}
              </div>
            )}
          </ProfileCard>

          {error && (
            <p className="text-xs text-destructive bg-destructive/5 rounded-lg border border-destructive/10 px-3 py-2">
              {error}
            </p>
          )}
        </div>

        {/* ── Right content ── */}
        <div className="flex-1 min-w-0">
          {activeTab === 'reminders'     && <CustomerReminders    customerId={detail.id} />}
          {activeTab === 'comments'     && <CustomerComments     customerId={detail.id} />}
          {activeTab === 'organization' && <CustomerOrganization customerId={detail.id} />}
          {activeTab === 'orders'       && <CustomerOrders       customerId={detail.id} />}
          {activeTab === 'subscriptions' && <CustomerSubscriptions customerId={detail.id} />}
        </div>

      </div>
    </div>
  )
}

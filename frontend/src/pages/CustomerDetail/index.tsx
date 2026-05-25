import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft, Pencil, Save, X,
  PhoneOff, AlertOctagon, Ban, MailX, ShieldOff, ShieldAlert,
  CheckCircle2, XCircle, Hash,
} from 'lucide-react'
import { CustomerDetail, UpdateCustomerPayload } from '@/api/customerApi'
import { getRailwayCustomer, updateRailwayCustomer } from '@/api/railwayCustomerApi'

/* ── helpers ── */

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  return (
    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center shrink-0">
      <span className="text-xl font-bold text-primary">{initials}</span>
    </div>
  )
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 pt-5 pb-2">
      {title}
    </h2>
  )
}

function FieldGrid({ rows }: { rows: { label: string; value: React.ReactNode; mono?: boolean }[] }) {
  const visible = rows.filter(r => r.value !== null && r.value !== undefined && r.value !== '')
  if (!visible.length) return null
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-border/50">
          {visible.map(row => (
            <tr key={row.label} className="hover:bg-muted/20 transition-colors">
              <td className="px-4 py-2 text-[11px] text-muted-foreground whitespace-nowrap w-36">{row.label}</td>
              <td className={`px-4 py-2 text-sm font-medium break-all ${row.mono ? 'font-mono' : ''}`}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FlagChip({ icon: Icon, label, active, activeColor }: {
  icon: React.ElementType; label: string; active: boolean; activeColor: string
}) {
  return (
    <div className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium border transition-colors ${
      active ? `${activeColor} border-current/20` : 'text-muted-foreground/50 border-border'
    }`}>
      {active ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
      <Icon className="h-3.5 w-3.5 shrink-0" />
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
      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium border transition-colors cursor-pointer ${
        active ? `${activeColor} border-current/20` : 'text-muted-foreground/50 border-border hover:bg-muted/30'
      }`}
    >
      {active ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> : <XCircle className="h-3.5 w-3.5 shrink-0" />}
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
    </button>
  )
}

function EditField({ label, value, onChange, mono }: {
  label: string; value: string; onChange: (v: string) => void; mono?: boolean
}) {
  return (
    <div className="grid grid-cols-[9rem_1fr] items-center gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`h-8 text-sm ${mono ? 'font-mono' : ''}`}
      />
    </div>
  )
}

/* ── form state ── */

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

/* ── page ── */

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [detail, setDetail]   = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [form, setForm]       = useState<EditForm | null>(null)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getRailwayCustomer(Number(id))
      .then(res => setDetail(res.data))
      .catch(() => setError('Failed to load customer from Railway.'))
      .finally(() => setLoading(false))
  }, [id])

  function startEdit() {
    if (!detail) return
    setForm(toForm(detail))
    setError(null)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setForm(null)
    setError(null)
  }

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

  const fullName = detail ? `${detail.first_name} ${detail.last_name}` : '—'

  const flags = detail ? [
    { icon: PhoneOff,     label: 'Do Not Call',      active: detail.do_not_call,        activeColor: 'text-red-600 bg-red-50' },
    { icon: AlertOctagon, label: 'Difficult',         active: detail.difficult_customer, activeColor: 'text-orange-600 bg-orange-50' },
    { icon: Ban,          label: 'Blocked Fees',      active: detail.blocked_fees,       activeColor: 'text-red-600 bg-red-50' },
    { icon: MailX,        label: 'Block Email',       active: detail.block_email,        activeColor: 'text-amber-600 bg-amber-50' },
    { icon: ShieldOff,    label: 'Block GDPR',        active: detail.block_gdpr,         activeColor: 'text-purple-600 bg-purple-50' },
    { icon: ShieldAlert,  label: 'Block Direct Mail', active: detail.block_dm,           activeColor: 'text-amber-600 bg-amber-50' },
  ] : []

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to customers
          </button>

          {detail && !loading && (
            editing ? (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={saving}>
                  <X className="h-4 w-4 mr-1.5" /> Cancel
                </Button>
                <Button size="sm" onClick={saveEdit} disabled={saving}>
                  <Save className="h-4 w-4 mr-1.5" />
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={startEdit}>
                <Pencil className="h-4 w-4 mr-1.5" /> Edit
              </Button>
            )
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : error && !detail ? (
          <p className="text-sm text-destructive bg-destructive/5 rounded-lg border border-destructive/10 px-4 py-3">
            {error}
          </p>
        ) : detail ? (
          <>
            {/* ── Customer header ── */}
            <div className="flex items-center gap-5 mb-2">
              <Avatar name={fullName} />
              <div>
                <h1 className="text-2xl font-bold">{fullName}</h1>
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Hash className="h-3.5 w-3.5" />
                  <span className="font-semibold text-foreground/70">{detail.customer_no}</span>
                  <span className="mx-1.5 text-border">·</span>
                  <span>{detail.order_count} orders</span>
                  <span className="mx-1.5 text-border">·</span>
                  <span>LTV {detail.ltv.toLocaleString('sv-SE', { style: 'currency', currency: 'SEK' })}</span>
                </p>
              </div>
            </div>

            {error && (
              <p className="mt-3 text-xs text-destructive bg-destructive/5 rounded-lg border border-destructive/10 px-3 py-2">
                {error}
              </p>
            )}

            {editing && form ? (
              <>
                <SectionHeading title="Contact" />
                <div className="space-y-3 rounded-lg border border-border px-4 py-4">
                  <EditField label="First name"   value={form.first_name}        onChange={v => setField('first_name', v)} />
                  <EditField label="Last name"    value={form.last_name}         onChange={v => setField('last_name', v)} />
                  <EditField label="Email"        value={form.email}             onChange={v => setField('email', v)} />
                  <EditField label="Alt. Email"   value={form.alternative_email} onChange={v => setField('alternative_email', v)} />
                  <EditField label="Phone"        value={form.tel}               onChange={v => setField('tel', v)} />
                  <EditField label="Alt. Phone"   value={form.alternative_tel}   onChange={v => setField('alternative_tel', v)} />
                  <EditField label="SSN"          value={form.pers_nr}           onChange={v => setField('pers_nr', v)} mono />
                </div>

                <SectionHeading title="Address" />
                <div className="space-y-3 rounded-lg border border-border px-4 py-4">
                  <EditField label="Street"      value={form.adress}      onChange={v => setField('adress', v)} />
                  <EditField label="Postal code" value={form.post_nr}     onChange={v => setField('post_nr', v)} />
                  <EditField label="City"        value={form.ort}         onChange={v => setField('ort', v)} />
                  <EditField label="Region"      value={form.region_code} onChange={v => setField('region_code', v)} />
                </div>

                <SectionHeading title="Flags" />
                <div className="grid grid-cols-3 gap-2">
                  <FlagToggle icon={PhoneOff}     label="Do Not Call"      active={form.do_not_call}        activeColor="text-red-600 bg-red-50"       onChange={v => setField('do_not_call', v)} />
                  <FlagToggle icon={AlertOctagon} label="Difficult"         active={form.difficult_customer} activeColor="text-orange-600 bg-orange-50" onChange={v => setField('difficult_customer', v)} />
                  <FlagToggle icon={MailX}        label="Block Email"       active={form.block_email}        activeColor="text-amber-600 bg-amber-50"   onChange={v => setField('block_email', v)} />
                  <FlagToggle icon={ShieldOff}    label="Block GDPR"        active={form.block_gdpr}         activeColor="text-purple-600 bg-purple-50" onChange={v => setField('block_gdpr', v)} />
                  <FlagToggle icon={ShieldAlert}  label="Block Direct Mail" active={form.block_dm}           activeColor="text-amber-600 bg-amber-50"   onChange={v => setField('block_dm', v)} />
                </div>
              </>
            ) : (
              <>
                <SectionHeading title="Contact" />
                <FieldGrid rows={[
                  { label: 'Email',        value: detail.email },
                  { label: 'Alt. Email',   value: detail.alternative_email },
                  { label: 'Phone',        value: detail.tel },
                  { label: 'Alt. Phone',   value: detail.alternative_tel },
                  { label: 'SSN',          value: detail.pers_nr, mono: true },
                  { label: 'Member since', value: detail.date_added ? new Date(detail.date_added).toLocaleDateString('sv-SE') : null },
                ]} />

                <SectionHeading title="Address" />
                <FieldGrid rows={[
                  { label: 'Street',      value: detail.adress },
                  { label: 'Postal/City', value: [detail.post_nr, detail.ort].filter(Boolean).join('  ') || null },
                  { label: 'Region',      value: detail.region_code },
                ]} />

                <SectionHeading title="Flags" />
                <div className="grid grid-cols-3 gap-2">
                  {flags.map(f => <FlagChip key={f.label} {...f} />)}
                </div>
              </>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CommentsPanel } from './CustomerComments'
import { CustomerReminders } from './CustomerReminders'
import { CustomerOrganization } from './CustomerOrganization'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AppSelect, SelectOption } from '@/components/AppSelect'
import {
  Pencil, Save, X, Bell, MessageSquare, Building2,
  ShoppingBag, TrendingUp, Hash, Mail, Phone, MapPin,
  Calendar, Copy, Check, ShieldCheck, ShieldX,
  User, Truck, CreditCard as CardIcon, Loader2,
  ChevronLeft, ChevronRight, ChevronDown,
  Crown, Cake, AlertCircle, Users, HeartPulse,
  PhoneOff, AlertTriangle, Receipt, MailX, MessageSquareX, ShieldAlert,
  Flag, KeyRound, History,
} from 'lucide-react'
import { CustomerDetail, UpdateCustomerPayload, BlockedSsnRecord, getCustomer, updateCustomer, blockSsn, unblockSsn, checkBlockedSsn } from '@/api/customerApi'
import { GdprExclusionType, GdprExclusionTypeOption, getExclusionTypes, flagCustomer, unflagCustomer } from '@/api/gdprApi'
import { toast } from 'sonner'
import { getSinfridAccount } from '@/api/sinfridApi'
import { SinfridPanel } from './SinfridPanel'
import { CustomerChangesPanel } from './CustomerChanges'

/* ── helpers ──────────────────────────────────────────────── */

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function calcAge(birthdate: string | null): number | null {
  if (!birthdate) return null
  const today = new Date()
  const b = new Date(birthdate)
  let a = today.getFullYear() - b.getFullYear()
  const m = today.getMonth() - b.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < b.getDate())) a--
  return a
}

function formatBirthdate(birthdate: string | null): string | null {
  if (!birthdate) return null
  const d = new Date(birthdate)
  const a = calcAge(birthdate)
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return formatted
}

function isBirthdayToday(birthdate: string | null): boolean {
  if (!birthdate) return false
  const parts = birthdate.split('-')
  if (parts.length < 3) return false
  const today = new Date()
  return today.getMonth() + 1 === parseInt(parts[1]) && today.getDate() === parseInt(parts[2])
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button type="button" onClick={copy}
      className="flex items-center gap-1 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      {label && <span className="text-[10px]">{copied ? 'Copied' : label}</span>}
    </button>
  )
}

const SEX_OPTIONS = [
  { value: 'unknown', label: 'Unknown' },
  { value: 'male',    label: 'Male'    },
  { value: 'female',  label: 'Female'  },
]
const PAYMENT_OPTIONS = [
  { value: '',              label: '—'             },
  { value: 'autogiro',      label: 'Autogiro'      },
  { value: 'b-post',        label: 'B-post'        },
  { value: 'email',         label: 'Email'         },
  { value: 'sms',           label: 'SMS'           },
  { value: 'paper, no fee', label: 'Paper (no fee)'},
  { value: 'einvoice',      label: 'E-invoice'     },
]

/* ── sidebar form fields ── */

function SidebarField({ label, value, onChange, mono, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; mono?: boolean; type?: string
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</div>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)}
        className={`h-7 text-xs px-2 w-full ${mono ? 'font-mono' : ''}`} />
    </div>
  )
}

function SidebarSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-0.5">
      <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">{label}</div>
      <AppSelect
        options={options}
        value={options.find(o => o.value === value) ?? null}
        onChange={opt => onChange(opt ? (opt as SelectOption).value : '')}
        isSearchable={false}
        classNames={{ control: () => '!min-h-7 h-7 text-xs' }}
      />
    </div>
  )
}

/* ── contact row (always visible, shows empty placeholder) ── */

function ContactRow({ icon: Icon, value, placeholder, accent }: {
  icon: React.ElementType
  value?: string | null
  placeholder: string
  accent?: boolean
}) {
  const empty = !value
  return (
    <div className="flex items-center gap-2 py-[4px]">
      <Icon className={`h-4 w-4 shrink-0 ${empty ? 'text-muted-foreground/40' : 'text-muted-foreground'}`} />
      <span className={`leading-snug ${
        empty    ? 'text-xs text-muted-foreground/50 italic' :
        accent   ? 'text-base text-green-600 font-medium' :
                   'text-xs text-foreground'
      }`}>
        {empty ? placeholder : value}
      </span>
    </div>
  )
}

/* ── form type ── */

type EditForm = {
  first_name: string; last_name: string
  email: string; alternative_email: string
  tel: string; alternative_tel: string
  pers_nr: string; sex: string; birthdate: string; careof: string
  adress: string; post_nr: string; ort: string; region_code: string
  sync: boolean; credit_check: string
  payment_preference: string; delivery_method: string
}

function toForm(d: CustomerDetail): EditForm {
  return {
    first_name: d.first_name ?? '', last_name: d.last_name ?? '',
    email: d.email ?? '', alternative_email: d.alternative_email ?? '',
    tel: d.tel ?? '', alternative_tel: d.alternative_tel ?? '',
    pers_nr: d.pers_nr ?? '', sex: d.sex ?? 'unknown',
    birthdate: d.birthdate ?? '', careof: d.careof ?? '',
    adress: d.adress ?? '', post_nr: d.post_nr ?? '', ort: d.ort ?? '', region_code: d.region_code ?? '',
    sync: d.sync ?? true,
    credit_check: d.credit_check !== null && d.credit_check !== undefined ? String(d.credit_check) : '',
    payment_preference: d.payment_preference ?? '', delivery_method: d.delivery_method ?? '',
  }
}

/* ── page ── */

export default function CustomerDetailPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [detail, setDetail]       = useState<CustomerDetail | null>(null)
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [form, setForm]           = useState<EditForm | null>(null)
  const [error, setError]         = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [remindersOpen, setRemindersOpen]       = useState(false)
  const [orgDropdownOpen, setOrgDropdownOpen]   = useState(false)
  const [pendingToggle, setPendingToggle]       = useState<'sync' | 'credit' | null>(null)
  const [pendingToggleType, setPendingToggleType] = useState<'sync' | 'credit'>('sync')
  const [blockedSsnRecord, setBlockedSsnRecord] = useState<BlockedSsnRecord | null>(null)
  const [ssnConfirmMode, setSsnConfirmMode]     = useState<'block' | 'unblock' | null>(null)
  const [ssnConfirmReason, setSsnConfirmReason] = useState('')
  const [ssnConfirmSaving, setSsnConfirmSaving] = useState(false)
  const [flagsOpen, setFlagsOpen]               = useState(false)
  const [flagsForm, setFlagsForm]               = useState({ do_not_call: false, difficult_customer: false, block_email: false, block_dm: false, reminders: false })
  const [gdprConfirmMode, setGdprConfirmMode]   = useState<'flag' | 'unflag' | null>(null)
  const [gdprExclusionType, setGdprExclusionType] = useState<GdprExclusionType | ''>('')
  const [gdprExclusionTypes, setGdprExclusionTypes] = useState<GdprExclusionTypeOption[]>([])
  const [gdprConfirmSaving, setGdprConfirmSaving] = useState(false)
  const [flagsSaving, setFlagsSaving]           = useState(false)
  const [sinfridOpen, setSinfridOpen]           = useState(false)
  const orgHoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [hasSinfrid, setHasSinfrid]       = useState(false)
  const [commentsOpen, setCommentsOpen]   = useState(false)
  const [changesOpen, setChangesOpen]     = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    getCustomer(Number(id))
      .then(res => {
        setDetail(res.data)
        if (res.data.pers_nr) {
          checkBlockedSsn(res.data.pers_nr)
            .then(record => setBlockedSsnRecord(record))
            .catch(() => setBlockedSsnRecord(null))
        }
      })
      .catch(() => setError('Failed to load customer.'))
      .finally(() => setLoading(false))
    getSinfridAccount(Number(id))
      .then(res => setHasSinfrid(res.data !== null))
      .catch(() => setHasSinfrid(false))
    getExclusionTypes()
      .then(res => setGdprExclusionTypes(res.data))
      .catch(() => {})
  }, [id])

  function startEdit() {
    if (!detail) return
    setForm(toForm(detail)); setError(null); setEditing(true)
  }
  function cancelEdit() { setEditing(false); setForm(null); setError(null) }

  function orgEnter() { clearTimeout(orgHoverTimer.current); setOrgDropdownOpen(true) }
  function orgLeave() { orgHoverTimer.current = setTimeout(() => setOrgDropdownOpen(false), 180) }

  async function toggleSync() {
    if (!id) return
    try {
      const res = await updateCustomer(Number(id), { sync: !detail!.sync })
      setDetail(res.data)
      toast.success(res.message)
    } catch {
      toast.error('Failed to update address sync')
    }
  }

  async function toggleCreditCheck() {
    if (!id) return
    const next = detail!.credit_check !== null && detail!.credit_check > 0 ? 0 : 1
    try {
      const res = await updateCustomer(Number(id), { credit_check: next })
      setDetail(res.data)
      toast.success(res.message)
    } catch {
      toast.error('Failed to update credit check')
    }
  }

  function openFlagsDialog() {
    if (!detail) return
    setFlagsForm({ do_not_call: detail.do_not_call, difficult_customer: detail.difficult_customer, block_email: detail.block_email, block_dm: detail.block_dm, reminders: detail.reminders })
    setFlagsOpen(true)
  }

  async function saveFlagsEdit() {
    if (!id) return
    setFlagsSaving(true)
    try {
      const res = await updateCustomer(Number(id), flagsForm)
      setDetail(res.data)
      setFlagsForm({
        do_not_call: res.data.do_not_call,
        difficult_customer: res.data.difficult_customer,
        block_email: res.data.block_email,
        block_dm: res.data.block_dm,
        reminders: res.data.reminders,
      })
      toast.success(res.message)
    } catch {
      toast.error('Failed to update flags')
    } finally {
      setFlagsSaving(false)
    }
  }

  function openSsnConfirm(mode: 'block' | 'unblock') {
    setFlagsOpen(false)
    setSsnConfirmMode(mode)
    setSsnConfirmReason('')
  }

  function cancelSsnConfirm() {
    setSsnConfirmMode(null)
    setSsnConfirmReason('')
    setFlagsOpen(true)
  }

  async function confirmBlockSsn() {
    if (!detail?.pers_nr) return
    setSsnConfirmSaving(true)
    try {
      const res = await blockSsn(detail.pers_nr, ssnConfirmReason || undefined)
      setBlockedSsnRecord(res.data)
      setSsnConfirmMode(null)
      setSsnConfirmReason('')
      toast.success(res.message)
    } catch {
      toast.error('Failed to block SSN')
    } finally {
      setSsnConfirmSaving(false)
    }
  }

  async function confirmUnblockSsn() {
    if (!blockedSsnRecord) return
    setSsnConfirmSaving(true)
    try {
      const res = await unblockSsn(blockedSsnRecord.id)
      setBlockedSsnRecord(null)
      setSsnConfirmMode(null)
      toast.success(res.message)
    } catch {
      toast.error('Failed to unblock SSN')
    } finally {
      setSsnConfirmSaving(false)
    }
  }

  function openGdprConfirm(mode: 'flag' | 'unflag') {
    setFlagsOpen(false)
    setGdprConfirmMode(mode)
    setGdprExclusionType('')
  }

  function cancelGdprConfirm() {
    setGdprConfirmMode(null)
    setGdprExclusionType('')
    setFlagsOpen(true)
  }

  async function confirmFlagGdpr() {
    if (!gdprExclusionType) return
    setGdprConfirmSaving(true)
    try {
      const res = await flagCustomer(detail!.id, gdprExclusionType as GdprExclusionType)
      setDetail(prev => prev ? { ...prev, block_gdpr: true } : prev)
      setGdprConfirmMode(null)
      toast.success(res.message)
    } catch {
      toast.error('Failed to flag customer for GDPR')
    } finally {
      setGdprConfirmSaving(false)
    }
  }

  async function confirmUnflagGdpr() {
    setGdprConfirmSaving(true)
    try {
      const res = await unflagCustomer(detail!.id)
      setDetail(prev => prev ? { ...prev, block_gdpr: false } : prev)
      setGdprConfirmMode(null)
      toast.success(res.message)
    } catch {
      toast.error('Failed to remove GDPR flag')
    } finally {
      setGdprConfirmSaving(false)
    }
  }

  async function saveEdit() {
    if (!form || !id) return
    setSaving(true); setError(null)
    try {
      const payload: UpdateCustomerPayload = {
        first_name: form.first_name || undefined,        last_name: form.last_name || undefined,
        email: form.email || undefined,                  alternative_email: form.alternative_email || undefined,
        tel: form.tel || undefined,                      alternative_tel: form.alternative_tel || undefined,
        pers_nr: form.pers_nr || undefined,              sex: (form.sex as 'male' | 'female' | 'unknown') || undefined,
        birthdate: form.birthdate || undefined,          careof: form.careof || undefined,
        adress: form.adress || undefined,                post_nr: form.post_nr || undefined,
        ort: form.ort || undefined,                      region_code: form.region_code || undefined,
        sync: form.sync,
        credit_check: form.credit_check !== '' ? Number(form.credit_check) : null,
        payment_preference: form.payment_preference || null,
        delivery_method: form.delivery_method || undefined,
      }
      const res = await updateCustomer(Number(id), payload)
      setDetail(res.data); setEditing(false); setForm(null)
      toast.success(res.message)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Save failed'
      setError(msg)
      toast.error(msg)
    } finally { setSaving(false) }
  }

  function setField<K extends keyof EditForm>(key: K, val: EditForm[K]) {
    setForm(prev => prev ? { ...prev, [key]: val } : prev)
  }

  /* ── loading ── */
  if (loading) return (
    <div className="flex h-screen">
      <div className="w-64 shrink-0 border-r border-border bg-card p-4 space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-5 w-3/4 mx-auto" />
        <div className="space-y-2 pt-2">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        </div>
      </div>
      <div className="flex-1 bg-muted/30 p-6 space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )

  if (error && !detail) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-3">
        <p className="text-sm text-destructive bg-destructive/5 border border-destructive/10 rounded-lg px-5 py-3">{error}</p>
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>Go back</Button>
      </div>
    </div>
  )

  if (!detail) return null

  const fullName    = `${detail.first_name} ${detail.last_name}`
  const fullAddress = [detail.adress, detail.post_nr, detail.ort].filter(Boolean).join('\n')

  const isVip      = detail.ltv >= 10000 || detail.order_count >= 10
  const isBirthday = isBirthdayToday(detail.birthdate)

  const paymentLabel = PAYMENT_OPTIONS.find(o => o.value === detail.payment_preference)?.label
    ?? detail.payment_preference

  return (
    <div className="customer-detail flex flex-col h-full min-h-screen relative">

      {/* ── Profile Header ── */}
      <div className="customer-header flex items-center gap-3 px-4 py-3 bg-card border-b border-border shrink-0">
        {!editing && (
          <div className="customer-name min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-base leading-tight truncate">{fullName}</span>
              {isVip && (
                <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 uppercase tracking-wide shrink-0">
                  <Crown className="h-3.5 w-3.5" /> VIP
                </span>
              )}
              {isBirthday && (
                <span className="inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-300 shrink-0">
                  <Cake className="h-3.5 w-3.5" /> Birthday!
                </span>
              )}
              {/* Reminders — click */}
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button type="button" onClick={() => setRemindersOpen(true)}
                    className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-amber-100 text-amber-600 border border-amber-300 hover:bg-amber-200 transition-colors shrink-0">
                    <Bell className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Reminders</TooltipContent>
              </Tooltip>
              {/* Organization — hover dropdown */}
              <div className="relative shrink-0" onMouseEnter={orgEnter} onMouseLeave={orgLeave}>
                <button type="button"
                  className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-violet-100 text-violet-600 border border-violet-300 hover:bg-violet-200 transition-colors">
                  <Building2 className="h-3.5 w-3.5" />
                </button>
                {orgDropdownOpen && (
                  <div
                    className="absolute left-0 top-full mt-2 z-50 w-80 bg-popover border border-border rounded-lg shadow-lg overflow-hidden"
                    onMouseEnter={orgEnter} onMouseLeave={orgLeave}
                  >
                    <div className="px-4 py-2.5 border-b border-border flex items-center gap-2 bg-muted/40">
                      <Building2 className="h-3.5 w-3.5 text-violet-500" />
                      <span className="text-xs font-semibold">Organization</span>
                    </div>
                    <div className="p-4">
                      <CustomerOrganization customerId={detail.id} />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5 flex-wrap">
              <span className="text-xs font-medium text-foreground">{detail.pers_nr || '—'}</span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-0.5"><ShoppingBag className="h-3 w-3" />{detail.order_count}</span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-0.5"><TrendingUp className="h-3 w-3" />{detail.ltv.toLocaleString('sv-SE', { maximumFractionDigits: 0 })} kr</span>
            </div>
          </div>
        )}

      </div>

      {/* ── Body ── */}
      <div className="customer-body flex flex-1 overflow-hidden">
      <aside className={`customer-sidebar shrink-0 bg-card border-r border-border flex flex-col transition-all duration-200 ${sidebarCollapsed ? 'w-12 overflow-hidden' : 'w-64 overflow-y-auto'}`}>

        {/* ── Toggle / Edit bar (always first so it's visible when collapsed) ── */}
        <div className="customer-sidebar-actions px-2 py-1.5 flex items-center justify-between shrink-0">
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <button type="button" onClick={() => { if (editing) cancelEdit(); setSidebarCollapsed(c => !c) }}
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0">
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">{sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}</TooltipContent>
          </Tooltip>
          {!sidebarCollapsed && !editing ? (
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button type="button" onClick={startEdit}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Pencil className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Edit profile</TooltipContent>
            </Tooltip>
          ) : !sidebarCollapsed ? (
            <div className="flex items-center gap-0.5">
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button type="button" onClick={cancelEdit} disabled={saving}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50">
                    <X className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Cancel</TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={200}>
                <TooltipTrigger asChild>
                  <button type="button" onClick={saveEdit} disabled={saving}
                    className="p-1.5 rounded-md text-primary hover:bg-primary/10 transition-colors disabled:opacity-50">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Save</TooltipContent>
              </Tooltip>
            </div>
          ) : null}
        </div>

        {/* ── Name edit (edit mode) ── */}
        {editing && form && (
          <div className="customer-sidebar-name px-3 pt-3 pb-3 space-y-2 shrink-0">
            <SidebarField label="First Name" value={form.first_name} onChange={v => setField('first_name', v)} />
            <SidebarField label="Last Name"  value={form.last_name}  onChange={v => setField('last_name', v)} />
          </div>
        )}

        {/* ── Collapsed icon strip ── */}
        {!editing && sidebarCollapsed && (
          <div className="flex flex-col items-center gap-1 py-2">
            {([
              { icon: Mail,     value: detail.email,          placeholder: 'No email' },
              { icon: Phone,    value: detail.tel,             placeholder: 'No phone' },
              { icon: MapPin,   value: fullAddress || detail.region_code, placeholder: 'No address' },
              { icon: User,     value: detail.sex !== 'unknown' ? detail.sex : null, placeholder: 'No gender' },
              { icon: Cake,     value: formatBirthdate(detail.birthdate), placeholder: 'No birthdate' },
              { icon: CardIcon, value: paymentLabel && paymentLabel !== '—' ? paymentLabel : null, placeholder: 'No payment' },
              { icon: Truck,    value: detail.delivery_method, placeholder: 'No delivery' },
              { icon: Users,    value: detail.careof,          placeholder: 'No careof' },
            ] as { icon: React.ElementType; value: string | null; placeholder: string }[]).map(({ icon: Icon, value, placeholder }, i) => (
              <Tooltip key={i} delayDuration={200}>
                <TooltipTrigger asChild>
                  <button type="button" className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                    <Icon className={`h-5 w-5 ${value ? 'text-muted-foreground' : 'text-muted-foreground/30'}`} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{value || placeholder}</TooltipContent>
              </Tooltip>
            ))}
            <div className="w-5 border-t border-border/40 my-0.5" />
            {/* Address Sync — clickable */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button type="button" onClick={() => { setPendingToggleType('sync'); setPendingToggle('sync') }}
                  className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                  {detail.sync
                    ? <ShieldCheck className="h-5 w-5 text-green-500" />
                    : <ShieldX     className="h-5 w-5 text-red-500" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Address Sync — {detail.sync ? 'On' : 'Off'}</TooltipContent>
            </Tooltip>
            {/* Credit Check — clickable */}
            <Tooltip delayDuration={200}>
              <TooltipTrigger asChild>
                <button type="button" onClick={() => { setPendingToggleType('credit'); setPendingToggle('credit') }}
                  className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted transition-colors">
                  {detail.credit_check !== null && detail.credit_check > 0
                    ? <ShieldCheck className="h-5 w-5 text-green-500" />
                    : <ShieldX     className="h-5 w-5 text-red-500" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Credit Check — {detail.credit_check !== null && detail.credit_check > 0 ? 'Approved' : 'Rejected'}</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* ── Contact rows (view) ── */}
        {!editing && !sidebarCollapsed && (
          <div className="customer-contact px-4 py-2 flex-1">
            <ContactRow icon={Mail}     value={detail.email}        placeholder="No email" />
            <ContactRow icon={Phone}    value={detail.tel}          placeholder="No phone number" />
            <ContactRow icon={MapPin}   value={detail.region_code}  placeholder="No region" />
            <ContactRow icon={User}     value={detail.sex !== 'unknown' ? (detail.sex.charAt(0).toUpperCase() + detail.sex.slice(1)) : null} placeholder="No gender" />
            <ContactRow icon={Cake}     value={formatBirthdate(detail.birthdate)} placeholder="No birthdate" />
            <ContactRow icon={CardIcon} value={paymentLabel && paymentLabel !== '—' ? paymentLabel : null} placeholder="No payment preference" />
            <ContactRow icon={Truck}    value={detail.delivery_method} placeholder="No delivery method" accent={!!detail.delivery_method} />
            <ContactRow icon={Users}    value={detail.careof}       placeholder="No careof" />

            {/* Address section */}
            <div className="mt-3 mb-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">Address</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[190px]">
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(
                      [fullName, fullAddress].filter(Boolean).join('\n')
                    )}>
                      Name &amp; Address
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(
                      [fullName, fullAddress, detail.tel].filter(Boolean).join('\n')
                    )}>
                      Name, Address &amp; Phone
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {detail.adress || detail.post_nr || detail.ort ? (
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    {detail.adress && <div>{detail.adress}</div>}
                    {detail.post_nr && <div>{detail.post_nr}</div>}
                    {detail.ort    && <div>{detail.ort}</div>}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  <span className="text-sm text-muted-foreground/50 italic">No address</span>
                </div>
              )}
            </div>

            {/* Addr Sync + Credit Check cards */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {/* Address Sync — click to confirm + toggle */}
              <button
                type="button"
                onClick={() => { setPendingToggleType('sync'); setPendingToggle('sync') }}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 w-full cursor-pointer hover:opacity-80 active:scale-95 transition-all ${
                  detail.sync ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className={`h-7 w-7 rounded-full flex items-center justify-center ${
                  detail.sync ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {detail.sync
                    ? <ShieldCheck className="h-4 w-4 text-white" />
                    : <ShieldX     className="h-4 w-4 text-white" />}
                </div>
                <span className={`text-[10px] font-semibold ${detail.sync ? 'text-green-800' : 'text-red-800'}`}>
                  Address Sync
                </span>
              </button>

              {/* Credit Check — click to confirm + toggle */}
              <button
                type="button"
                onClick={() => { setPendingToggleType('credit'); setPendingToggle('credit') }}
                className={`flex flex-col items-center gap-1.5 rounded-xl border py-3 px-2 w-full cursor-pointer hover:opacity-80 active:scale-95 transition-all ${
                  detail.credit_check === null
                    ? 'border-border bg-muted/40'
                    : detail.credit_check > 0
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                }`}
              >
                <div className={`h-7 w-7 rounded-full flex items-center justify-center ${
                  detail.credit_check === null
                    ? 'bg-muted-foreground/30'
                    : detail.credit_check > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {detail.credit_check !== null && detail.credit_check > 0
                    ? <ShieldCheck className="h-4 w-4 text-white" />
                    : <ShieldX     className="h-4 w-4 text-white" />}
                </div>
                <span className={`text-[10px] font-semibold ${
                  detail.credit_check === null ? 'text-muted-foreground'
                  : detail.credit_check > 0 ? 'text-green-800' : 'text-red-800'
                }`}>
                  Credit Check
                </span>
              </button>
            </div>

          </div>
        )}

        {/* ── All fields (edit mode) ── */}
        {editing && form && (
          <div className="customer-edit-form px-3 py-2 space-y-2 overflow-y-auto flex-1">
            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 pt-1">Contact</div>
            <SidebarField label="SSN"        value={form.pers_nr}           onChange={v => setField('pers_nr', v)} mono />
            <SidebarField label="Email"      value={form.email}             onChange={v => setField('email', v)} type="email" />
            <SidebarField label="Alt. Email" value={form.alternative_email} onChange={v => setField('alternative_email', v)} type="email" />
            <SidebarField label="Phone"      value={form.tel}               onChange={v => setField('tel', v)} />
            <SidebarField label="Alt. Phone" value={form.alternative_tel}   onChange={v => setField('alternative_tel', v)} />

            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 pt-3">Personal</div>
            <SidebarSelect label="Sex"       value={form.sex}       onChange={v => setField('sex', v)} options={SEX_OPTIONS} />
            <SidebarField  label="Birthdate" value={form.birthdate} onChange={v => setField('birthdate', v)} />

            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 pt-3">Address</div>
            <SidebarField label="Care of" value={form.careof}      onChange={v => setField('careof', v)} />
            <SidebarField label="Street"  value={form.adress}      onChange={v => setField('adress', v)} />
            <SidebarField label="Postal"  value={form.post_nr}     onChange={v => setField('post_nr', v)} />
            <SidebarField label="City"    value={form.ort}         onChange={v => setField('ort', v)} />
            <SidebarField label="Region"  value={form.region_code} onChange={v => setField('region_code', v)} />

            <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50 pt-3">Preferences</div>
            <SidebarSelect label="Payment"  value={form.payment_preference} onChange={v => setField('payment_preference', v)} options={PAYMENT_OPTIONS} />
            <SidebarField  label="Delivery" value={form.delivery_method}    onChange={v => setField('delivery_method', v)} />

            {error && (
              <p className="text-xs text-destructive bg-destructive/5 rounded-lg border border-destructive/10 px-2 py-1.5 mt-2">
                {error}
              </p>
            )}
          </div>
        )}
      </aside>

      <div className="customer-main flex-1 min-w-0 bg-muted/30" />
      </div>{/* /customer-body */}

      {/* Floating buttons — fixed to viewport right edge */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1">
        {hasSinfrid && !sinfridOpen && (
          <div className="relative group cursor-pointer">
            <button
              onClick={() => setSinfridOpen(true)}
              className="flex items-center justify-center rounded-l-xl bg-rose-100 hover:bg-rose-200 active:bg-rose-300 text-rose-500 border border-r-0 border-rose-200 shadow-sm transition-all p-2.5"
            >
              <HeartPulse className="h-5 w-5" />
            </button>
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 rounded-md bg-popover border border-border text-foreground text-xs shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
              Sinfrid Dashboard
            </div>
          </div>
        )}
        <div className="relative group cursor-pointer">
          <button
            onClick={openFlagsDialog}
            className="flex items-center justify-center rounded-l-xl bg-orange-100 hover:bg-orange-200 active:bg-orange-300 text-orange-500 border border-r-0 border-orange-200 shadow-sm transition-all p-2.5"
          >
            <Flag className="h-5 w-5" />
          </button>
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 rounded-md bg-popover border border-border text-foreground text-xs shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
            Blocked Flags
          </div>
        </div>
        {!commentsOpen && (
          <div className="relative group cursor-pointer">
            <button
              onClick={() => setCommentsOpen(true)}
              className="flex items-center justify-center rounded-l-xl bg-blue-100 hover:bg-blue-200 active:bg-blue-300 text-blue-500 border border-r-0 border-blue-200 shadow-sm transition-all p-2.5"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 rounded-md bg-popover border border-border text-foreground text-xs shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
              Comments
            </div>
          </div>
        )}
        {!changesOpen && (
          <div className="relative group cursor-pointer">
            <button
              onClick={() => setChangesOpen(true)}
              className="flex items-center justify-center rounded-l-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-500 border border-r-0 border-slate-200 shadow-sm transition-all p-2.5"
            >
              <History className="h-5 w-5" />
            </button>
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 px-2 py-1 rounded-md bg-popover border border-border text-foreground text-xs shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
              Customer Changes
            </div>
          </div>
        )}
      </div>

      <Dialog open={remindersOpen} onOpenChange={setRemindersOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[80vh] flex flex-col p-0" showCloseButton={false}>
          <DialogHeader className="px-5 py-4 border-b border-border shrink-0 flex-row items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" /> Reminders
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-5">
            <CustomerReminders customerId={detail.id} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation — Address Sync / Credit Check */}
      <Dialog open={pendingToggle !== null} onOpenChange={v => !v && setPendingToggle(null)}>
        <DialogContent className="sm:max-w-[360px]" showCloseButton={false}>
          <DialogHeader className="flex flex-col items-center text-center py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 ring-4 ring-amber-200 mb-3">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-base leading-snug">
              {pendingToggleType === 'sync'
                ? detail.sync
                  ? <>You're about to <strong>disable</strong> the syncing of customer address to Arvato.</>
                  : <>You're about to <strong>enable</strong> the syncing of customer address to Arvato.</>
                : (detail.credit_check !== null && detail.credit_check > 0)
                  ? <>You're about to <strong>disable</strong> the credit check validation.</>
                  : <>You're about to <strong>enable</strong> the credit check validation.</>
              }
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center mt-2">
            <Button variant="outline" onClick={() => setPendingToggle(null)}>Cancel</Button>
            <Button onClick={async () => {
              if (pendingToggle === 'sync') await toggleSync()
              else await toggleCreditCheck()
              setPendingToggle(null)
            }}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Blocked Flags dialog */}
      <Dialog open={flagsOpen} onOpenChange={v => !v && setFlagsOpen(false)}>
        <DialogContent className="sm:max-w-[360px]" showCloseButton={false}>
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Flag className="h-4 w-4 text-rose-500" /> Blocked Flags
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {([
              { key: 'do_not_call',        label: 'Do Not Call',        desc: 'Customer must not be contacted by phone' },
              { key: 'difficult_customer', label: 'Difficult Customer',  desc: 'Flag customer as difficult' },
              { key: 'block_email',        label: 'Block Email',         desc: 'Prevent emails from being sent' },
              { key: 'block_dm',           label: 'Block DM',            desc: 'Prevent direct messages' },
              { key: 'reminders',          label: 'Reminders',           desc: 'Enable customer reminders' },
            ] as { key: keyof typeof flagsForm; label: string; desc: string }[]).map(({ key, label, desc }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFlagsForm(f => ({ ...f, [key]: !f[key] }))}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors text-left ${
                  flagsForm[key]
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                }`}
              >
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-[11px] text-muted-foreground">{desc}</div>
                </div>
                <div className={`shrink-0 h-5 w-9 rounded-full border-2 relative transition-colors ${
                  flagsForm[key] ? 'bg-rose-500 border-rose-500' : 'bg-muted border-border'
                }`}>
                  <div className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                    flagsForm[key] ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-border" />
          <div className="space-y-1">
            {/* GDPR Flag row */}
            <button
              type="button"
              onClick={() => openGdprConfirm(detail.block_gdpr ? 'unflag' : 'flag')}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors text-left ${
                detail.block_gdpr
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-muted/40 border-border text-foreground hover:bg-muted'
              }`}
            >
              <div>
                <div className="text-sm font-medium flex items-center gap-1.5"><ShieldAlert className="h-3.5 w-3.5" /> GDPR Flag</div>
                <div className="text-[11px] text-muted-foreground">
                  {detail.block_gdpr ? 'GDPR exclusion is active' : 'No GDPR exclusion applied'}
                </div>
              </div>
              <div className={`shrink-0 h-5 w-9 rounded-full border-2 relative transition-colors ${
                detail.block_gdpr ? 'bg-rose-500 border-rose-500' : 'bg-muted border-border'
              }`}>
                <div className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                  detail.block_gdpr ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </div>
            </button>
            {/* Block SSN row */}
            <button
              type="button"
              onClick={() => openSsnConfirm(blockedSsnRecord ? 'unblock' : 'block')}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border transition-colors text-left ${
                blockedSsnRecord
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-muted/40 border-border text-foreground hover:bg-muted'
              }`}
            >
              <div>
                <div className="text-sm font-medium flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> Block SSN</div>
                <div className="text-[11px] text-muted-foreground">
                  {blockedSsnRecord ? 'Blocked from placing orders across all channels' : 'SSN is not blocked'}
                </div>
              </div>
              <div className={`shrink-0 h-5 w-9 rounded-full border-2 relative transition-colors ${
                blockedSsnRecord ? 'bg-rose-500 border-rose-500' : 'bg-muted border-border'
              }`}>
                <div className={`absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                  blockedSsnRecord ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
              </div>
            </button>
          </div>
          <DialogFooter className="gap-2 sm:justify-end mt-1">
            <Button variant="outline" onClick={() => setFlagsOpen(false)} disabled={flagsSaving}>Cancel</Button>
            <Button onClick={saveFlagsEdit} disabled={flagsSaving}>
              {flagsSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block SSN confirmation */}
      <Dialog open={ssnConfirmMode === 'block'} onOpenChange={v => { if (!v) cancelSsnConfirm() }}>
        <DialogContent className="sm:max-w-[400px]" showCloseButton={false}>
          <DialogHeader className="flex flex-col items-center text-center py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 ring-4 ring-rose-200 mb-3">
              <KeyRound className="h-6 w-6 text-rose-600" />
            </div>
            <DialogTitle className="text-base leading-snug">
              Block SSN <span className="font-mono text-sm text-muted-foreground">{detail.pers_nr}</span>
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">This will permanently block this SSN from placing any orders across all channels.</p>
          </DialogHeader>
          <div className="px-1 py-2">
            <textarea
              value={ssnConfirmReason}
              onChange={e => setSsnConfirmReason(e.target.value)}
              placeholder="e.g. ID-theft victim - reported by customer service"
              rows={3}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={cancelSsnConfirm} disabled={ssnConfirmSaving}>Cancel</Button>
            <Button variant="destructive" onClick={confirmBlockSsn} disabled={ssnConfirmSaving || !detail.pers_nr}>
              {ssnConfirmSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Block SSN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unblock SSN confirmation */}
      <Dialog open={ssnConfirmMode === 'unblock'} onOpenChange={v => { if (!v) cancelSsnConfirm() }}>
        <DialogContent className="sm:max-w-[360px]" showCloseButton={false}>
          <DialogHeader className="flex flex-col items-center text-center py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 ring-4 ring-amber-200 mb-3">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-base leading-snug">
              Unblock SSN <span className="font-mono text-sm text-muted-foreground">{detail.pers_nr}</span>
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">This will permanently remove this SSN from the blocked list, allowing orders to be placed again across all channels.</p>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center mt-2">
            <Button variant="outline" onClick={cancelSsnConfirm} disabled={ssnConfirmSaving}>Cancel</Button>
            <Button onClick={confirmUnblockSsn} disabled={ssnConfirmSaving}>
              {ssnConfirmSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Unblock SSN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GDPR Flag confirmation */}
      <Dialog open={gdprConfirmMode === 'flag'} onOpenChange={v => { if (!v) cancelGdprConfirm() }}>
        <DialogContent className="sm:max-w-[420px]" showCloseButton={false}>
          <DialogHeader className="flex flex-col items-center text-center py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 ring-4 ring-rose-200 mb-3">
              <ShieldAlert className="h-6 w-6 text-rose-600" />
            </div>
            <DialogTitle className="text-base leading-snug">Flag Customer for GDPR</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">This will permanently block this customer from receiving any communications and mark them for GDPR processing.</p>
          </DialogHeader>
          <div className="px-1 py-2 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-1">Choose GDPR Exclusion</p>
            {gdprExclusionTypes.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGdprExclusionType(opt.value)}
                className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-colors text-left ${
                  gdprExclusionType === opt.value
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-muted/40 border-border hover:bg-muted'
                }`}
              >
                <div className={`mt-0.5 shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                  gdprExclusionType === opt.value ? 'border-rose-500 bg-rose-500' : 'border-border bg-background'
                }`}>
                  {gdprExclusionType === opt.value && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                <div className="text-sm">{opt.label}</div>
              </button>
            ))}
          </div>
          <DialogFooter className="gap-2 sm:justify-center">
            <Button variant="outline" onClick={cancelGdprConfirm} disabled={gdprConfirmSaving}>Cancel</Button>
            <Button variant="destructive" onClick={confirmFlagGdpr} disabled={gdprConfirmSaving || !gdprExclusionType}>
              {gdprConfirmSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Flag for GDPR
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* GDPR Unflag confirmation */}
      <Dialog open={gdprConfirmMode === 'unflag'} onOpenChange={v => { if (!v) cancelGdprConfirm() }}>
        <DialogContent className="sm:max-w-[360px]" showCloseButton={false}>
          <DialogHeader className="flex flex-col items-center text-center py-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 ring-4 ring-amber-200 mb-3">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <DialogTitle className="text-base leading-snug">Remove GDPR Flag</DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">This will remove the GDPR flag and allow the customer to receive communications again.</p>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center mt-2">
            <Button variant="outline" onClick={cancelGdprConfirm} disabled={gdprConfirmSaving}>Cancel</Button>
            <Button onClick={confirmUnflagGdpr} disabled={gdprConfirmSaving}>
              {gdprConfirmSaving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              Remove Flag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CommentsPanel
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        customerId={detail.id}
        customerName={fullName}
      />

      <SinfridPanel
        open={sinfridOpen}
        onClose={() => setSinfridOpen(false)}
        customerId={detail.id}
        customerName={fullName}
      />

      <CustomerChangesPanel
        open={changesOpen}
        onClose={() => setChangesOpen(false)}
        customerId={detail.id}
        customerName={fullName}
      />
    </div>
  )
}

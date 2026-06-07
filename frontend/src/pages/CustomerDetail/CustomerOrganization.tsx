import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Pencil, Save, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  CustomerOrganization as OrgType,
  OrganizationPayload,
  getOrganization,
  upsertOrganization,
} from '@/api/customerApi'

export function CustomerOrganization({ customerId }: { customerId: number }) {
  const [org, setOrg]         = useState<OrgType | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [contactEmail, setContactEmail] = useState('')
  const [invoiceEmail, setInvoiceEmail] = useState('')

  useEffect(() => {
    getOrganization(customerId)
      .then(res => setOrg(res.data))
      .catch(() => setError('Failed to load organization.'))
      .finally(() => setLoading(false))
  }, [customerId])

  function startEdit() {
    setContactEmail(org?.contact_email ?? '')
    setInvoiceEmail(org?.invoice_email ?? '')
    setError(null)
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const payload: OrganizationPayload = {
        id:            org?.id ?? '',
        name:          org?.name ?? '',
        contact_email: contactEmail,
        invoice_email: invoiceEmail,
      }
      const res = await upsertOrganization(customerId, payload)
      setOrg(res.data)
      setEditing(false)
      toast.success(res.message)
    } catch {
      toast.error('Failed to save organization')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-xs text-muted-foreground py-4">Loading…</p>

  if (!org && !editing) return (
    <p className="text-xs text-muted-foreground py-4">No organization linked.</p>
  )

  const rows: { label: string; value: string | null | undefined; mono?: boolean; editable?: 'contact' | 'invoice' }[] = [
    { label: 'Org ID',        value: org?.id,            mono: true  },
    { label: 'Name',          value: org?.name                       },
    { label: 'Contact Email', value: org?.contact_email, editable: 'contact' },
    { label: 'Invoice Email', value: org?.invoice_email, editable: 'invoice' },
  ]

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-xs text-destructive bg-destructive/5 rounded-lg border border-destructive/10 px-3 py-2">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {rows.map(row => (
          <div key={row.label} className="space-y-1">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
              {row.label}
            </div>
            {editing && row.editable ? (
              <Input
                type="email"
                value={row.editable === 'contact' ? contactEmail : invoiceEmail}
                onChange={e => row.editable === 'contact'
                  ? setContactEmail(e.target.value)
                  : setInvoiceEmail(e.target.value)
                }
                className="h-7 text-sm"
              />
            ) : (
              <span className={`text-sm block ${row.mono ? 'font-mono' : ''} ${!row.value ? 'text-muted-foreground/50 italic' : ''}`}>
                {row.value || '—'}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        {editing ? (
          <>
            <button
              onClick={() => setEditing(false)}
              disabled={saving}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </>
        ) : (
          <button
            onClick={startEdit}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-border hover:bg-muted transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
        )}
      </div>
    </div>
  )
}

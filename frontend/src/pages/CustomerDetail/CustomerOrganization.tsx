import { useEffect, useState } from 'react'
import { Building2, Pencil, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const [form, setForm]       = useState<OrganizationPayload>({ id: '' })

  useEffect(() => {
    getOrganization(customerId)
      .then(res => setOrg(res.data))
      .catch(() => setError('Failed to load organization.'))
      .finally(() => setLoading(false))
  }, [customerId])

  function startEdit() {
    setForm({
      id:            org?.id ?? '',
      name:          org?.name ?? '',
      contact_email: org?.contact_email ?? '',
      invoice_email: org?.invoice_email ?? '',
    })
    setError(null)
    setEditing(true)
  }

  async function handleSave() {
    if (!form.id.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await upsertOrganization(customerId, form)
      setOrg(res.data)
      setEditing(false)
    } catch {
      setError('Failed to save organization.')
    } finally {
      setSaving(false)
    }
  }

  function set(key: keyof OrganizationPayload, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  const rows = org ? [
    { label: 'Org ID',        value: org.id,            mono: true },
    { label: 'Name',          value: org.name },
    { label: 'Contact Email', value: org.contact_email },
    { label: 'Invoice Email', value: org.invoice_email },
  ].filter(r => r.value) : []

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Organization</h3>
        {!editing && !loading && (
          <Button variant="outline" size="sm" onClick={startEdit} className="h-7 text-xs gap-1">
            <Pencil className="h-3.5 w-3.5" /> {org ? 'Edit' : 'Add'}
          </Button>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive bg-destructive/5 rounded-lg border border-destructive/10 px-3 py-2">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-xs text-muted-foreground py-2">Loading…</p>
      ) : editing ? (
        <div className="rounded-lg border border-primary/30 bg-muted/20 px-4 py-4 space-y-3">
          {[
            { label: 'Org ID',         key: 'id'            as const, mono: true, type: 'text'  },
            { label: 'Name',           key: 'name'          as const, mono: false, type: 'text'  },
            { label: 'Contact Email',  key: 'contact_email' as const, mono: false, type: 'email' },
            { label: 'Invoice Email',  key: 'invoice_email' as const, mono: false, type: 'email' },
          ].map(f => (
            <div key={f.key} className="grid grid-cols-[9rem_1fr] items-center gap-3">
              <span className="text-sm text-muted-foreground">{f.label}</span>
              <Input
                type={f.type}
                value={(form[f.key] as string) ?? ''}
                onChange={e => set(f.key, e.target.value)}
                className={`h-8 text-sm ${f.mono ? 'font-mono' : ''}`}
              />
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving} className="h-7">
              <X className="h-3.5 w-3.5 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !form.id.trim()} className="h-7">
              <Save className="h-3.5 w-3.5 mr-1" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>
      ) : rows.length > 0 ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-border/50">
              {rows.map(row => (
                <tr key={row.label} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2 text-[11px] text-muted-foreground whitespace-nowrap w-36">{row.label}</td>
                  <td className={`px-4 py-2 text-sm font-medium break-all ${row.mono ? 'font-mono' : ''}`}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground py-2">No organization linked.</p>
      )}
    </div>
  )
}

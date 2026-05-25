import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Pencil, Trash2, Plus, Save, X, MessageSquare } from 'lucide-react'
import {
  CustomerComment,
  CommentPayload,
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '@/api/customerApi'

const BRANDS = ['All', 'Dentle', 'Grace', 'Zuave', 'Sinfrid'] as const

/* ── blank form ── */
const emptyForm = (): CommentPayload => ({ message: '', brand: 'All' })

/* ── single comment row ── */
function CommentRow({
  comment,
  onEdit,
  onDelete,
}: {
  comment: CustomerComment
  onEdit: (c: CustomerComment) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="rounded-lg border border-border px-4 py-3 space-y-1.5 group">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-relaxed flex-1">{comment.message}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit(comment)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(comment.id)}
            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        {comment.brand && (
          <span className="bg-muted rounded px-1.5 py-0.5 font-medium">{comment.brand}</span>
        )}
        {comment.initiator && <span>{comment.initiator}</span>}
        <span className="ml-auto">
          {new Date(comment.created_at).toLocaleDateString('sv-SE', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  )
}

/* ── add / edit form ── */
function CommentForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: CommentPayload
  onSave: (payload: CommentPayload) => Promise<void>
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<CommentPayload>(initial)

  function set(key: keyof CommentPayload, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSave() {
    if (!form.message.trim()) return
    await onSave(form)
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-muted/20 px-4 py-3 space-y-2.5">
      <textarea
        autoFocus
        placeholder="Write a comment…"
        value={form.message}
        onChange={e => set('message', e.target.value)}
        rows={3}
        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <Select value={form.brand ?? 'All'} onValueChange={v => set('brand', v)}>
        <SelectTrigger size="sm" className="w-full text-xs">
          <SelectValue placeholder="All Brand" />
        </SelectTrigger>
        <SelectContent>
          {BRANDS.map(b => (
            <SelectItem key={b} value={b}>{b}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={saving} className="h-7">
          <X className="h-3.5 w-3.5 mr-1" /> Cancel
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving || !form.message.trim()} className="h-7">
          <Save className="h-3.5 w-3.5 mr-1" />
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

/* ── main ── */
export function CustomerComments({ customerId }: { customerId: number }) {
  const [comments, setComments]     = useState<CustomerComment[]>([])
  const [loading, setLoading]       = useState(true)
  const [adding, setAdding]         = useState(false)
  const [editingId, setEditingId]   = useState<number | null>(null)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    getComments(customerId)
      .then(res => setComments(res.data))
      .catch(() => setError('Failed to load comments.'))
      .finally(() => setLoading(false))
  }, [customerId])

  async function handleCreate(payload: CommentPayload) {
    setSaving(true)
    try {
      const res = await createComment(customerId, payload)
      setComments(prev => [res.data, ...prev])
      setAdding(false)
    } catch {
      setError('Failed to save comment.')
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(commentId: number, payload: CommentPayload) {
    setSaving(true)
    try {
      const res = await updateComment(customerId, commentId, payload)
      setComments(prev => prev.map(c => c.id === commentId ? res.data : c))
      setEditingId(null)
    } catch {
      setError('Failed to update comment.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(commentId: number) {
    try {
      await deleteComment(customerId, commentId)
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch {
      setError('Failed to delete comment.')
    }
  }

  return (
    <div className="space-y-2">
      {/* header */}
      <div className="flex items-center justify-between pt-5 pb-2">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60 flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          Comments {comments.length > 0 && `(${comments.length})`}
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

      {/* add form */}
      {adding && (
        <CommentForm
          initial={emptyForm()}
          onSave={handleCreate}
          onCancel={() => setAdding(false)}
          saving={saving}
        />
      )}

      {/* list */}
      {loading ? (
        <p className="text-xs text-muted-foreground py-2">Loading…</p>
      ) : comments.length === 0 && !adding ? (
        <p className="text-xs text-muted-foreground py-2">No comments yet.</p>
      ) : (
        <div className="space-y-2">
          {comments.map(c =>
            editingId === c.id ? (
              <CommentForm
                key={c.id}
                initial={{ message: c.message, brand: c.brand ?? 'All' }}
                onSave={payload => handleUpdate(c.id, payload)}
                onCancel={() => setEditingId(null)}
                saving={saving}
              />
            ) : (
              <CommentRow
                key={c.id}
                comment={c}
                onEdit={c => setEditingId(c.id)}
                onDelete={handleDelete}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { AppSelect, SelectOption } from '@/components/AppSelect'
import { Pencil, Trash2, Plus, Save, X, MessageSquare } from 'lucide-react'
import { ConfirmDialog } from '@/pages/Gdpr/components/ConfirmDialog'
import {
  CustomerComment,
  CommentPayload,
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from '@/api/customerApi'

const BRANDS = ['All', 'Dentle', 'Grace', 'Zuave', 'Sinfrid'] as const
const BRAND_OPTIONS: SelectOption[] = BRANDS.map(b => ({ value: b, label: b }))

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
          {new Date(comment.created_at).toLocaleDateString('en-GB', {
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
      <AppSelect
        options={BRAND_OPTIONS}
        value={BRAND_OPTIONS.find(o => o.value === (form.brand ?? 'All')) ?? null}
        onChange={opt => set('brand', opt ? (opt as SelectOption).value : 'All')}
        isSearchable={false}
        menuPortalTarget={document.body}
        menuPosition="fixed"
        styles={{ menuPortal: base => ({ ...base, zIndex: 1000 }) }}
      />
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

/* ── panel (portal slide-over) ── */
export function CommentsPanel({ open, onClose, customerId, customerName }: {
  open: boolean
  onClose: () => void
  customerId: number
  customerName: string
}) {
  return createPortal(
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[998] bg-black/30 backdrop-blur-sm transition-opacity duration-300 cursor-pointer ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />
      <div className={`fixed top-4 right-0 bottom-4 w-[440px] max-h-[calc(100vh-2rem)] z-[999] bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out rounded-l-2xl overflow-hidden ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center gap-2.5 px-5 pt-5 pb-3 border-b border-border shrink-0">
          <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold">Comments</div>
            <p className="text-xs text-muted-foreground truncate">{customerName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <CustomerComments customerId={customerId} />
        </div>
      </div>
    </>,
    document.body
  )
}

/* ── main ── */
export function CustomerComments({ customerId }: { customerId: number }) {
  const [comments, setComments]     = useState<CustomerComment[]>([])
  const [loading, setLoading]       = useState(true)
  const [adding, setAdding]         = useState(false)
  const [editingId, setEditingId]   = useState<number | null>(null)
  const [saving, setSaving]         = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleting, setDeleting]     = useState(false)
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
      toast.success(res.message)
    } catch {
      toast.error('Failed to save comment')
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
      toast.success(res.message)
    } catch {
      toast.error('Failed to update comment')
    } finally {
      setSaving(false)
    }
  }

  async function handleConfirmDelete() {
    if (!deletingId) return
    setDeleting(true)
    try {
      const res = await deleteComment(customerId, deletingId)
      setComments(prev => prev.filter(c => c.id !== deletingId))
      toast.success(res.message)
      setDeletingId(null)
    } catch {
      toast.error('Failed to delete comment')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* header */}
      <div className="flex items-center justify-between pt-3 pb-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/60">
          {comments.length > 0 && `${comments.length} total`}
        </span>
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
                onDelete={id => setDeletingId(id)}
              />
            )
          )}
        </div>
      )}

      <ConfirmDialog
        open={deletingId !== null}
        title="Delete comment"
        description="This comment will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}

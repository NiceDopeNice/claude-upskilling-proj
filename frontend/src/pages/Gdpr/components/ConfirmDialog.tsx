import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, HelpCircle, Loader2 } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open, title, description,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  destructive = false, loading = false,
  onConfirm, onCancel,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={v => !v && onCancel()}>
      <DialogContent
        className="max-w-lg"
        showCloseButton={false}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter' && !loading) { e.preventDefault(); onConfirm() }
        }}
      >
        <DialogHeader className="py-2 flex flex-col items-center text-center">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-4 ${
            destructive
              ? 'bg-destructive/10 ring-destructive/20 text-destructive'
              : 'bg-primary/10 ring-primary/20 text-primary'
          }`}>
            {destructive
              ? <AlertTriangle className="h-7 w-7" />
              : <HelpCircle className="h-7 w-7" />
            }
          </div>
          <DialogTitle className="mt-4 text-lg font-semibold leading-snug">{title}</DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4 gap-2 sm:justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onCancel}
            disabled={loading}
            autoFocus={destructive}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'default'}
            size="lg"
            onClick={onConfirm}
            disabled={loading}
            autoFocus={!destructive}
            className="min-w-[120px] gap-1.5"
          >
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin" />Processing…</>
              : confirmLabel
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

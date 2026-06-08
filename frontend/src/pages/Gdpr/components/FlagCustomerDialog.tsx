import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AppSelect, SelectOption } from '@/components/AppSelect'
import { GdprExclusionType, GdprExclusionTypeOption } from '@/api/gdprApi'
import { useFlagCustomer } from '@/hooks/useFlagCustomer'
import {
  Search, Loader2, ShieldAlert, X, CheckCircle2, User,
} from 'lucide-react'

interface Props {
  readonly open: boolean
  readonly exclusionTypes: GdprExclusionTypeOption[]
  readonly onClose: () => void
  readonly onSuccess: () => void
}

export function FlagCustomerDialog({ open, exclusionTypes, onClose, onSuccess }: Props) {
  const {
    search, setSearch,
    results,
    searching,
    selected, setSelected,
    exclusionType, setExclusionType,
    submitting,
    error,
    searchCustomers,
    submit,
    reset,
  } = useFlagCustomer(() => { onSuccess() })

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Flag Customer for GDPR</DialogTitle>
              <DialogDescription>Search for a customer and select an exclusion type.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Find Customer</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Name, email or ID…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && searchCustomers()}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={searchCustomers} disabled={searching} className="gap-1.5 shrink-0">
                {searching
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Searching…</>
                  : <><Search className="h-4 w-4" /> Search</>
                }
              </Button>
            </div>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="border border-border rounded-lg divide-y divide-border max-h-48 overflow-y-auto">
              {results.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c)}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-muted/60 flex items-center gap-2.5 ${
                    selected?.id === c.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    selected?.id === c.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {selected?.id === c.id
                      ? <CheckCircle2 className="h-4 w-4" />
                      : <User className="h-3.5 w-3.5" />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className={`font-medium truncate ${selected?.id === c.id ? 'text-primary' : ''}`}>
                      {c.first_name} {c.last_name}
                      <span className="text-muted-foreground font-normal ml-2">#{c.customer_no}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{c.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected customer display */}
          {selected && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2.5 flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0 text-sm">
                <span className="font-medium">{selected.first_name} {selected.last_name}</span>
                <span className="text-muted-foreground ml-2">#{selected.customer_no} · {selected.email}</span>
              </div>
            </div>
          )}

          {/* Exclusion type */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exclusion Type</label>
            <AppSelect
              options={exclusionTypes.map(t => ({ value: t.value, label: t.label }))}
              value={exclusionType ? { value: exclusionType, label: exclusionTypes.find(t => t.value === exclusionType)?.label ?? exclusionType } : null}
              onChange={opt => setExclusionType(opt ? (opt as SelectOption).value as GdprExclusionType : '')}
              placeholder="Select exclusion type…"
              isSearchable={false}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
              <X className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="outline" onClick={handleClose} disabled={submitting} className="gap-1.5">
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!selected || !exclusionType || submitting}
            className="gap-1.5"
          >
            {submitting
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Flagging…</>
              : <><ShieldAlert className="h-4 w-4" /> Flag Customer</>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

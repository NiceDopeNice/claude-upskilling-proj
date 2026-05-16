import { useRef } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Search, SlidersHorizontal, X, Plus, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const SIMPLE_FIELDS = [
  { value: 'name',              label: 'Name'              },
  { value: 'customer_no',       label: 'Customer No.'      },
  { value: 'order_no',          label: 'Order No.'         },
  { value: 'tel',               label: 'Telephone'         },
  { value: 'pers_nr',           label: 'SSN'               },
  { value: 'email',             label: 'Email'             },
  { value: 'adress',            label: 'Address'           },
  { value: 'sinfrid_id',        label: 'Sinfrid ID'        },
  { value: 'alternative_email', label: 'Alternative Email' },
]

const PLACEHOLDERS: Record<string, string> = {
  name:              'name',
  customer_no:       'customer no.',
  order_no:          'order no.',
  tel:               'telephone',
  pers_nr:           'SSN',
  email:             'email',
  adress:            'address',
  sinfrid_id:        'sinfrid ID',
  alternative_email: 'alternative email',
}

interface ChipFilter {
  key: string
  label: string
  value: string
}

interface Props {
  mode: 'simple' | 'multi'
  onSwitchMode: (m: 'simple' | 'multi') => void
  simple: { fields: string[]; term: string }
  onUpdateSimple: (p: Partial<{ fields: string[]; term: string }>) => void
  onClearSimple: () => void
  chips: ChipFilter[]
  onUpdateChip: (key: string, value: string) => void
  onRemoveChip: (key: string) => void
  onAddChip: (chip: Omit<ChipFilter, 'value'>) => void
  onReorderChips: (chips: ChipFilter[]) => void
  availableToAdd: Omit<ChipFilter, 'value'>[]
}

function SortableChip({
  chip,
  onUpdate,
  onRemove,
}: {
  chip: ChipFilter
  onUpdate: (val: string) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: chip.key,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-1.5 bg-muted/60 border border-border rounded-lg px-2 py-1.5 min-w-0"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none"
        tabIndex={-1}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span className="text-xs font-medium text-muted-foreground whitespace-nowrap shrink-0">
        {chip.label}
      </span>
      <Input
        value={chip.value}
        onChange={e => onUpdate(e.target.value)}
        placeholder={`Search...`}
        className="h-7 text-xs w-32 border-0 bg-transparent px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <button
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground shrink-0"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function CustomerSearch({
  mode,
  onSwitchMode,
  simple,
  onUpdateSimple,
  onClearSimple,
  chips,
  onUpdateChip,
  onRemoveChip,
  onAddChip,
  onReorderChips,
  availableToAdd,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = chips.findIndex(c => c.key === active.id)
      const newIndex = chips.findIndex(c => c.key === over.id)
      onReorderChips(arrayMove(chips, oldIndex, newIndex))
    }
  }

  const toggleButton = (
    <Tooltip>
      <TooltipTrigger
        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
        onClick={() => onSwitchMode(mode === 'simple' ? 'multi' : 'simple')}
      >
        {mode === 'simple' ? (
          <SlidersHorizontal className="h-4 w-4" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </TooltipTrigger>
      <TooltipContent>
        {mode === 'simple' ? 'Switch to advanced search' : 'Switch to simple search'}
      </TooltipContent>
    </Tooltip>
  )

  if (mode === 'simple') {
    const hasActive = simple.term && simple.fields.length > 0
    const noField = simple.term && simple.fields.length === 0

    const triggerLabel = simple.fields.length === 0
      ? 'Select columns'
      : simple.fields.length === 1
        ? SIMPLE_FIELDS.find(f => f.value === simple.fields[0])?.label ?? 'Column'
        : `${simple.fields.length} columns`

    const placeholderFields = simple.fields.length === 0
      ? 'Search...'
      : `Search by ${simple.fields.map(f => PLACEHOLDERS[f] ?? f).join(', ')}...`

    const activeLabel = SIMPLE_FIELDS
      .filter(f => simple.fields.includes(f.value))
      .map(f => f.label)
      .join(', ')

    function toggleField(value: string, checked: boolean) {
      const next = checked
        ? [...simple.fields, value]
        : simple.fields.filter(v => v !== value)
      onUpdateSimple({ fields: next })
    }

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-9 w-[160px] shrink-0 items-center justify-between rounded-md border border-input bg-background px-3 text-sm font-normal shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              <span className="truncate">{triggerLabel}</span>
              <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[160px]">
              {SIMPLE_FIELDS.map(f => (
                <DropdownMenuCheckboxItem
                  key={f.value}
                  checked={simple.fields.includes(f.value)}
                  onCheckedChange={(checked: boolean) => toggleField(f.value, checked)}
                >
                  {f.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            ref={inputRef}
            value={simple.term}
            onChange={e => onUpdateSimple({ term: e.target.value })}
            placeholder={placeholderFields}
            className="h-9 flex-1"
          />

          {toggleButton}
        </div>

        {noField && (
          <p className="text-xs text-amber-600 flex items-center gap-1">
            ⚠ Please select at least one column
          </p>
        )}

        {hasActive && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">
                &quot;{simple.term}&quot; in {activeLabel}
              </span>
              <button
                onClick={onClearSimple}
                className="hover:text-foreground text-muted-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          </div>
        )}
      </div>
    )
  }

  // Multi mode
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background p-2">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={chips.map(c => c.key)} strategy={horizontalListSortingStrategy}>
          {chips.map(chip => (
            <SortableChip
              key={chip.key}
              chip={chip}
              onUpdate={val => onUpdateChip(chip.key, val)}
              onRemove={() => onRemoveChip(chip.key)}
            />
          ))}
        </SortableContext>
      </DndContext>

      {availableToAdd.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1 rounded-md px-3 text-xs hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
            <Plus className="h-3.5 w-3.5" />
            Add filter
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {availableToAdd.map(chip => (
              <DropdownMenuItem key={chip.key} onClick={() => onAddChip(chip)}>
                {chip.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="ml-auto">{toggleButton}</div>
    </div>
  )
}
